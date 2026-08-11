"""Transicoes: como um pedaco de video vira o proximo.

Cada nome em portugues aponta para uma transicao real do xfade do ffmpeg. O
Claude so escolhe daqui — se nao esta na lista, ele nao consegue pedir.

Uma transicao custa tempo: ela sobrepoe o fim de um trecho com o comeco do
outro, entao o video final fica `duracao` segundos mais curto por transicao
usada. Quem faz essa conta e o tempo.py, que trata corte, velocidade e
transicao como partes da mesma linha do tempo.
"""

from __future__ import annotations

# nome em portugues -> (transicao do xfade, quando usar)
TRANSICOES = {
    "fade": ("fade",
             "Dissolve um no outro. Neutra, serve quase sempre."),
    "fade_preto": ("fadeblack",
                   "Passa pelo preto. Marca fim de assunto ou salto de tempo."),
    "fade_branco": ("fadewhite",
                    "Passa pelo branco. Estourada, boa para virada animada."),
    "deslizar_esquerda": ("slideleft",
                          "O proximo empurra o atual para a esquerda. "
                          "Da sensacao de lista, de 'proximo item'."),
    "deslizar_cima": ("slideup",
                      "O proximo sobe por baixo. Combina com video vertical."),
    "zoom": ("zoomin",
             "Entra crescendo. Energetica, boa para revelar oferta."),
    "circulo": ("circleopen",
                "Abre em circulo do centro. Chama atencao para o meio da tela."),
    "pixelado": ("pixelize",
                 "Quebra em blocos e remonta. Cara de conteudo digital."),
    "cortina": ("wipeleft",
                "Varre a tela de um lado ao outro. Limpa e classica."),
}
# nao existe "corte seco" na lista de proposito: a ausencia de transicao JA e
# o corte seco, e um nome para "nao faca nada" so daria ao modelo uma acao
# inutil para gastar.

DISPONIVEIS = {nome: texto for nome, (_, texto) in TRANSICOES.items()}

DURACAO_PADRAO = 0.5
DURACAO_MIN = 0.1
DURACAO_MAX = 2.0


def existe(nome: str) -> bool:
    return nome in TRANSICOES


def xfade(nome: str) -> str:
    """Nome do xfade correspondente. Vazio quer dizer corte seco."""
    return TRANSICOES.get(nome, ("", ""))[0]


def limita(duracao) -> float:
    try:
        d = float(duracao)
    except (TypeError, ValueError):
        return DURACAO_PADRAO
    return round(max(DURACAO_MIN, min(DURACAO_MAX, d)), 3)
