"""Transcricao da fala e geracao de legendas em SRT.

O SRT sai pronto para o "Importar legendas" do proprio CapCut, entao esta
parte funciona sem depender do formato interno dos projetos.

A transcricao roda na sua maquina (nada sobe para a internet), via
faster-whisper. Sem ele instalado, o resto do app continua funcionando.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

MODELOS = ["tiny", "base", "small", "medium", "large-v3"]
MODELO_PADRAO = "small"          # equilibrio entre velocidade e acerto
MAX_CARACTERES = 42              # por linha, para caber na tela do celular


@dataclass
class Fala:
    inicio: float
    fim: float
    texto: str


def disponivel() -> bool:
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


def transcreve(caminho: str, modelo: str = MODELO_PADRAO,
               idioma: str = "pt", progresso=None) -> list[Fala]:
    """Transcreve o audio do video e devolve as falas com tempo."""
    try:
        from faster_whisper import WhisperModel
    except ImportError as erro:
        raise RuntimeError(
            "faster-whisper nao esta instalado.\n"
            "Rode: pip install faster-whisper") from erro

    if progresso:
        progresso(f"carregando o modelo '{modelo}' (a 1a vez baixa)...")
    # int8 na CPU: roda em qualquer maquina, sem placa de video
    motor = WhisperModel(modelo, device="cpu", compute_type="int8")

    if progresso:
        progresso("ouvindo o audio...")
    segmentos, _ = motor.transcribe(caminho, language=idioma,
                                    vad_filter=True,
                                    word_timestamps=False)

    falas = []
    for seg in segmentos:
        texto = (seg.text or "").strip()
        if texto:
            falas.append(Fala(float(seg.start), float(seg.end), texto))
            if progresso and len(falas) % 10 == 0:
                progresso(f"{len(falas)} falas transcritas...")
    return falas


def quebra_linhas(texto: str, largura: int = MAX_CARACTERES) -> str:
    """Quebra em no maximo duas linhas, sem cortar palavra no meio."""
    if len(texto) <= largura:
        return texto
    palavras = texto.split()
    linha, linhas = "", []
    for palavra in palavras:
        if linha and len(linha) + 1 + len(palavra) > largura:
            linhas.append(linha)
            linha = palavra
        else:
            linha = f"{linha} {palavra}".strip()
    if linha:
        linhas.append(linha)
    return "\n".join(linhas[:2]) if len(linhas) <= 2 else \
        "\n".join([linhas[0], " ".join(linhas[1:])])


def _carimbo(segundos: float) -> str:
    if segundos < 0:
        segundos = 0.0
    total = int(segundos)
    ms = int(round((segundos - total) * 1000))
    if ms == 1000:                      # o arredondamento pode estourar
        total, ms = total + 1, 0
    h, resto = divmod(total, 3600)
    m, s = divmod(resto, 60)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def para_srt(falas: list[Fala], largura: int = MAX_CARACTERES) -> str:
    blocos = []
    for i, fala in enumerate(falas, start=1):
        fim = max(fala.fim, fala.inicio + 0.2)      # legenda piscada nao le
        blocos.append(f"{i}\n"
                      f"{_carimbo(fala.inicio)} --> {_carimbo(fim)}\n"
                      f"{quebra_linhas(fala.texto, largura)}\n")
    return "\n".join(blocos)


def salva_srt(falas: list[Fala], destino: str,
              largura: int = MAX_CARACTERES) -> str:
    os.makedirs(os.path.dirname(os.path.abspath(destino)), exist_ok=True)
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(para_srt(falas, largura))
    return destino


def desloca(falas: list[Fala], trechos: list[tuple[float, float]]) -> list[Fala]:
    """Reposiciona as legendas depois de um corte de silencios.

    Falas que cairam dentro do que foi cortado somem; as demais andam para
    tras conforme o tempo removido antes delas.
    """
    if not trechos:
        return falas

    novas = []
    for fala in falas:
        decorrido = 0.0
        for (ini, fim) in trechos:
            if fala.inicio < fim and fala.fim > ini:      # sobrepoe o trecho
                novo_ini = max(fala.inicio, ini) - ini + decorrido
                novo_fim = min(fala.fim, fim) - ini + decorrido
                if novo_fim - novo_ini > 0.05:
                    novas.append(Fala(round(novo_ini, 3), round(novo_fim, 3),
                                      fala.texto))
                break
            decorrido += fim - ini
    return novas
