"""Legendas estilizadas — o visual de Reels/TikTok, queimado no video.

Gera um arquivo .ass (formato do libass, que o ffmpeg ja tem embutido) com um
evento por estado de palavra: a frase inteira aparece e a palavra que esta
sendo falada muda de cor e cresce. E isso que da o efeito de "karaoke" das
legendas virais.

Por que .ass e nao .srt: SRT nao tem estilo nenhum. O CapCut aplica o dele ao
importar, e nunca fica igual ao que voce viu no plano. Queimando com libass, o
que sai e exatamente o que voce pediu.
"""

from __future__ import annotations

import os
import subprocess

from . import fontes, media

MAX_PALAVRAS_LINHA = 3        # frases curtas leem melhor no celular

# onde a legenda fica na tela. O Claude escolhe olhando os quadros: se o
# rodape ja tem faixa de preco ou marca d'agua, ele sobe a legenda.
POSICOES = {
    "padrao": "No terco de baixo, onde a legenda costuma ficar.",
    "alta": "Acima do terco de baixo — use quando o rodape ja tiver faixa de "
            "preco, marca d'agua ou outro texto.",
    "centro": "No meio da tela. Chama muito, cobre o rosto; so em corte curto.",
}
_MARGENS = {"padrao": 1.0, "alta": 2.05, "centro": None}


def _cor(hexa: str, alpha: str = "00") -> str:
    """#RRGGBB -> &HAABBGGRR. O ASS inverte a ordem dos canais."""
    h = hexa.lstrip("#")
    if len(h) != 6:
        h = "FFFFFF"
    return f"&H{alpha}{h[4:6]}{h[2:4]}{h[0:2]}".upper()


# nome -> parametros do visual
ESTILOS = {
    "viral_amarelo": {
        "descricao": "Branco grosso com contorno preto; a palavra falada "
                     "acende em amarelo e cresce. O visual mais comum de "
                     "Reels e TikTok.",
        "familia": "impacto", "corpo": 0.065, "base": "#FFFFFF",
        "destaque": "#FFD400", "contorno": "#000000", "espessura": 7,
        "sombra": 2, "caixa": False, "escala_destaque": 112,
        "maiusculas": True, "posicao": 2, "margem": 0.20,
    },
    "viral_verde": {
        "descricao": "Igual ao amarelo, mas a palavra acende em verde limao. "
                     "Combina com conteudo de oferta e desconto.",
        "familia": "impacto", "corpo": 0.065, "base": "#FFFFFF",
        "destaque": "#3BFF6E", "contorno": "#000000", "espessura": 7,
        "sombra": 2, "caixa": False, "escala_destaque": 112,
        "maiusculas": True, "posicao": 2, "margem": 0.20,
    },
    "caixa_preta": {
        "descricao": "Texto branco dentro de uma faixa preta solida. Le bem "
                     "em qualquer fundo, ar de podcast/entrevista.",
        "familia": "impacto", "corpo": 0.060, "base": "#FFFFFF",
        "destaque": "#FFD400", "contorno": "#000000", "espessura": 12,
        "sombra": 0, "caixa": True, "escala_destaque": 100,
        "maiusculas": False, "posicao": 2, "margem": 0.14,
    },
    "uma_palavra": {
        "descricao": "Uma palavra gigante por vez no centro da tela. Prende "
                     "muito, mas cansa em video longo — use em corte curto.",
        "familia": "pesada", "corpo": 0.125, "base": "#FFFFFF",
        "destaque": "#FFFFFF", "contorno": "#000000", "espessura": 9,
        "sombra": 3, "caixa": False, "escala_destaque": 100,
        "maiusculas": True, "posicao": 5, "margem": 0.0,
    },
}

DISPONIVEIS = {nome: cfg["descricao"] for nome, cfg in ESTILOS.items()}


# --------------------------------------------------------- montagem do .ass


def _grupos(falas: list, por_linha: int) -> list:
    """Quebra as falas em grupos curtos de palavras."""
    saida = []
    for fala in falas:
        palavras = list(fala.palavras)
        if not palavras:
            continue                      # sem tempo por palavra, nao da
        for i in range(0, len(palavras), por_linha):
            grupo = palavras[i:i + por_linha]
            if grupo:
                saida.append(grupo)
    return saida


def _escapa(txt: str) -> str:
    """Neutraliza o que o ASS trataria como comando."""
    return (txt.replace("\\", "")
               .replace("{", "(").replace("}", ")")
               .strip())


def monta_ass(falas: list, estilo: str, largura: int, altura: int,
              posicao: str = "padrao") -> str:
    """Devolve o conteudo completo do arquivo .ass."""
    if estilo not in ESTILOS:
        raise KeyError(f"estilo desconhecido: {estilo}")
    if posicao not in POSICOES:
        raise KeyError(f"posicao desconhecida: {posicao}")
    cfg = ESTILOS[estilo]

    corpo = max(12, int(altura * cfg["corpo"]))
    fator = _MARGENS[posicao]
    if fator is None:                      # centro: ancora no meio da tela
        alinhamento, margem_v = 5, 0
    else:
        alinhamento = cfg["posicao"]
        margem_v = int(altura * cfg["margem"] * fator)
        if alinhamento == 5:               # estilo ja centrado ignora a margem
            margem_v = 0
    borda = 3 if cfg["caixa"] else 1          # 3 = caixa solida no ASS

    cabecalho = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {largura}
PlayResY: {altura}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, \
OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, \
ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, \
MarginR, MarginV, Encoding
Style: P,{fontes.familia(cfg['familia'])},{corpo},\
{_cor(cfg['base'])},{_cor(cfg['destaque'])},{_cor(cfg['contorno'])},\
{_cor('#000000', '80')},-1,0,0,0,100,100,0,0,{borda},\
{cfg['espessura']},{cfg['sombra']},{alinhamento},60,60,{margem_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    por_linha = 1 if estilo == "uma_palavra" else MAX_PALAVRAS_LINHA
    eventos = []
    for grupo in _grupos(falas, por_linha):
        for k, ativa in enumerate(grupo):
            ini = ativa.inicio
            # segura ate a proxima palavra para nao piscar entre uma e outra
            fim = grupo[k + 1].inicio if k + 1 < len(grupo) else ativa.fim
            fim = max(fim, ini + 0.08)

            pedacos = []
            for j, p in enumerate(grupo):
                txt = _escapa(p.texto)
                if cfg["maiusculas"]:
                    txt = txt.upper()
                if j == k:
                    esc = cfg["escala_destaque"]
                    pedacos.append(
                        f"{{\\c{_cor(cfg['destaque'])}"
                        f"\\fscx{esc}\\fscy{esc}}}{txt}"
                        f"{{\\c{_cor(cfg['base'])}\\fscx100\\fscy100}}")
                else:
                    pedacos.append(txt)
            eventos.append(
                f"Dialogue: 0,{_tempo(ini)},{_tempo(fim)},P,,0,0,0,,"
                + " ".join(pedacos))

    return cabecalho + "\n".join(eventos) + "\n"


def _tempo(segundos: float) -> str:
    """h:mm:ss.cc — o ASS usa centesimos, nao milesimos."""
    segundos = max(0.0, segundos)
    total = int(segundos)
    cs = int(round((segundos - total) * 100))
    if cs == 100:
        total, cs = total + 1, 0
    h, resto = divmod(total, 3600)
    m, s = divmod(resto, 60)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def salva_ass(falas: list, estilo: str, destino: str,
              largura: int, altura: int, posicao: str = "padrao") -> str:
    conteudo = monta_ass(falas, estilo, largura, altura, posicao)
    os.makedirs(os.path.dirname(os.path.abspath(destino)), exist_ok=True)
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(conteudo)
    return destino


# ------------------------------------------------------------- queimar


def _para_filtro(caminho: str) -> str:
    """Escapa o caminho para dentro do filtro do ffmpeg.

    No Windows, `C:\\Users\\...` tem barras e dois-pontos que o parser de
    filtros do ffmpeg engole se nao forem escapados.
    """
    p = caminho.replace("\\", "/")
    p = p.replace(":", "\\\\:")
    return p.replace("'", "\\\\'")


def queima(entrada: str, ass: str, saida: str, progresso=None) -> str:
    """Grava as legendas dentro do video, com a fonte embutida do app."""
    if progresso:
        progresso("queimando as legendas no video...")

    filtro = f"subtitles='{_para_filtro(ass)}'"
    pasta = fontes.PASTA
    if os.path.isdir(pasta):
        filtro += f":fontsdir='{_para_filtro(pasta)}'"

    info = media.sonda(entrada)
    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-i", entrada,
           "-vf", filtro, "-c:v", "libx264", "-preset", "medium", "-crf", "18"]
    cmd += ["-c:a", "copy"] if info.tem_audio else ["-an"]
    cmd += [saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    return saida


def tem_tempo_por_palavra(falas: list) -> bool:
    """Legenda estilizada so existe se a transcricao trouxe as palavras."""
    return any(f.palavras for f in falas)
