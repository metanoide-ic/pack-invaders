"""Ponte com o ffmpeg: sondagem, deteccao de silencio e corte de video."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from dataclasses import dataclass


def _acha_binario(nome: str) -> str:
    """Devolve o caminho do ffmpeg/ffprobe: PATH do sistema ou o do pip."""
    do_sistema = shutil.which(nome) or shutil.which(nome + ".exe")
    if do_sistema:
        return do_sistema
    try:
        import imageio_ffmpeg

        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if nome == "ffmpeg":
            return exe
        # o pacote do pip so traz o ffmpeg; ffprobe vira "ffmpeg -i"
        return ""
    except Exception:
        return ""


def ffmpeg() -> str:
    exe = _acha_binario("ffmpeg")
    if not exe:
        raise RuntimeError(
            "ffmpeg nao encontrado. Rode: pip install imageio-ffmpeg")
    return exe


def _roda(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(args, capture_output=True, text=True,
                          encoding="utf-8", errors="replace")


@dataclass
class InfoMidia:
    caminho: str
    duracao: float
    largura: int
    altura: int
    fps: float
    tem_audio: bool


def sonda(caminho: str) -> InfoMidia:
    """Le duracao/resolucao/fps sem depender do ffprobe."""
    if not os.path.isfile(caminho):
        raise FileNotFoundError(caminho)

    ffprobe = _acha_binario("ffprobe")
    if ffprobe:
        r = _roda([ffprobe, "-v", "error", "-print_format", "json",
                   "-show_format", "-show_streams", caminho])
        dados = json.loads(r.stdout or "{}")
        fluxos = dados.get("streams", [])
        v = next((s for s in fluxos if s.get("codec_type") == "video"), {})
        tem_audio = any(s.get("codec_type") == "audio" for s in fluxos)
        dur = float(dados.get("format", {}).get("duration") or 0.0)
        return InfoMidia(caminho, dur,
                         int(v.get("width") or 0), int(v.get("height") or 0),
                         _fracao(v.get("r_frame_rate")), tem_audio)

    # sem ffprobe: extrai do texto que o ffmpeg imprime
    r = _roda([ffmpeg(), "-hide_banner", "-i", caminho])
    txt = r.stderr
    dur = 0.0
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.?\d*)", txt)
    if m:
        dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    larg = alt = 0
    m = re.search(r"Video:.*?(\d{2,5})x(\d{2,5})", txt)
    if m:
        larg, alt = int(m.group(1)), int(m.group(2))
    fps = 0.0
    m = re.search(r"(\d+\.?\d*)\s*fps", txt)
    if m:
        fps = float(m.group(1))
    return InfoMidia(caminho, dur, larg, alt, fps, "Audio:" in txt)


def _fracao(txt) -> float:
    if not txt:
        return 0.0
    if "/" in str(txt):
        a, b = str(txt).split("/")
        return float(a) / float(b) if float(b) else 0.0
    return float(txt)


# ------------------------------------------------------------ silencio


def acha_silencios(caminho: str, ruido_db: float = -32.0,
                   minimo: float = 0.45) -> list[tuple[float, float]]:
    """Devolve os trechos de silencio como (inicio, fim) em segundos."""
    r = _roda([ffmpeg(), "-hide_banner", "-i", caminho,
               "-af", f"silencedetect=noise={ruido_db}dB:d={minimo}",
               "-f", "null", "-"])
    silencios: list[tuple[float, float]] = []
    inicio = None
    for linha in r.stderr.splitlines():
        m = re.search(r"silence_start:\s*(-?\d+\.?\d*)", linha)
        if m:
            inicio = max(0.0, float(m.group(1)))
            continue
        m = re.search(r"silence_end:\s*(-?\d+\.?\d*)", linha)
        if m and inicio is not None:
            silencios.append((inicio, float(m.group(1))))
            inicio = None
    if inicio is not None:
        silencios.append((inicio, sonda(caminho).duracao))
    return silencios


def trechos_uteis(duracao: float, silencios: list[tuple[float, float]],
                  margem: float = 0.12,
                  minimo_trecho: float = 0.35) -> list[tuple[float, float]]:
    """Inverte os silencios: devolve o que deve ficar no corte final.

    `margem` devolve um respiro nas pontas para a fala nao ficar decepada.
    """
    if duracao <= 0:
        return []
    if not silencios:
        return [(0.0, duracao)]

    manter: list[tuple[float, float]] = []
    cursor = 0.0
    for (si, sf) in sorted(silencios):
        fim = min(si + margem, duracao)
        if fim - cursor >= minimo_trecho:
            manter.append((round(max(0.0, cursor), 3), round(fim, 3)))
        cursor = max(cursor, sf - margem)
    if duracao - cursor >= minimo_trecho:
        manter.append((round(max(0.0, cursor), 3), round(duracao, 3)))

    # junta trechos colados (a margem pode ter fechado o buraco)
    juntos: list[tuple[float, float]] = []
    for t in manter:
        if juntos and t[0] - juntos[-1][1] < 0.05:
            juntos[-1] = (juntos[-1][0], t[1])
        else:
            juntos.append(t)
    return juntos


def corta(entrada: str, saida: str, trechos: list[tuple[float, float]],
          progresso=None) -> str:
    """Exporta um MP4 so com os trechos pedidos, na ordem dada."""
    if not trechos:
        raise ValueError("nenhum trecho para exportar")

    partes = []
    for i, (ini, fim) in enumerate(trechos):
        partes.append(
            f"[0:v]trim=start={ini}:end={fim},setpts=PTS-STARTPTS[v{i}];"
            f"[0:a]atrim=start={ini}:end={fim},asetpts=PTS-STARTPTS[a{i}]")
    entradas = "".join(f"[v{i}][a{i}]" for i in range(len(trechos)))
    filtro = ";".join(partes) + ";" + entradas + \
        f"concat=n={len(trechos)}:v=1:a=1[vo][ao]"

    if progresso:
        progresso(f"juntando {len(trechos)} trechos...")
    r = _roda([ffmpeg(), "-y", "-hide_banner", "-i", entrada,
               "-filter_complex", filtro, "-map", "[vo]", "-map", "[ao]",
               "-c:v", "libx264", "-preset", "medium", "-crf", "18",
               "-c:a", "aac", "-b:a", "192k", saida])
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    return saida
