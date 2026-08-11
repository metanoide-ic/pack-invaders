"""Transcricao da fala e geracao de legendas em SRT.

O SRT sai pronto para o "Importar legendas" do proprio CapCut, entao esta
parte funciona sem depender do formato interno dos projetos.

A transcricao roda na sua maquina (nada sobe para a internet), via
faster-whisper. Sem ele instalado, o resto do app continua funcionando.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

MODELOS = ["tiny", "base", "small", "medium", "large-v3"]
MODELO_PADRAO = "small"          # equilibrio entre velocidade e acerto
MAX_CARACTERES = 42              # por linha, para caber na tela do celular


@dataclass
class Palavra:
    """Uma palavra com o instante exato em que foi dita.

    E o dado que faz a legenda viral existir: sem ele nao da para destacar a
    palavra que esta sendo falada.
    """
    inicio: float
    fim: float
    texto: str


@dataclass
class Fala:
    inicio: float
    fim: float
    texto: str
    palavras: list = field(default_factory=list)


def disponivel() -> bool:
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


def transcreve(caminho: str, modelo: str = MODELO_PADRAO,
               idioma: str = "pt", progresso=None,
               por_palavra: bool = True) -> list[Fala]:
    """Transcreve o audio e devolve as falas com tempo.

    `por_palavra` traz tambem o tempo de cada palavra — custa pouco a mais e e
    obrigatorio para as legendas estilizadas.
    """
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
                                    word_timestamps=por_palavra)

    falas = []
    for seg in segmentos:
        texto = (seg.text or "").strip()
        if not texto:
            continue
        palavras = []
        for p in (getattr(seg, "words", None) or []):
            limpo = (p.word or "").strip()
            if limpo:
                palavras.append(Palavra(float(p.start), float(p.end), limpo))
        falas.append(Fala(float(seg.start), float(seg.end), texto, palavras))
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


def remapeia(falas: list[Fala], linha) -> list[Fala]:
    """Reposiciona as legendas segundo a linha do tempo inteira.

    Diferente de `desloca`, aqui entra tambem velocidade e transicao: uma fala
    em camera lenta dura mais na saida, e quem sabe converter isso e o
    `tempo.LinhaDoTempo`. Palavra que caiu num corte simplesmente some.
    """
    if linha is None or not linha.trechos:
        return falas

    novas = []
    for fala in falas:
        palavras = []
        for p in fala.palavras:
            ini = linha.converte(p.inicio)
            if ini is None:
                continue
            fim = linha.converte(max(p.inicio, p.fim - 0.001))
            if fim is None or fim <= ini:
                fim = ini + linha.converte_duracao(
                    p.inicio, max(0.05, p.fim - p.inicio))
            palavras.append(Palavra(round(ini, 3), round(fim, 3), p.texto))

        if palavras:
            novas.append(Fala(palavras[0].inicio, palavras[-1].fim,
                              fala.texto, palavras))
            continue

        # fala sem tempo por palavra: converte so as duas pontas
        ini = linha.converte(fala.inicio)
        if ini is None:
            continue
        fim = linha.converte(max(fala.inicio, fala.fim - 0.001))
        if fim is None or fim - ini < 0.05:
            fim = ini + linha.converte_duracao(
                fala.inicio, max(0.2, fala.fim - fala.inicio))
        novas.append(Fala(round(ini, 3), round(fim, 3), fala.texto, []))
    return novas


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
                    deslocamento = decorrido - ini
                    palavras = [
                        Palavra(round(pl.inicio + deslocamento, 3),
                                round(pl.fim + deslocamento, 3), pl.texto)
                        for pl in fala.palavras
                        if ini <= pl.inicio < fim]
                    novas.append(Fala(round(novo_ini, 3), round(novo_fim, 3),
                                      fala.texto, palavras))
                break
            decorrido += fim - ini
    return novas
