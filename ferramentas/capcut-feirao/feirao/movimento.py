"""Keyframes: movimento de camera em trechos do video.

O CapCut chama isso de keyframe — voce marca um comeco e um fim e a imagem
se move entre os dois. Aqui o movimento e descrito como formula: para cada
instante, quanto de zoom e qual o deslocamento.

Detalhe tecnico que moldou o modulo: `zoompan` e `crop` sao os dois filtros
que fazem movimento no ffmpeg, e nenhum dos dois aceita `enable=between(...)`
para ligar so num trecho. Entao em vez de um filtro por movimento, tudo vira
UMA expressao com `if(between(t, ...))` aninhados — um passe so, sem perda de
qualidade por reencode repetido.
"""

from __future__ import annotations

import subprocess

from . import media

# nome -> (descricao para o Claude, tipo interno)
MOVIMENTOS = {
    "zoom_in": ("Aproxima devagar. O mais usado: da vida a foto parada e "
                "puxa o olho para o centro.", "zoom"),
    "zoom_out": ("Afasta devagar, revelando o contexto. Bom para abrir uma "
                 "cena ou mostrar o carro inteiro.", "zoom"),
    "pan_direita": ("Varre a imagem da esquerda para a direita.", "pan"),
    "pan_esquerda": ("Varre da direita para a esquerda.", "pan"),
    "pan_cima": ("Sobe pela imagem. Bom para revelar de baixo para cima.",
                 "pan"),
    "pan_baixo": ("Desce pela imagem.", "pan"),
    "tremor": ("Tremida rapida, como camera na mao. Use em impacto, susto "
               "ou palavra forte. Curto: 0.3 a 0.8 segundos.", "tremor"),
    "pulso": ("Batida ritmica de zoom. Use na batida da musica ou para "
              "marcar uma sequencia de itens.", "pulso"),
}

DISPONIVEIS = {nome: desc for nome, (desc, _) in MOVIMENTOS.items()}

# quanto de folga a imagem ganha para poder se mover sem mostrar borda
_ZOOM_BASE_PAN = 1.22
_ESCALA_FONTE = 2         # dobra a fonte antes de mexer, senao amolece


def _clamp(expr: str) -> str:
    """Prende o progresso entre 0 e 1 — fora do trecho ele passa disso."""
    return f"max(0\\,min(1\\,{expr}))"


def expressoes(movimentos: list, fps: int) -> tuple:
    """Monta as tres expressoes (zoom, x, y) para o zoompan.

    `movimentos` sao dicionarios com nome, inicio, duracao e intensidade.
    Trechos sem movimento ficam com zoom 1 e centralizados.
    """
    t = f"(on/{fps})"
    z_expr, x_expr, y_expr = "1", None, None

    # constroi de tras para frente: o primeiro da lista fica por fora e vence
    for mv in reversed(movimentos):
        nome = mv["nome"]
        if nome not in MOVIMENTOS:
            continue
        tipo = MOVIMENTOS[nome][1]
        a = float(mv["inicio"])
        b = a + max(0.05, float(mv.get("duracao", 1.0)))
        k = max(0.05, min(1.5, float(mv.get("intensidade", 1.0))))
        p = _clamp(f"({t}-{a})/{b - a}")
        dentro = f"between({t}\\,{a}\\,{b})"

        if tipo == "zoom":
            alvo = 1 + 0.28 * k
            z = (f"(1+{alvo - 1:.4f}*{p})" if nome == "zoom_in"
                 else f"({alvo:.4f}-{alvo - 1:.4f}*{p})")
            z_expr = f"if({dentro}\\,{z}\\,{z_expr})"

        elif tipo == "pan":
            z_expr = f"if({dentro}\\,{_ZOOM_BASE_PAN}\\,{z_expr})"
            # margem disponivel depois do zoom, em coordenadas de entrada
            margem = f"(iw-iw/zoom)"
            margem_v = f"(ih-ih/zoom)"
            avanco = f"({p})" if nome in ("pan_direita", "pan_baixo") \
                else f"(1-{p})"
            if nome in ("pan_direita", "pan_esquerda"):
                novo_x = f"({margem}*{avanco})"
                x_expr = f"if({dentro}\\,{novo_x}\\,{x_expr or _centro_x()})"
            else:
                novo_y = f"({margem_v}*{avanco})"
                y_expr = f"if({dentro}\\,{novo_y}\\,{y_expr or _centro_y()})"

        elif tipo == "tremor":
            z_expr = f"if({dentro}\\,{1 + 0.06 * k:.4f}\\,{z_expr})"
            # duas senoides fora de fase: nao repete o mesmo caminho
            amp = 14 * k
            tx = f"({_centro_x()}+{amp:.2f}*sin({t}*47))"
            ty = f"({_centro_y()}+{amp:.2f}*sin({t}*61+1.7))"
            x_expr = f"if({dentro}\\,{tx}\\,{x_expr or _centro_x()})"
            y_expr = f"if({dentro}\\,{ty}\\,{y_expr or _centro_y()})"

        elif tipo == "pulso":
            # abs(sin) bate e volta; 2.2 Hz e proximo de musica de feirao
            z = f"(1+{0.07 * k:.4f}*abs(sin(({t}-{a})*6.9)))"
            z_expr = f"if({dentro}\\,{z}\\,{z_expr})"

    return z_expr, (x_expr or _centro_x()), (y_expr or _centro_y())


def _centro_x() -> str:
    return "iw/2-(iw/zoom/2)"


def _centro_y() -> str:
    return "ih/2-(ih/zoom/2)"


def filtro(movimentos: list, largura: int, altura: int, fps: int) -> str:
    """Cadeia de filtros completa para aplicar todos os movimentos."""
    z, x, y = expressoes(movimentos, fps)
    return (f"scale={largura * _ESCALA_FONTE}:{altura * _ESCALA_FONTE},"
            f"zoompan=z='{z}':x='{x}':y='{y}'"
            f":d=1:s={largura}x{altura}:fps={fps}")


def aplica(entrada: str, saida: str, movimentos: list,
           progresso=None) -> str:
    """Renderiza o video com os movimentos aplicados."""
    if not movimentos:
        raise ValueError("nenhum movimento para aplicar")
    info = media.sonda(entrada)
    fps = int(round(info.fps)) or 30
    if progresso:
        progresso(f"aplicando {len(movimentos)} movimento(s) de camera...")

    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-i", entrada,
           "-vf", filtro(movimentos, info.largura, info.altura, fps),
           "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p"]
    cmd += ["-c:a", "copy"] if info.tem_audio else ["-an"]
    cmd += [saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    return saida
