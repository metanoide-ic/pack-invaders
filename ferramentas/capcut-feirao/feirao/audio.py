"""Trilha, abaixamento na fala e efeitos sonoros.

Duas coisas moram aqui:

  - a TRILHA: um arquivo de musica que o dono escolhe no app, colocado por
    baixo do video com volume, entrada e saida em fade e — o que realmente
    faz diferenca — abaixando sozinha quando alguem fala (`sidechaincompress`,
    o mesmo truque de radio, que no CapCut se faz na mao);
  - os SONS: efeitos pontuais (whoosh, impacto, moeda) sintetizados na hora
    pelo proprio ffmpeg. Nao ha arquivo de audio para baixar nem licenca para
    conferir: sao formulas, e por isso funcionam offline e em qualquer maquina.

O Claude escolhe qual som e em que segundo; a formula e daqui.
"""

from __future__ import annotations

import os
import subprocess

from . import media

# nome -> (duracao, fonte lavfi, filtro de audio, para que serve)
SONS = {
    "whoosh": (
        0.55,
        "anoisesrc=d=0.55:c=pink:a=0.9:r=44100",
        "highpass=f=380,lowpass=f=5200,"
        "volume='pow(sin(PI*min(1,t/0.55)),1.6)':eval=frame",
        "Passagem de ar. Acompanha corte rapido, virada de camera ou "
        "entrada de texto.",
    ),
    "impacto": (
        0.45,
        "aevalsrc='0.95*sin(2*PI*t*(130-95*t/0.45))*exp(-t*6)':d=0.45:s=44100",
        "lowpass=f=900,volume=1.0",
        "Batida grave. Marca o momento em que a oferta aparece.",
    ),
    "pop": (
        0.18,
        "aevalsrc='0.7*sin(2*PI*940*t)*exp(-t*34)':d=0.18:s=44100",
        "volume=1.0",
        "Estouro curto. Para texto que surge ou selo que bate.",
    ),
    "sino": (
        1.1,
        "aevalsrc='0.42*sin(2*PI*1318*t)*exp(-t*3.2)"
        "+0.28*sin(2*PI*1976*t)*exp(-t*4.5)':d=1.1:s=44100",
        "volume=1.0",
        "Sino claro. Confirma, aprova, fecha negocio.",
    ),
    "moeda": (
        0.7,
        "aevalsrc='(0.4*sin(2*PI*1560*t)+0.3*sin(2*PI*2340*t))*exp(-t*11)"
        "+(0.4*sin(2*PI*1760*t)+0.3*sin(2*PI*2640*t))*"
        "exp(-max(0,t-0.11)*11)*gt(t,0.11)':d=0.7:s=44100",
        "volume=1.0",
        "Dinheiro. Para preco, desconto e condicao de pagamento.",
    ),
    "clique": (
        0.09,
        "anoisesrc=d=0.09:c=white:a=0.8:r=44100",
        "highpass=f=1800,volume='exp(-t*46)':eval=frame",
        "Estalo seco. Ritmo de corte rapido, item de lista.",
    ),
    "subida": (
        1.4,
        "anoisesrc=d=1.4:c=white:a=0.75:r=44100",
        "highpass=f=520,volume='pow(t/1.4,2.4)':eval=frame",
        "Tensao que cresce. Vai ANTES do momento alto, nao em cima dele.",
    ),
}

DISPONIVEIS = {nome: SONS[nome][3] for nome in SONS}

VOLUME_TRILHA_PADRAO = 0.22       # musica sob fala pede pouco volume
FADE_ENTRADA = 0.8
FADE_SAIDA = 1.5


def existe(nome: str) -> bool:
    return nome in SONS


def duracao_som(nome: str) -> float:
    return SONS[nome][0] if nome in SONS else 0.0


def _limita(valor, minimo: float, maximo: float, padrao: float) -> float:
    try:
        return round(max(minimo, min(maximo, float(valor))), 3)
    except (TypeError, ValueError):
        return padrao


def _fmt() -> str:
    return ("aformat=sample_fmts=fltp:sample_rates=44100:"
            "channel_layouts=stereo")


def precisa(trilha: str | None, sons: list, volume_original: float) -> bool:
    """Ha algo de audio a fazer? Se nao, o executor pula o reencode."""
    return bool(trilha) or bool(sons) or abs(volume_original - 1.0) > 0.01


def aplica(entrada: str, saida: str, duracao: float,
           tem_audio: bool = True, trilha: str | None = None,
           volume_trilha: float = VOLUME_TRILHA_PADRAO,
           abaixar_na_fala: bool = True,
           volume_original: float = 1.0,
           sons: list | None = None) -> str:
    """Mistura trilha e efeitos sonoros por cima do audio que ja existe.

    `sons` sao dicionarios {nome, inicio, volume}. O video sai com a imagem
    intacta (`-c:v copy`): so a faixa de audio e refeita.
    """
    sons = [s for s in (sons or []) if existe(s.get("nome", ""))]
    volume_original = _limita(volume_original, 0.0, 2.0, 1.0)
    if not precisa(trilha, sons, volume_original):
        raise ValueError("nada de audio para aplicar")
    if trilha and not os.path.isfile(trilha):
        raise FileNotFoundError(f"trilha nao encontrada: {trilha}")

    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-i", entrada]
    partes, camadas = [], []

    # ---- audio original ------------------------------------------------
    chave = None
    if tem_audio and volume_original > 0.01:
        if trilha and abaixar_na_fala:
            # uma copia vira som, a outra vira o gatilho que abaixa a musica
            partes.append(f"[0:a]{_fmt()},volume={volume_original},"
                          f"asplit=2[voz][chave]")
            chave = "[chave]"
        else:
            partes.append(f"[0:a]{_fmt()},volume={volume_original}[voz]")
        camadas.append("[voz]")

    # ---- trilha ---------------------------------------------------------
    if trilha:
        vol = _limita(volume_trilha, 0.0, 1.0, VOLUME_TRILHA_PADRAO)
        # -stream_loop repete a musica quando ela e mais curta que o video
        cmd += ["-stream_loop", "-1", "-i", trilha]
        idx = 1
        saida_fade = max(0.1, duracao - FADE_SAIDA)
        cadeia = (f"[{idx}:a]{_fmt()},atrim=0:{duracao:.3f},"
                  f"asetpts=PTS-STARTPTS,volume={vol},"
                  f"afade=t=in:st=0:d={FADE_ENTRADA},"
                  f"afade=t=out:st={saida_fade:.3f}:d={FADE_SAIDA}")
        if chave:
            partes.append(cadeia + "[mus]")
            # threshold baixo: qualquer fala ja puxa a musica para baixo
            partes.append(f"[mus]{chave}sidechaincompress=threshold=0.02:"
                          f"ratio=9:attack=15:release=380:makeup=1[trilha]")
        else:
            partes.append(cadeia + "[trilha]")
        camadas.append("[trilha]")

    # ---- efeitos sonoros -------------------------------------------------
    proximo = 2 if trilha else 1
    for k, som in enumerate(sons):
        dur, fonte, filtro, _ = SONS[som["nome"]]
        inicio = max(0.0, float(som.get("inicio", 0.0)))
        if inicio >= duracao:
            continue
        vol = _limita(som.get("volume", 0.8), 0.0, 1.5, 0.8)
        cmd += ["-f", "lavfi", "-i", fonte]
        atraso = int(round(inicio * 1000))
        partes.append(f"[{proximo}:a]{filtro},{_fmt()},volume={vol},"
                      f"adelay={atraso}:all=1[s{k}]")
        camadas.append(f"[s{k}]")
        proximo += 1

    if not camadas:
        raise ValueError("nada de audio para aplicar")

    if len(camadas) == 1:
        partes.append(f"{camadas[0]}apad,atrim=0:{duracao:.3f},"
                      f"asetpts=PTS-STARTPTS[ao]")
    else:
        # normalize=0: a soma nao pode dividir o volume pelo numero de faixas,
        # senao cada som novo abaixa a voz
        partes.append("".join(camadas) +
                      f"amix=inputs={len(camadas)}:normalize=0:"
                      f"duration=longest,alimiter=limit=0.97,"
                      f"apad,atrim=0:{duracao:.3f},asetpts=PTS-STARTPTS[ao]")

    cmd += ["-filter_complex", ";".join(partes),
            "-map", "0:v", "-map", "[ao]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart", saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    return saida
