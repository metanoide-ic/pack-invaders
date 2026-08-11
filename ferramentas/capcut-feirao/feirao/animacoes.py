"""Biblioteca de animacoes geradas na hora, em fundo verde (chroma key).

Cada animacao vira um MP4 que voce sobrepoe no CapCut e chaveia o verde. Sao
desenhadas por codigo, entao o texto muda conforme a fala do video: "rasgando
preco" gera um papel escrito PRECO sendo rasgado.

REGISTRO e a fonte da verdade: o vocabulario que o Claude enxerga (em
acoes.py) e montado a partir daqui, entao o modelo nunca consegue pedir uma
animacao que nao existe.
"""

from __future__ import annotations

import math
import os
import random
import subprocess

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

from . import media

VERDE = (0, 177, 64)
# o mesmo verde no formato que o colorkey do ffmpeg entende, para o executor
# conseguir chavear sozinho sem ninguem repetir o numero na mao
VERDE_HEX = "0x%02X%02X%02X" % VERDE
FPS = 30

FONT_DIR = "/mnt/skills/examples/canvas-design/canvas-fonts"
_FONTES = [os.path.join(FONT_DIR, "BigShoulders-Bold.ttf"),
           "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
           "C:\\Windows\\Fonts\\arialbd.ttf"]


def _fonte(tam: int):
    for caminho in _FONTES:
        if os.path.isfile(caminho):
            try:
                return ImageFont.truetype(caminho, tam,
                                          layout_engine=ImageFont.Layout.BASIC)
            except Exception:
                continue
    return ImageFont.load_default()


def _texto_centrado(d, xy, txt, f, cor):
    """Desenha centralizado sem depender do anchor (varia entre versoes)."""
    bb = f.getbbox(txt)
    d.text((xy[0] - (bb[2] + bb[0]) / 2, xy[1] - (bb[3] + bb[1]) / 2),
           txt, font=f, fill=cor)


def _grava(quadros, saida: str, fps: int = FPS) -> str:
    """Codifica uma lista de imagens RGB em MP4."""
    if not quadros:
        raise ValueError("nenhum quadro para gravar")
    w, h = quadros[0].size
    os.makedirs(os.path.dirname(os.path.abspath(saida)), exist_ok=True)
    proc = subprocess.Popen(
        [media.ffmpeg(), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{w}x{h}", "-r", str(fps), "-i", "-", "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "16",
         "-pix_fmt", "yuv420p", saida],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE)
    for q in quadros:
        proc.stdin.write(q.tobytes())
    proc.stdin.close()
    err = proc.stderr.read().decode(errors="replace")
    if proc.wait() != 0:
        raise RuntimeError(err[-800:])
    return saida


def _ease_out(t: float) -> float:
    return 1 - (1 - t) ** 3


# ------------------------------------------------------------ rasgar papel


def _folha(texto: str, w: int, h: int) -> Image.Image:
    """Um papel bege com a palavra escrita em tinta escura."""
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=10,
                        fill=(246, 241, 228, 255))
    # fibra do papel: riscos claros bem sutis
    rnd = random.Random(7)
    for _ in range(int(w * h / 900)):
        x, y = rnd.randrange(w), rnd.randrange(h)
        tom = 236 + rnd.randrange(14)
        d.point((x, y), fill=(tom, tom - 4, tom - 14, 255))
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=10,
                        outline=(206, 196, 176, 255), width=3)

    tam = int(h * 0.52)
    f = _fonte(tam)
    while tam > 12 and f.getbbox(texto)[2] > w * 0.84:
        tam = int(tam * 0.9)
        f = _fonte(tam)
    _texto_centrado(d, (w / 2, h / 2), texto, f, (28, 26, 24, 255))
    return img


def _trilha_rasgo(h: int, largura_jitter: int, semente: int) -> list:
    """Linha irregular de cima a baixo — por onde o papel se parte."""
    rnd = random.Random(semente)
    pontos, x = [], 0
    for i in range(0, h + 12, 12):
        x += rnd.randint(-largura_jitter, largura_jitter)
        x = max(-largura_jitter * 3, min(largura_jitter * 3, x))
        pontos.append((x, i))
    return pontos


def rasgar_papel(texto: str, saida: str, duracao: float = 1.6,
                 tamanho: tuple = (1080, 1080)) -> str:
    """Papel escrito sendo rasgado ao meio; as metades caem."""
    W, H = tamanho
    texto = (texto or "PREÇO").strip().upper()[:14]
    pw, ph = int(W * 0.74), int(H * 0.30)
    folha = _folha(texto, pw, ph)

    # parte a folha em duas pela trilha irregular
    trilha = _trilha_rasgo(ph, max(3, pw // 90), semente=len(texto) + 3)
    esq_mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(esq_mask).polygon(
        [(0, 0)] + [(pw / 2 + dx, y) for dx, y in trilha] + [(0, ph)], fill=255)
    dir_mask = Image.eval(esq_mask, lambda v: 255 - v)

    metades = []
    for mask in (esq_mask, dir_mask):
        parte = folha.copy()
        parte.putalpha(ImageChops.multiply(parte.split()[3], mask))
        metades.append(parte)

    n = max(2, int(duracao * FPS))
    quadros = []
    for i in range(n):
        t = i / (n - 1)
        fundo = Image.new("RGB", (W, H), VERDE)

        if t < 0.18:                                   # o papel entra
            p = _ease_out(t / 0.18)
            esc = 0.6 + 0.4 * p
            inteiro = folha.resize((max(1, int(pw * esc)),
                                    max(1, int(ph * esc))), Image.BICUBIC)
            fundo.paste(inteiro, (int((W - inteiro.width) / 2),
                                  int((H - inteiro.height) / 2)), inteiro)
        else:                                          # rasga e cai
            p = _ease_out(min(1.0, (t - 0.18) / 0.82))
            for lado, parte in zip((-1, 1), metades):
                dx = lado * p * W * 0.42
                dy = p * p * H * 0.55
                ang = lado * -p * 26
                giro = parte.rotate(ang, resample=Image.BICUBIC, expand=True)
                fundo.paste(giro,
                            (int((W - giro.width) / 2 + dx),
                             int((H - giro.height) / 2 + dy)), giro)
        quadros.append(fundo)
    return _grava(quadros, saida)


# ---------------------------------------------------------------- carimbo


def carimbo(texto: str, saida: str, duracao: float = 1.2,
            tamanho: tuple = (1080, 1080)) -> str:
    """Carimbo caindo e batendo na tela, com tremor no impacto."""
    W, H = tamanho
    texto = (texto or "APROVADO").strip().upper()[:16]
    n = max(2, int(duracao * FPS))
    quadros = []
    for i in range(n):
        t = i / (n - 1)
        fundo = Image.new("RGB", (W, H), VERDE)
        cam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(cam)

        if t < 0.28:                                   # despencando
            p = t / 0.28
            esc, alpha = 3.2 - 2.2 * _ease_out(p), int(90 + 165 * p)
        else:                                          # bateu e treme
            p = (t - 0.28) / 0.72
            esc = 1.0 + 0.06 * math.sin(p * math.pi * 5) * (1 - p)
            alpha = 255

        lw, lh = int(W * 0.66 * esc), int(H * 0.22 * esc)
        x0, y0 = (W - lw) // 2, (H - lh) // 2
        cor = (196, 36, 32, alpha)
        d.rounded_rectangle([x0, y0, x0 + lw, y0 + lh], radius=int(14 * esc),
                            outline=cor, width=max(3, int(10 * esc)))
        tam = int(lh * 0.52)
        f = _fonte(tam)
        while tam > 10 and f.getbbox(texto)[2] > lw * 0.84:
            tam = int(tam * 0.9)
            f = _fonte(tam)
        _texto_centrado(d, (W / 2, H / 2), texto, f, cor)

        cam = cam.rotate(-9, resample=Image.BICUBIC)
        fundo.paste(cam, (0, 0), cam)
        quadros.append(fundo)
    return _grava(quadros, saida)


# ---------------------------------------------------------------- confete


def confete(texto: str, saida: str, duracao: float = 2.0,
            tamanho: tuple = (1080, 1080)) -> str:
    """Explosao de confete saindo do centro."""
    W, H = tamanho
    rnd = random.Random(11)
    cores = [(255, 79, 90), (255, 200, 46), (58, 191, 248),
             (86, 222, 128), (247, 141, 236), (255, 255, 255)]
    pecas = []
    for _ in range(180):
        ang = rnd.uniform(0, 2 * math.pi)
        pecas.append({"ang": ang, "vel": rnd.uniform(W * 0.30, W * 0.95),
                      "giro": rnd.uniform(-620, 620),
                      "tam": rnd.randint(int(W * 0.010), int(W * 0.026)),
                      "cor": rnd.choice(cores), "fase": rnd.uniform(0, 6.28)})

    n = max(2, int(duracao * FPS))
    quadros = []
    for i in range(n):
        t = i / (n - 1)
        fundo = Image.new("RGB", (W, H), VERDE)
        cam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(cam)
        for p in pecas:
            av = _ease_out(t)
            x = W / 2 + math.cos(p["ang"]) * p["vel"] * av
            y = (H / 2 + math.sin(p["ang"]) * p["vel"] * av
                 + (t ** 2) * H * 0.85)                 # gravidade
            if not (-60 < x < W + 60 and -60 < y < H + 60):
                continue
            # o giro achata a peca: vira retangulo fino e volta
            larg = max(1.0, abs(math.cos(math.radians(p["giro"] * t)
                                         + p["fase"])) * p["tam"])
            d.rectangle([x - larg / 2, y - p["tam"] / 2,
                         x + larg / 2, y + p["tam"] / 2],
                        fill=p["cor"] + (255,))
        fundo.paste(cam, (0, 0), cam)
        quadros.append(fundo)
    return _grava(quadros, saida)


# ------------------------------------------------------------ zoom impacto


def zoom_impacto(texto: str, saida: str, duracao: float = 0.5,
                 tamanho: tuple = (1080, 1080)) -> str:
    """Anel de choque curto — sobreponha no momento da palavra forte."""
    W, H = tamanho
    n = max(2, int(duracao * FPS))
    quadros = []
    for i in range(n):
        t = i / (n - 1)
        fundo = Image.new("RGB", (W, H), VERDE)
        cam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(cam)
        p = _ease_out(t)
        r = p * W * 0.62
        esp = max(1, int((1 - p) * W * 0.05))
        alpha = int(235 * (1 - p) ** 0.7)
        if r > 2 and alpha > 3:
            d.ellipse([W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r],
                      outline=(255, 255, 255, alpha), width=esp)
        cam = cam.filter(ImageFilter.GaussianBlur(2))
        fundo.paste(cam, (0, 0), cam)
        quadros.append(fundo)
    return _grava(quadros, saida)


# ----------------------------------------------------------------- registro

REGISTRO = {
    "rasgar_papel": (
        "Papel com uma palavra escrita sendo rasgado ao meio. Use quando a "
        "fala derrubar/quebrar/rasgar algo — preco, juros, taxa, burocracia. "
        "Precisa de 'texto' (uma palavra).",
        rasgar_papel),
    "carimbo": (
        "Carimbo caindo e batendo na tela com uma palavra. Use para selar uma "
        "afirmacao: VENDIDO, APROVADO, GARANTIDO. Precisa de 'texto'.",
        carimbo),
    "confete": (
        "Explosao de confete. Use em comemoracao, fechamento de negocio, ou "
        "no encerramento do video.",
        confete),
    "zoom_impacto": (
        "Anel de choque curto. Use na palavra mais forte da frase, para dar "
        "enfase. Nao usa texto.",
        zoom_impacto),
}

DISPONIVEIS = {nome: desc for nome, (desc, _) in REGISTRO.items()}


def gera(nome: str, texto: str, saida: str, duracao: float | None = None,
         tamanho: tuple = (1080, 1080)) -> str:
    """Gera a animacao pelo nome do registro."""
    if nome not in REGISTRO:
        raise KeyError(f"animacao desconhecida: {nome}")
    fn = REGISTRO[nome][1]
    kw = {"tamanho": tamanho}
    if duracao:
        kw["duracao"] = duracao
    return fn(texto, saida, **kw)
