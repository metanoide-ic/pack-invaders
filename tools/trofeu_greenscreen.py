#!/usr/bin/env python3
"""
Gera uma animacao em green screen (chroma key) de um trofeu dourado sendo
montado rapidamente a partir de varios cacos, com a inscricao
"MELHORES DE TODOS OS FEIROES" na base.

Saida: MP4 1920x1080 @ 60fps.

Uso:
    python3 tools/trofeu_greenscreen.py [saida.mp4]
"""

import math
import os
import random
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---------------------------------------------------------------- parametros

W, H = 1920, 1080
FPS = 60
DURACAO = 4.8                      # segundos
NFRAMES = int(DURACAO * FPS)
SS = 2                             # supersampling do desenho do trofeu

GREEN = (0, 177, 64)               # chroma key padrao (#00B140)
CX = W // 2

FONT_DIR = "/mnt/skills/examples/canvas-design/canvas-fonts"
FONT_BOLD = os.path.join(FONT_DIR, "BigShoulders-Bold.ttf")
FONT_ALT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

LINHAS = ["MELHORES", "DE TODOS OS", "FEIRÕES"]

N_CACOS_X, N_CACOS_Y = 9, 13       # grade base dos cacos (com jitter)

SEED = 20260807
random.seed(SEED)
np.random.seed(SEED)


# ------------------------------------------------------------------ desenho


def fonte(tam):
    # o layout RAQM posiciona mal o til de "FEIROES" nesta fonte; BASIC acerta
    eng = ImageFont.Layout.BASIC
    try:
        return ImageFont.truetype(FONT_BOLD, tam, layout_engine=eng)
    except Exception:
        return ImageFont.truetype(FONT_ALT, tam, layout_engine=eng)


ACENTOS = {"Õ": "O", "Ã": "A", "Á": "A", "É": "E", "Ê": "E", "Ó": "O",
           "Ç": "C", "Í": "I", "Ú": "U", "Â": "A", "Ô": "O"}


def _marca_acento(f, letra, base):
    """Recorta a marca (til, acento) de `letra` em relacao a tinta de `base`.

    Devolve (mascara, dx, dy) com o deslocamento a aplicar sobre o canto
    superior esquerdo da tinta da letra base.
    """
    n = int(f.size * 3) + 60
    x0, y0 = n // 3, n // 2
    ims = []
    for ch in (letra, base):
        im = Image.new("L", (n, n), 0)
        ImageDraw.Draw(im).text((x0, y0), ch, font=f, fill=255, anchor="ls")
        ims.append(im)
    ba, bb = ims[0].getbbox(), ims[1].getbbox()
    if ba is None or bb is None or ba[1] >= bb[1]:
        return None, 0, 0
    marca = ims[0].crop((ba[0], ba[1], ba[2], bb[1]))
    return marca, ba[0] - bb[0], ba[1] - bb[1]


def mascara_texto(linha, f):
    """Mascara L de uma linha de texto, com os acentos colados a mao.

    Renderizar "FEIRÕES" de uma vez faz o PIL emitir um til extra fora de
    lugar; entao a linha vai sem acentos e cada marca e recortada do glifo
    acentuado isolado (que sai correto) e reposicionada.
    """
    plano = "".join(ACENTOS.get(c, c) for c in linha)
    bb = f.getbbox(plano)
    marg = int(f.size * 0.9) + 10
    tw = (bb[2] - bb[0]) + 2 * marg
    th = int(f.size * 1.6) + 2 * marg
    tmp = Image.new("L", (tw, th), 0)
    d = ImageDraw.Draw(tmp)
    ox, oy = marg - bb[0], marg
    d.text((ox, oy), plano, font=f, fill=255, anchor="la")

    for i, ch in enumerate(linha):
        if ch not in ACENTOS:
            continue
        base = ACENTOS[ch]
        marca, dx, dy = _marca_acento(f, ch, base)
        if marca is None:
            continue
        bl = f.getbbox(base)
        px = int(ox + f.getlength(plano[:i]) + bl[0] + dx)
        py = int(oy + bl[1] + dy)
        tmp.paste(marca, (px, py), marca)

    # centro otico da linha (ignorando a altura extra do acento)
    cx_ = ox + bb[0] + (bb[2] - bb[0]) / 2
    cy_ = oy + (bb[1] + bb[3]) / 2
    return tmp, cx_, cy_


def gradiente_ouro(w, h, x0, x1):
    """Gradiente dourado horizontal (metalico) cobrindo de x0 a x1."""
    stops = [
        (0.00, (104, 58, 8)),
        (0.10, (186, 126, 30)),
        (0.24, (255, 232, 158)),
        (0.34, (240, 190, 66)),
        (0.48, (208, 148, 36)),
        (0.60, (176, 118, 26)),
        (0.71, (255, 240, 186)),
        (0.80, (226, 172, 52)),
        (0.91, (152, 98, 18)),
        (1.00, (86, 48, 6)),
    ]
    u = (np.arange(w, dtype=np.float64) - x0) / max(1.0, (x1 - x0))
    u = np.clip(u, 0.0, 1.0)
    pos = np.array([s[0] for s in stops])
    cols = np.array([s[1] for s in stops], dtype=np.float64)
    linha = np.stack([np.interp(u, pos, cols[:, c]) for c in range(3)], axis=1)
    grad = np.repeat(linha[None, :, :], h, axis=0)

    # leve sombreamento vertical (mais claro em cima, mais escuro embaixo)
    v = np.linspace(1.10, 0.80, h)[:, None, None]
    grad = np.clip(grad * v, 0, 255)
    return Image.fromarray(grad.astype(np.uint8), "RGB")


def bezier(p0, p1, p2, p3, n=90):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = (mt**3 * p0[0] + 3 * mt**2 * t * p1[0]
             + 3 * mt * t**2 * p2[0] + t**3 * p3[0])
        y = (mt**3 * p0[1] + 3 * mt**2 * t * p1[1]
             + 3 * mt * t**2 * p2[1] + t**3 * p3[1])
        pts.append((x, y))
    return pts


def traco_grosso(draw, pts, larguras, cor):
    """Desenha um traco com espessura variavel (lista de larguras por ponto)."""
    for (x, y), lw in zip(pts, larguras):
        r = lw / 2.0
        draw.ellipse([x - r, y - r, x + r, y + r], fill=cor)


def perfil_taca(y_topo, y_base, hw_topo, hw_base, n=140):
    """Perfil (meia-largura) da taca, do aro ate o fundo."""
    esq, dir_ = [], []
    for i in range(n + 1):
        t = i / n
        y = y_topo + t * (y_base - y_topo)
        hw = hw_base + (hw_topo - hw_base) * (math.cos(t * math.pi / 2) ** 0.82)
        esq.append((CX - hw, y))
        dir_.append((CX + hw, y))
    return esq, dir_


def desenha_trofeu():
    """Renderiza o trofeu em RGBA 1920x1080 (fundo transparente)."""
    w, h = W * SS, H * SS
    s = SS

    def S(v):
        return v * s

    # mascaras
    m_ouro = Image.new("L", (w, h), 0)
    d_ouro = ImageDraw.Draw(m_ouro)
    m_escuro = Image.new("L", (w, h), 0)
    d_escuro = ImageDraw.Draw(m_escuro)
    m_linhas = Image.new("L", (w, h), 0)
    d_linhas = ImageDraw.Draw(m_linhas)

    cx = S(CX)

    # ---- geometria base (coordenadas em px finais) -----------------------
    Y_ARO = 170
    Y_FUNDO_TACA = 520
    HW_ARO = 218
    HW_FUNDO = 56
    RY_ARO = 46

    # ---- alcas ----------------------------------------------------------
    for lado in (-1, 1):
        p0 = (CX + lado * 206, 226)
        p1 = (CX + lado * 466, 226)
        p2 = (CX + lado * 470, 452)
        p3 = (CX + lado * 136, 396)
        pts = [(S(x), S(y)) for x, y in bezier(p0, p1, p2, p3, 120)]
        larg = [S(40 - 13 * abs(i / 120 - 0.5) * 2) for i in range(121)]
        traco_grosso(d_ouro, pts, larg, 255)

    # ---- taca -----------------------------------------------------------
    esq, dir_ = perfil_taca(Y_ARO, Y_FUNDO_TACA, HW_ARO, HW_FUNDO)
    poly = [(S(x), S(y)) for x, y in esq] + [(S(x), S(y)) for x, y in reversed(dir_)]
    d_ouro.polygon(poly, fill=255)
    # aro (elipse cheia no topo)
    d_ouro.ellipse([cx - S(HW_ARO), S(Y_ARO - RY_ARO),
                    cx + S(HW_ARO), S(Y_ARO + RY_ARO)], fill=255)

    # interior escuro da taca
    d_escuro.ellipse([cx - S(HW_ARO - 24), S(Y_ARO - RY_ARO + 13),
                      cx + S(HW_ARO - 24), S(Y_ARO + RY_ARO - 13)], fill=255)

    # sulco decorativo acompanhando o perfil (marca de anel abaixo do aro)
    for yy, esp in ((Y_ARO + 56, 7), (Y_ARO + 76, 4)):
        tt = (yy - Y_ARO) / (Y_FUNDO_TACA - Y_ARO)
        hw = HW_FUNDO + (HW_ARO - HW_FUNDO) * (math.cos(tt * math.pi / 2) ** 0.82)
        d_linhas.rectangle([cx - S(hw - 3), S(yy), cx + S(hw - 3), S(yy + esp)],
                           fill=255)

    # ---- haste ----------------------------------------------------------
    Y_COLAR = 664
    haste = []
    for i in range(81):
        t = i / 80
        y = Y_FUNDO_TACA + t * (Y_COLAR - Y_FUNDO_TACA)
        hw = 56 - 30 * math.sin(t * math.pi * 0.86) + 22 * t ** 3
        haste.append((y, hw))
    poly = ([(S(CX - hw), S(y)) for y, hw in haste]
            + [(S(CX + hw), S(y)) for y, hw in reversed(haste)])
    d_ouro.polygon(poly, fill=255)
    # noh esferico
    d_ouro.ellipse([cx - S(48), S(556), cx + S(48), S(632)], fill=255)

    # ---- pedestal / base ------------------------------------------------
    # colarinho
    d_ouro.polygon([(S(CX - 122), S(Y_COLAR)), (S(CX + 122), S(Y_COLAR)),
                    (S(CX + 156), S(704)), (S(CX - 156), S(704))], fill=255)
    # bloco da placa
    Y_P0, Y_P1, HW_P = 698, 894, 338
    d_ouro.rectangle([cx - S(HW_P), S(Y_P0), cx + S(HW_P), S(Y_P1)], fill=255)
    # plinto inferior
    d_ouro.polygon([(S(CX - HW_P - 8), S(Y_P1)), (S(CX + HW_P + 8), S(Y_P1)),
                    (S(CX + HW_P + 54), S(Y_P1 + 58)),
                    (S(CX - HW_P - 54), S(Y_P1 + 58))], fill=255)
    d_ouro.rectangle([cx - S(HW_P + 54), S(Y_P1 + 58),
                      cx + S(HW_P + 54), S(Y_P1 + 80)], fill=255)

    # placa gravada (escura) dentro do bloco
    PX0, PY0, PX1, PY1 = CX - 306, 710, CX + 306, 882
    d_escuro.rounded_rectangle([S(PX0), S(PY0), S(PX1), S(PY1)],
                               radius=S(8), fill=255)

    # ---- composicao -----------------------------------------------------
    grad = gradiente_ouro(w, h, cx - S(430), cx + S(430))

    trofeu = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    trofeu.paste(grad, (0, 0), m_ouro)

    # placa escura (verde-petroleo bem escuro, contrasta com o ouro)
    placa = Image.new("RGB", (w, h), (26, 18, 8))
    grad_placa = gradiente_ouro(w, h, cx - S(430), cx + S(430))
    gp = np.asarray(grad_placa).astype(np.float64) * 0.13 + 14
    placa = Image.fromarray(np.clip(gp, 0, 255).astype(np.uint8), "RGB")
    trofeu.paste(placa, (0, 0), m_escuro)

    d = ImageDraw.Draw(trofeu)

    # contorno escuro (definicao das formas)
    borda = m_ouro.filter(ImageFilter.MaxFilter(5))
    borda = Image.fromarray(
        (np.asarray(borda).astype(np.int16)
         - np.asarray(m_ouro).astype(np.int16)).clip(0, 255).astype(np.uint8))
    trofeu.paste(Image.new("RGB", (w, h), (58, 32, 4)), (0, 0), borda)

    # sulcos escuros na taca
    trofeu.paste(Image.new("RGB", (w, h), (128, 82, 14)), (0, 0),
                 m_linhas.filter(ImageFilter.GaussianBlur(S(1.2))))

    # moldura dourada da placa
    d.rounded_rectangle([S(PX0), S(PY0), S(PX1), S(PY1)],
                        radius=S(8), outline=(255, 226, 150), width=S(4))

    # ---- texto gravado --------------------------------------------------
    largura_max = S(546)
    tam = [int(S(46)), int(S(32)), int(S(58))]
    cys = [S(740), S(784), S(846)]
    for linha, t_, cy_ in zip(LINHAS, tam, cys):
        f = fonte(t_)
        bb = f.getbbox(linha)
        if bb[2] - bb[0] > largura_max:
            t_ = int(t_ * largura_max / (bb[2] - bb[0]))
            f = fonte(t_)
        m, mx, my = mascara_texto(linha, f)
        px, py = int(cx - mx), int(cy_ - my)
        # sombra "gravada" + face dourada
        trofeu.paste(Image.new("RGB", m.size, (10, 6, 2)),
                     (px, py + int(S(2.5))), m)
        trofeu.paste(Image.new("RGB", m.size, (255, 221, 128)), (px, py), m)

    # ---- brilhos especulares -------------------------------------------
    bril = Image.new("L", (w, h), 0)
    db = ImageDraw.Draw(bril)
    db.ellipse([cx - S(150), S(220), cx - S(78), S(470)], fill=150)
    db.ellipse([cx + S(96), S(236), cx + S(132), S(430)], fill=90)
    db.ellipse([cx - S(28), S(566), cx - S(4), S(614)], fill=120)
    bril = bril.filter(ImageFilter.GaussianBlur(S(11)))
    bril = Image.fromarray(
        (np.asarray(bril).astype(np.int16)
         * (np.asarray(m_ouro).astype(np.int16) > 0)).astype(np.uint8))
    trofeu.paste(Image.new("RGB", (w, h), (255, 250, 226)), (0, 0), bril)

    # sombra interna na base do bloco (profundidade)
    somb = Image.new("L", (w, h), 0)
    ds = ImageDraw.Draw(somb)
    ds.rectangle([cx - S(HW_P), S(Y_P1 - 26), cx + S(HW_P), S(Y_P1)], fill=110)
    ds.rectangle([cx - S(HW_ARO), S(Y_ARO + 74), cx + S(HW_ARO), S(Y_ARO + 92)],
                 fill=90)
    somb = somb.filter(ImageFilter.GaussianBlur(S(6)))
    somb = Image.fromarray(
        (np.asarray(somb).astype(np.int16)
         * (np.asarray(m_ouro).astype(np.int16) > 0)).astype(np.uint8))
    trofeu.paste(Image.new("RGB", (w, h), (74, 42, 6)), (0, 0), somb)

    return trofeu.resize((W, H), Image.LANCZOS)


# ------------------------------------------------------------------- cacos


def gera_cacos(trofeu):
    """Fragmenta o trofeu em cacos (celulas de Voronoi com jitter)."""
    alpha = np.asarray(trofeu.split()[3])
    ys, xs = np.nonzero(alpha > 8)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1

    bw, bh = x1 - x0, y1 - y0
    sites = []
    for j in range(N_CACOS_Y):
        for i in range(N_CACOS_X):
            px = x0 + (i + 0.5 + random.uniform(-0.42, 0.42)) * bw / N_CACOS_X
            py = y0 + (j + 0.5 + random.uniform(-0.42, 0.42)) * bh / N_CACOS_Y
            sites.append((px, py, random.uniform(-1400, 1400)))

    gx = np.arange(x0, x1, dtype=np.float32)[None, :]
    gy = np.arange(y0, y1, dtype=np.float32)[:, None]
    melhor = np.full((bh, bw), np.inf, dtype=np.float32)
    rotulo = np.full((bh, bw), -1, dtype=np.int32)
    for k, (px, py, wgt) in enumerate(sites):
        dist = (gx - px) ** 2 + (gy - py) ** 2 - wgt
        upd = dist < melhor
        melhor = np.where(upd, dist, melhor)
        rotulo = np.where(upd, k, rotulo)

    rot_full = np.full((H, W), -1, dtype=np.int32)
    rot_full[y0:y1, x0:x1] = rotulo
    rot_full[alpha <= 8] = -1

    cacos = []
    for k in range(len(sites)):
        m = rot_full == k
        if m.sum() < 60:
            continue
        yy, xx = np.nonzero(m)
        cx0, cx1 = xx.min(), xx.max() + 1
        cy0, cy1 = yy.min(), yy.max() + 1
        sprite = trofeu.crop((cx0, cy0, cx1, cy1)).copy()
        a = np.asarray(sprite.split()[3]).copy()
        a[~m[cy0:cy1, cx0:cx1]] = 0
        sprite.putalpha(Image.fromarray(a))
        cacos.append({
            "img": sprite,
            "cx": (cx0 + cx1) / 2.0,
            "cy": (cy0 + cy1) / 2.0,
        })

    # mapa das trincas (para desvanecer logo apos a montagem)
    r = rot_full
    edge = np.zeros((H, W), bool)
    edge[:, 1:] |= (r[:, 1:] != r[:, :-1]) & (r[:, 1:] >= 0) & (r[:, :-1] >= 0)
    edge[1:, :] |= (r[1:, :] != r[:-1, :]) & (r[1:, :] >= 0) & (r[:-1, :] >= 0)
    trincas = Image.fromarray((edge * 255).astype(np.uint8), "L")
    trincas = trincas.filter(ImageFilter.GaussianBlur(0.7))
    return cacos, trincas


# ------------------------------------------------------------------ easings


def ease_out_back(t, s=1.28):
    t -= 1.0
    return t * t * ((s + 1) * t + s) + 1.0


def ease_out_cubic(t):
    return 1 - (1 - t) ** 3


def ease_in_out(t):
    return t * t * (3 - 2 * t)


# --------------------------------------------------------------- animacao


T_INICIO = 0.10          # comeca a chegada dos cacos
T_ESPALHA = 0.98         # janela de escalonamento entre cacos
T_VOO = 0.44             # duracao do voo de cada caco
T_MONTADO = T_INICIO + T_ESPALHA + T_VOO
T_TRINCAS = 0.40         # tempo para as trincas sumirem


def prepara_voos(cacos):
    ordem = sorted(range(len(cacos)),
                   key=lambda k: -cacos[k]["cy"] + random.uniform(-110, 110))
    for pos, k in enumerate(ordem):
        c = cacos[k]
        frac = pos / max(1, len(ordem) - 1)
        c["t0"] = T_INICIO + frac * T_ESPALHA
        ang = random.uniform(0, 2 * math.pi)
        dist = random.uniform(820, 1600)
        c["x0"] = c["cx"] + math.cos(ang) * dist
        c["y0"] = c["cy"] + math.sin(ang) * dist * 0.62
        c["rot"] = random.uniform(-165, 165)
        c["esc"] = random.uniform(0.45, 0.82)
    return cacos


def pos_caco(c, t):
    """(x, y, rot, escala, alpha, progresso) do caco no tempo t."""
    p = (t - c["t0"]) / T_VOO
    if p <= 0:
        return None
    if p >= 1:
        return (c["cx"], c["cy"], 0.0, 1.0, 1.0, 1.0)
    e = ease_out_back(p)
    ec = ease_out_cubic(p)
    x = c["x0"] + (c["cx"] - c["x0"]) * e
    y = c["y0"] + (c["cy"] - c["y0"]) * e
    rot = c["rot"] * (1 - ec)
    esc = c["esc"] + (1.0 - c["esc"]) * ec
    alpha = min(1.0, p * 9.0)
    return (x, y, rot, esc, alpha, p)


def desenha_caco(base, c, x, y, rot, esc, alpha):
    img = c["img"]
    if esc < 0.995:
        nw = max(1, int(round(img.width * esc)))
        nh = max(1, int(round(img.height * esc)))
        img = img.resize((nw, nh), Image.BICUBIC)
    if abs(rot) > 0.4:
        img = img.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 0.995:
        a = img.split()[3].point(lambda v: int(v * alpha))
        img = img.copy()
        img.putalpha(a)
    base.paste(img, (int(round(x - img.width / 2)),
                     int(round(y - img.height / 2))), img)


def faixa_brilho(trofeu_mask, prog):
    """Faixa de luz diagonal varrendo o trofeu."""
    x = -420 + prog * (W + 840)
    faixa = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(faixa)
    d.polygon([(x, 0), (x + 190, 0), (x + 190 - 300, H), (x - 300, H)], fill=255)
    faixa = faixa.filter(ImageFilter.GaussianBlur(46))
    arr = (np.asarray(faixa).astype(np.float32)
           * (np.asarray(trofeu_mask).astype(np.float32) / 255.0))
    return Image.fromarray(np.clip(arr * 0.72, 0, 255).astype(np.uint8), "L")


def desenha_faisca(d, x, y, r, cor):
    d.polygon([(x, y - r), (x + r * 0.20, y - r * 0.20), (x + r, y),
               (x + r * 0.20, y + r * 0.20), (x, y + r),
               (x - r * 0.20, y + r * 0.20), (x - r, y),
               (x - r * 0.20, y - r * 0.20)], fill=cor)


def monta_cena():
    """Prepara tudo o que nao muda entre quadros."""
    trofeu = desenha_trofeu()
    cacos, trincas = gera_cacos(trofeu)
    cacos = prepara_voos(cacos)

    # faiscas do impacto (posicoes fixas ao redor da taca)
    faiscas = []
    for _ in range(26):
        ang = random.uniform(0, 2 * math.pi)
        faiscas.append((CX + math.cos(ang) * random.uniform(140, 440),
                        350 + math.sin(ang) * random.uniform(130, 330),
                        random.uniform(14, 42),
                        random.uniform(0.0, 0.22)))
    return {"trofeu": trofeu, "cacos": cacos, "trincas": trincas,
            "faiscas": faiscas}


def quadro_em(t, cena):
    """Renderiza o quadro RGB do instante t."""
    trofeu = cena["trofeu"]
    quadro = Image.new("RGB", (W, H), GREEN)

    if t < T_MONTADO:
        # ---- montagem: cacos voando para o lugar ----
        for c in cena["cacos"]:
            st = pos_caco(c, t)
            if st is None:
                continue
            x, y, rot, esc, al, p = st
            desenha_caco(quadro, c, x, y, rot, esc, al)
        return quadro

    # ---- trofeu montado ----
    dt = t - T_MONTADO
    corpo = trofeu

    # estalo de encaixe (leve squash & stretch)
    if dt < 0.30:
        k = math.sin(dt / 0.30 * math.pi) * 0.045 * (1 - dt / 0.30)
        nw = int(W * (1 + k * 0.55))
        nh = int(H * (1 - k * 0.55))
        red = trofeu.resize((nw, nh), Image.BICUBIC)
        corpo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        corpo.paste(red, ((W - nw) // 2, int((H - nh) * 0.72)), red)
    elif dt > 0.55:
        # respiro suave
        bob = math.sin((dt - 0.55) * 1.5) * 4.0
        corpo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        corpo.paste(trofeu, (0, int(round(bob))), trofeu)

    quadro.paste(corpo, (0, 0), corpo)
    mask_atual = corpo.split()[3]

    # trincas desvanecendo
    if dt < T_TRINCAS:
        a = 1.0 - ease_in_out(dt / T_TRINCAS)
        cr = cena["trincas"].point(lambda v: int(v * a * 0.62))
        quadro.paste(Image.new("RGB", (W, H), (52, 28, 4)), (0, 0), cr)

    # flash de conclusao (somente sobre o trofeu)
    if dt < 0.16:
        fa = (1 - dt / 0.16) ** 2.0
        fl = mask_atual.point(lambda v: int(v * fa * 0.32))
        quadro.paste(Image.new("RGB", (W, H), (255, 252, 236)), (0, 0), fl)

    # faiscas do impacto
    if dt < 0.55:
        cam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        dc = ImageDraw.Draw(cam)
        for (fx, fy, fr, atraso) in cena["faiscas"]:
            lp = (dt - atraso) / 0.33
            if 0 <= lp <= 1:
                r = fr * (1 - abs(lp - 0.3) / 0.7) * 1.6
                if r > 1:
                    desenha_faisca(dc, fx, fy, r, (255, 246, 214, 255))
                    desenha_faisca(dc, fx, fy, r * 0.45, (255, 255, 255, 255))
        quadro.paste(cam, (0, 0), cam)

    # varredura de brilho
    for ini, dur, forca in ((0.34, 1.31, 1.0), (2.20, 0.90, 0.55)):
        if ini < dt < ini + dur:
            br = faixa_brilho(mask_atual, ease_in_out((dt - ini) / dur))
            if forca < 1.0:
                br = br.point(lambda v: int(v * forca))
            quadro.paste(Image.new("RGB", (W, H), (255, 250, 228)), (0, 0), br)

    return quadro


def main():
    saida = sys.argv[1] if len(sys.argv) > 1 else "trofeu_feiroes_greenscreen.mp4"
    print("Montando a cena...")
    cena = monta_cena()
    print(f"  {len(cena['cacos'])} cacos")

    import imageio_ffmpeg
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y",
           "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "15",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    print("Renderizando frames...")
    for f in range(NFRAMES):
        proc.stdin.write(quadro_em(f / FPS, cena).tobytes())
        if f % 30 == 0:
            print(f"  frame {f}/{NFRAMES}", flush=True)

    proc.stdin.close()
    err = proc.stderr.read().decode(errors="ignore")
    if proc.wait() != 0:
        print(err)
        sys.exit(1)
    print(f"OK -> {saida}")


if __name__ == "__main__":
    main()
