"""
Gera a animacao "papelzinho com PRECOS sendo rasgado ao meio".

Saida: 1920x1080, 30fps, 5s exatos, fundo chroma key verde puro (#00FF00).

O papel cai em quadro, balanca, comeca a ser puxado, rasga de cima para baixo
por uma linha irregular que corta a palavra no meio, e as duas metades caem
girando ate pousarem separadas.

O rasgo e feito deformando o bitmap por linha: cada fileira de pixels acima da
ponta do rasgo desliza para o lado, com deslocamento maximo no topo e zero na
ponta. Isso abre a fenda em cunha, que e como papel rasgado se comporta.

Uso:
    python3 tools/precos_rasgado.py [saida.mp4]
"""

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))

from chroma_common import (  # noqa: E402
    CHROMA, FPS, H, INK, SS, W, clamp01, ease_in, ease_in_out, ease_out,
    encode, lerp, pick_font, rand, seg,
)

DURATION = 5.0
NFRAMES = int(round(FPS * DURATION))  # 150

PAPER = (246, 240, 222)  # creme
PAPER_SHADE = (222, 213, 190)  # dobra/sombreado interno do papel
FIBER = (255, 252, 244)  # fibras claras na borda rasgada
RULE = (150, 176, 206)  # pauta
MARGIN = (214, 96, 96)  # linha de margem
SHADOW = (86, 92, 112)  # sombra chapada (opaca, nunca alpha)

WORD = "PREÇOS"

# tamanho do papelzinho, em px de tela (1x)
PW, PH = 1180, 660
BASE_ROT = -4.0  # inclinacao de repouso
CX, CY = 960.0, 520.0  # centro do papel em repouso

# ------------------------------------------------------------------ o papel


def tear_path(height):
    """Coluna do rasgo para cada linha do bitmap (coordenadas do papel, 2x).

    Linha vertical irregular: um zigue-zague de segmentos com ruido, mais um
    desvio lento para dar a sensacao de que o rasgo "procura" caminho.
    """
    mid = PW * SS * 0.5
    knots = 16
    ys = [height * k / knots for k in range(knots + 1)]
    xs = []
    for k in range(knots + 1):
        drift = math.sin(k * 0.55) * 26 * SS
        jitter = (rand(k, 3.1) - 0.5) * 46 * SS
        xs.append(mid + drift + jitter)
    col = np.empty(height, dtype=np.float64)
    for y in range(height):
        k = min(knots - 1, int(y / height * knots))
        s = (y - ys[k]) / (ys[k + 1] - ys[k])
        # dentes finos por cima da interpolacao: fibra rasgando
        micro = math.sin(y * 0.09) * 3.2 * SS + (rand(y * 0.37, 7.7) - 0.5) * 5.0 * SS
        col[y] = lerp(xs[k], xs[k + 1], s) + micro
    return col


def build_paper():
    """Papelzinho completo: pauta, margem, palavra e contorno."""
    w, h = PW * SS, PH * SS
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # silhueta levemente irregular (papel cortado a mao)
    edge = []
    steps = 40
    for k in range(steps):
        s = k / steps
        wob = (rand(k, 1.7) - 0.5) * 7 * SS
        if s < 0.25:
            p = s / 0.25
            edge.append((lerp(0, w, p), 0 + wob))
        elif s < 0.5:
            p = (s - 0.25) / 0.25
            edge.append((w + wob, lerp(0, h, p)))
        elif s < 0.75:
            p = (s - 0.5) / 0.25
            edge.append((lerp(w, 0, p), h + wob))
        else:
            p = (s - 0.75) / 0.25
            edge.append((0 + wob, lerp(h, 0, p)))
    d.polygon(edge, fill=PAPER, outline=INK, width=int(6 * SS))

    # pauta e margem
    for k in range(1, 6):
        y = h * k / 6
        d.line([26 * SS, y, w - 26 * SS, y], fill=RULE, width=max(1, int(2 * SS)))
    d.line([88 * SS, 12 * SS, 88 * SS, h - 12 * SS], fill=MARGIN, width=int(3 * SS))

    # a palavra, escrita no papel
    font = pick_font(int(196 * SS))
    d.text(
        (w / 2, h / 2),
        WORD,
        font=font,
        fill=INK,
        anchor="mm",
        stroke_width=int(2 * SS),
        stroke_fill=INK,
    )
    return img


PAPER_IMG = build_paper()
PW2, PH2 = PAPER_IMG.size
TEAR = tear_path(PH2)


def build_halves():
    """Metades do papel + a camada de fibras da borda rasgada, separada.

    As fibras ficam a parte porque so devem aparecer no trecho ja rasgado:
    enquanto o papel esta inteiro, nao existe borda nenhuma no meio dele.
    """
    cols = np.arange(PW2)[None, :]
    # a metade esquerda invade alguns pixels alem do corte. as duas metades sao
    # giradas e coladas em separado, e sem essa sobreposicao a suavizacao das
    # bordas deixa o fundo verde vazar na emenda enquanto o papel esta inteiro.
    left_mask = (cols < TEAR[:, None] + 3 * SS).astype(np.uint8) * 255
    right_mask = (cols >= TEAR[:, None]).astype(np.uint8) * 255

    base = np.array(PAPER_IMG, dtype=np.uint8)
    out = []
    for side, mask in (("left", left_mask), ("right", right_mask)):
        arr = base.copy()
        arr[..., 3] = np.minimum(arr[..., 3], mask)

        fib = Image.new("RGBA", PAPER_IMG.size, (0, 0, 0, 0))
        fd = ImageDraw.Draw(fib)
        off = -3 * SS if side == "left" else 3 * SS
        pts = [(TEAR[y] + off, y) for y in range(0, PH2, 6)]
        fd.line(pts, fill=FIBER, width=int(7 * SS), joint="curve")
        fd.line(
            [(x + off * 1.9, y) for x, y in pts],
            fill=PAPER_SHADE,
            width=int(3 * SS),
            joint="curve",
        )
        fa = np.array(fib, dtype=np.uint8)
        fa[..., 3] = np.minimum(fa[..., 3], arr[..., 3])
        out.append((arr, fa))
    return out


(LEFT_ARR, LEFT_FIB), (RIGHT_ARR, RIGHT_FIB) = build_halves()
ROWS = np.arange(PH2)[:, None]


def with_fibers(plain, fib, tip):
    """Aplica a borda rasgada apenas nas linhas acima da ponta do rasgo."""
    if tip <= 0:
        return plain
    m = (ROWS < tip) & (fib[..., 3] > 0)
    arr = plain.copy()
    arr[m] = fib[m]
    return arr


def warp_half(arr, shift):
    """Desliza cada linha do bitmap horizontalmente (shift em px, por linha)."""
    xs = np.arange(PW2)[None, :] + shift[:, None].astype(np.int64)
    np.clip(xs, 0, PW2 - 1, out=xs)
    out = arr[ROWS, xs]
    # o que entrou pela borda ao deslizar nao existe: zera as sobras
    invalid = (np.arange(PW2)[None, :] + shift[:, None] < 0) | (
        np.arange(PW2)[None, :] + shift[:, None] > PW2 - 1
    )
    out[..., 3] = np.where(invalid, 0, out[..., 3])
    return out


def half_shift(tip, opening):
    """Deslocamento por linha: maximo no topo, zero na ponta do rasgo."""
    shift = np.zeros(PH2, dtype=np.float64)
    if tip <= 0 or opening <= 0:
        return shift
    ys = np.arange(PH2, dtype=np.float64)
    above = ys < tip
    k = np.clip((tip - ys) / max(tip, 1.0), 0.0, 1.0)
    shift[above] = (k[above] ** 1.25) * opening
    return shift


def paste_half(canvas, arr, angle, dx, dy):
    """Cola uma metade ja deformada, com rotacao e deslocamento proprios."""
    ys, xs = np.nonzero(arr[..., 3])
    if len(ys) == 0:
        return
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    img = Image.fromarray(arr[y0:y1, x0:x1], "RGBA")
    # posicao do recorte em relacao ao centro do papel, antes de girar
    ox = (x0 + x1) / 2 - PW2 / 2
    oy = (y0 + y1) / 2 - PH2 / 2
    if abs(angle) > 0.01:
        # bilinear de proposito: o bicubico extrapola na borda de alpha e deixa
        # um vinco claro na emenda das duas metades enquanto o papel esta inteiro
        img = img.rotate(angle, resample=Image.BILINEAR, expand=True)
    a = math.radians(angle)
    rx = ox * math.cos(a) + oy * math.sin(a)
    ry = -ox * math.sin(a) + oy * math.cos(a)
    px = (CX + dx) * SS + rx - img.width / 2
    py = (CY + dy) * SS + ry - img.height / 2
    canvas.alpha_composite(img, (int(round(px)), int(round(py))))


# ------------------------------------------------------------------ efeitos


def confetti(canvas, t, t0):
    """Lascas de papel saltando do rasgo e caindo."""
    age = t - t0
    if age < 0:
        return
    d = ImageDraw.Draw(canvas)
    for k in range(16):
        birth = rand(k, 2.3) * 0.85
        a = age - birth
        if a <= 0:
            continue
        # sempre para fora: nenhuma lasca fica flutuando sobre o papel
        vx = (420 + rand(k, 5.1) * 380) * (1 if k % 2 else -1)
        vy = -260 - rand(k, 9.4) * 320
        x = CX + (rand(k, 4.2) - 0.5) * 60 + vx * a
        y = CY - PH * 0.35 + rand(k, 6.6) * PH * 0.7 + vy * a + 900 * a * a
        if y > H + 60 or a > 2.6:
            continue
        s = (12 + rand(k, 8.8) * 16) * max(0.0, 1.0 - a * 0.18)
        if s < 3:
            continue
        rot = a * (2.5 + rand(k, 1.9) * 5) * (1 if k % 2 else -1)
        pts = []
        for c in range(4):
            ang = rot + math.pi / 2 * c + 0.4
            pts.append(((x + math.cos(ang) * s) * SS, (y + math.sin(ang) * s * 0.75) * SS))
        d.polygon(pts, fill=PAPER, outline=INK, width=max(1, int(2 * SS)))


# --------------------------------------------------------------- coreografia

T_DROP = (0.00, 0.62)  # cai em quadro e assenta
T_IDLE = (0.62, 1.30)  # balanca de leve
T_STRAIN = (1.30, 1.80)  # esta sendo puxado: treme e abre um piquinho no topo
T_RIP = (1.80, 2.92)  # rasga de cima a baixo
T_FALL = (2.92, 5.00)  # metades caem girando e pousam

NOTCH = 0.05  # quanto do rasgo ja existe como piquinho antes do puxao final

# arrancos: rasga, a fibra segura, rasga de novo, segura, e cede de vez
RIP_KEYS = [(0.00, 0.00), (0.20, 0.26), (0.32, 0.30), (0.58, 0.62), (0.70, 0.66), (1.00, 1.00)]


def rip_progress(p):
    """Avanco da ponta do rasgo (0..1) a partir do progresso da fase."""
    for (p0, v0), (p1, v1) in zip(RIP_KEYS, RIP_KEYS[1:]):
        if p <= p1:
            return lerp(v0, v1, ease_in_out(clamp01((p - p0) / (p1 - p0))))
    return 1.0


def tear_state(t):
    """(ponta do rasgo em px do bitmap, abertura em px) no instante t."""
    if t < T_STRAIN[0]:
        return 0.0, 0.0
    if t < T_RIP[0]:
        p = ease_in(seg(t, *T_STRAIN))
        return NOTCH * p * PH2, 9 * SS * p
    prog = lerp(NOTCH, 1.0, rip_progress(seg(t, *T_RIP)))
    return prog * PH2, (10 + 46 * prog) * SS


def paper_state(t):
    """(dx, dy, rot, shake) do papel inteiro."""
    if t < T_DROP[1]:
        p = seg(t, *T_DROP)
        dy = lerp(-760, 0, ease_out(p)) + math.sin(p * math.pi) * 26
        rot = BASE_ROT + lerp(-16, 0, ease_out(p))
        return 0.0, dy, rot, 0.0
    if t < T_IDLE[1]:
        p = seg(t, *T_IDLE)
        return (
            math.sin(t * 3.4) * 7,
            math.sin(t * 2.6 + 1.0) * 9 * (1 - p * 0.5),
            BASE_ROT + math.sin(t * 2.9) * 1.9,
            0.0,
        )
    if t < T_STRAIN[1]:
        p = seg(t, *T_STRAIN)
        sh = p * 7.5
        return (
            math.sin(t * 44) * sh,
            math.cos(t * 39) * sh * 0.6,
            BASE_ROT + math.sin(t * 41) * 1.6 * p,
            p,
        )
    p = seg(t, *T_RIP)
    sh = (1 - p) * 9 + 3
    return (
        math.sin(t * 47) * sh * (1 - p * 0.7),
        math.cos(t * 43) * sh * 0.5 * (1 - p * 0.7),
        BASE_ROT + math.sin(t * 45) * 1.4 * (1 - p),
        max(0.0, 1 - p * 1.6),
    )


def halves_state(t):
    """Transformacao extra de cada metade depois que o rasgo termina."""
    if t < T_FALL[0]:
        return (0.0, 0.0, 0.0), (0.0, 0.0, 0.0)
    a = t - T_FALL[0]
    p = ease_out(clamp01(a / 1.5))
    settle = math.exp(-2.2 * a)
    drop = ease_in(clamp01(a / 1.8))
    # cada metade escorrega para o seu lado, gira e desce ate pousar.
    # os angulos ficam contidos: girando demais, as quinas saem do quadro.
    lx = -255 * p - 16 * settle * math.sin(a * 12)
    ly = 150 * drop + 13 * settle * math.sin(a * 9)
    la = -13 * p - 4 * settle * math.sin(a * 10)
    rx = 240 * p + 14 * settle * math.sin(a * 11 + 0.8)
    ry = 170 * drop + 11 * settle * math.sin(a * 8 + 0.5)
    ra = 15 * p + 4 * settle * math.sin(a * 10 + 0.6)
    return (lx, ly, la), (rx, ry, ra)


# ------------------------------------------------------------------- render


def render_frame(i):
    t = i / FPS
    canvas = Image.new("RGBA", (W * SS, H * SS), CHROMA + (255,))

    dx, dy, rot, _ = paper_state(t)
    tip, opening = tear_state(t)
    (lx, ly, la), (rx, ry, ra) = halves_state(t)

    shift = half_shift(tip, opening)
    left = with_fibers(LEFT_ARR, LEFT_FIB, tip)
    right = with_fibers(RIGHT_ARR, RIGHT_FIB, tip)
    if opening > 0:
        left = warp_half(left, shift)
        right = warp_half(right, -shift)

    paste_half(canvas, left, rot + la, dx + lx, dy + ly)
    paste_half(canvas, right, rot + ra, dx + rx, dy + ry)

    if t >= T_RIP[0]:
        confetti(canvas, t, T_RIP[0] + 0.05)

    return canvas.convert("RGB").resize((W, H), Image.LANCZOS)


def main():
    dest = Path(sys.argv[1] if len(sys.argv) > 1 else "precos_rasgado.mp4")
    encode((render_frame(i) for i in range(NFRAMES)), dest)


if __name__ == "__main__":
    main()
