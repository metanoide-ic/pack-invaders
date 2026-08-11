"""Efeitos visuais aplicados em trechos do video.

Diferente do movimento (que e uma formula dentro do zoompan), aqui cada efeito
e um filtro do ffmpeg com `enable='between(t,a,b)'` — so os filtros que
suportam recorte no tempo entram nesta lista. Isso permite empilhar varios
efeitos em trechos diferentes num passe so.
"""

from __future__ import annotations

import subprocess

from . import media

# nome -> (descricao para o Claude, funcao que monta o filtro)
# cada funcao recebe a intensidade (0..1.5) e devolve o filtro sem o enable


def _flash(k: float) -> str:
    return f"eq=brightness={min(0.75, 0.5 * k):.3f}:contrast={1 + 0.15 * k:.3f}"


def _vinheta(k: float) -> str:
    # angulo menor = vinheta mais fechada
    return f"vignette=angle={max(0.6, 1.3 - 0.5 * k):.3f}"


def _grao(k: float) -> str:
    return f"noise=alls={int(6 + 18 * k)}:allf=t+u"


def _desfoque(k: float) -> str:
    return f"gblur=sigma={0.8 + 5.0 * k:.2f}"


def _glitch(k: float) -> str:
    # separa os canais de cor: o visual de sinal falhando
    return f"chromashift=cbh={int(6 * k)}:crv={int(-6 * k)}"


def _preto_e_branco(k: float) -> str:
    return f"hue=s={max(0.0, 1 - k):.3f}"


def _saturar(k: float) -> str:
    return f"eq=saturation={1 + 0.7 * k:.3f}:contrast={1 + 0.12 * k:.3f}"


def _estrobo(k: float) -> str:
    """Pisca o brilho. `eval=frame` faz o ffmpeg recalcular a cada quadro —
    sem isso a expressao e avaliada uma vez so e nao pisca nada."""
    return f"eq=brightness=({0.42 * k:.3f}*sin(t*26)):eval=frame"


EFEITOS = {
    "flash": ("Clarao branco rapido. Use na virada de cena ou no impacto de "
              "uma palavra. Muito curto: 0.1 a 0.3 segundos.", _flash),
    "vinheta": ("Escurece as bordas e fecha o olho no centro. Bom em "
                "depoimento e closes.", _vinheta),
    "grao": ("Granulado de filme. Da textura e ar de gravacao real.", _grao),
    "desfoque": ("Desfoca. Use para esconder o fundo por um instante ou "
                 "abrir/fechar uma cena.", _desfoque),
    "glitch": ("Separa as cores como sinal falhando. Use em transicao brusca "
               "ou para marcar um susto. Curto.", _glitch),
    "preto_e_branco": ("Tira a cor. Use no 'antes' de um antes-e-depois, ou "
                       "para dar peso a uma frase.", _preto_e_branco),
    "saturar": ("Estoura a cor num trecho so. Use quando o produto aparece.",
                _saturar),
    "estrobo": ("Pisca o brilho rapido, tipo luz de balada. Use em virada "
                "de beat ou em sequencia acelerada. Curto: ate 1 segundo.",
                _estrobo),
}

DISPONIVEIS = {nome: desc for nome, (desc, _) in EFEITOS.items()}


def filtro_de(nome: str, inicio: float, duracao: float,
              intensidade: float = 1.0) -> str:
    """Um efeito com recorte no tempo."""
    if nome not in EFEITOS:
        raise KeyError(f"efeito desconhecido: {nome}")
    k = max(0.05, min(1.5, float(intensidade)))
    fim = inicio + max(0.05, duracao)
    base = EFEITOS[nome][1](k)
    return f"{base}:enable='between(t,{inicio:.3f},{fim:.3f})'"


def cadeia(lista: list) -> str:
    """Empilha varios efeitos numa cadeia unica de filtros."""
    partes = []
    for e in lista:
        partes.append(filtro_de(e["nome"], float(e["inicio"]),
                                float(e.get("duracao", 0.5)),
                                float(e.get("intensidade", 1.0))))
    return ",".join(partes)


def aplica(entrada: str, saida: str, lista: list, progresso=None) -> str:
    """Renderiza o video com todos os efeitos aplicados de uma vez."""
    if not lista:
        raise ValueError("nenhum efeito para aplicar")
    if progresso:
        progresso(f"aplicando {len(lista)} efeito(s)...")

    info = media.sonda(entrada)
    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-i", entrada,
           "-vf", cadeia(lista),
           "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p"]
    cmd += ["-c:a", "copy"] if info.tem_audio else ["-an"]
    cmd += [saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    return saida
