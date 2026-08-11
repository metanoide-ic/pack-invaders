"""Onde estao as fontes do app.

As fontes vao embutidas na pasta `fontes/` (licenca OFL, redistribuicao
permitida) para o visual sair identico em qualquer computador. Sem isso, o
Windows caia no Arial e a legenda ficava com outra cara.
"""

from __future__ import annotations

import os

PASTA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                     "fontes")

# apelido -> (arquivo embutido, nome interno da familia para o libass)
FAMILIAS = {
    "impacto": ("Outfit-Bold.ttf", "Outfit"),
    "condensada": ("BigShoulders-Bold.ttf", "Big Shoulders"),
    "pesada": ("EricaOne-Regular.ttf", "Erica One"),
}

# usadas quando a pasta embutida sumir (usuario copiou so o .py, por exemplo)
_RESERVAS = [
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
]


def caminho(apelido: str = "impacto") -> str:
    """Caminho do arquivo .ttf. Nunca levanta — sempre devolve algo usavel."""
    arquivo = FAMILIAS.get(apelido, FAMILIAS["impacto"])[0]
    embutida = os.path.join(PASTA, arquivo)
    if os.path.isfile(embutida):
        return embutida
    for reserva in _RESERVAS:
        if os.path.isfile(reserva):
            return reserva
    return ""


def familia(apelido: str = "impacto") -> str:
    """Nome que o libass usa para casar a fonte dentro do arquivo .ass."""
    return FAMILIAS.get(apelido, FAMILIAS["impacto"])[1]


def carrega(apelido: str, tamanho: int):
    """Objeto de fonte do Pillow, com reserva se nada for encontrado."""
    from PIL import ImageFont
    c = caminho(apelido)
    if c:
        try:
            return ImageFont.truetype(c, tamanho,
                                      layout_engine=ImageFont.Layout.BASIC)
        except Exception:
            pass
    return ImageFont.load_default()


def embutidas_presentes() -> bool:
    return all(os.path.isfile(os.path.join(PASTA, arq))
               for arq, _ in FAMILIAS.values())
