"""Recorte da pessoa, quadro a quadro — o que faz o texto ficar ATRAS dela.

O truque e o mesmo do CapCut: duas copias do mesmo video, o texto entre elas,
e a copia de cima com o fundo removido. A diferenca e que aqui o "Remover
fundo" acontece sozinho: cada quadro do trecho vai para uma rede de
segmentacao (rembg/u2net) que devolve so a pessoa, com transparencia.

E caro — cerca de um segundo de CPU por quadro — entao o trecho e limitado a
poucos segundos e o app avisa antes de comecar. Sem a biblioteca instalada
nada quebra: o executor volta a escrever a instrucao manual no roteiro.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile

from . import media

MODELO = "u2netp"          # versao leve: 4 MB, ~1s por quadro numa CPU comum
DURACAO_MAX = 5.0          # acima disso a espera deixa de valer a pena


def disponivel() -> bool:
    try:
        import rembg  # noqa: F401
        return True
    except Exception:
        return False


def instrucao_de_instalacao() -> str:
    return ("Para o texto passar atras da pessoa sozinho, instale:\n"
            "  pip install rembg onnxruntime\n"
            "Na primeira vez ele baixa um modelo de 5 MB.")


def _extrai_quadros(video: str, inicio: float, duracao: float, fps: int,
                    pasta: str) -> int:
    """Tira os quadros do trecho em PNG numerado."""
    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-v", "error",
           "-ss", f"{inicio:.3f}", "-i", video, "-t", f"{duracao:.3f}",
           "-vf", f"fps={fps}", "-start_number", "0",
           os.path.join(pasta, "%05d.png")]
    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1200:])
    return len([n for n in os.listdir(pasta) if n.endswith(".png")])


def camada_pessoa(video: str, inicio: float, duracao: float, fps: int,
                  pasta_destino: str, progresso=None) -> dict:
    """Gera a sequencia de PNGs com so a pessoa, fundo transparente.

    Devolve {'pasta', 'quadros', 'fps', 'inicio', 'duracao'}.
    """
    try:
        from rembg import new_session, remove
    except Exception as erro:
        raise RuntimeError(instrucao_de_instalacao()) from erro

    from PIL import Image

    duracao = min(float(duracao), DURACAO_MAX)
    os.makedirs(pasta_destino, exist_ok=True)
    bruto = tempfile.mkdtemp(prefix="feirao_quadros_")
    try:
        total = _extrai_quadros(video, inicio, duracao, fps, bruto)
        if not total:
            raise RuntimeError("nao consegui tirar quadros desse trecho")

        if progresso:
            progresso(f"  recortando a pessoa em {total} quadro(s) "
                      f"(~{total} s)...")
        sessao = new_session(MODELO)
        for i in range(total):
            origem = os.path.join(bruto, f"{i:05d}.png")
            if not os.path.isfile(origem):
                continue
            with Image.open(origem) as img:
                recortada = remove(img.convert("RGB"), session=sessao)
            recortada.save(os.path.join(pasta_destino, f"{i:05d}.png"))
            if progresso and total > 20 and (i + 1) % 20 == 0:
                progresso(f"    {i + 1}/{total}")
    finally:
        shutil.rmtree(bruto, ignore_errors=True)

    return {"pasta": pasta_destino, "quadros": total, "fps": fps,
            "inicio": round(inicio, 3), "duracao": round(duracao, 3)}
