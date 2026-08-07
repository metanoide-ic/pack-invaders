#!/usr/bin/env python3
"""
Gera uma animacao (MP4) de um lapis escrevendo "ANOTA AI" em uma folha de papel,
sobre fundo verde (chroma key), pronta para recorte em editores de video.

Uso:
    python3 render_anota_ai.py [saida.mp4]

Requisitos: pillow, numpy, imageio-ffmpeg
"""

import math
import os
import random
import subprocess
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

# ---------------------------------------------------------------- configuracao

W, H = 1920, 1080
FPS = 30
SS = 2  # supersampling da camada de tinta

GREEN = (0, 177, 64)          # verde chroma key
PAPER = (252, 251, 246)
PAPER_EDGE = (226, 222, 210)
RULE = (206, 219, 236)
INK = (58, 55, 62)

TEXT = "ANOTA AI"             # o "I" recebe acento agudo (AI -> AI com til/acento)
CAP_HEIGHT = 168              # altura das maiusculas em px
LETTER_GAP = 0.16             # espaco entre letras (em unidades de CAP_HEIGHT)
PAPER_W, PAPER_H = 1320, 840
PAPER_ROT = -2.0              # leve inclinacao da folha, em graus
PAPER_PAD = 40                # folga na textura da folha (para a rotacao)
RULE_TOP = 96                 # y da 1a linha do caderno (coords da folha)
RULE_STEP = 84                # espacamento das linhas
# deslocamento vertical da linha de base em relacao ao centro do quadro,
# de modo que o texto se apoie na 5a linha do caderno
BASELINE_OFFSET = (PAPER_PAD + RULE_TOP + RULE_STEP * 4) - (PAPER_H + PAPER_PAD * 2) / 2
STROKE_W = 7.0                # espessura final do traco de grafite, em px

WRITE_SPEED = 620.0           # px/s da ponta do lapis
LIFT_TIME = 0.13              # s entre tracos (lapis levantado)
INTRO_TIME = 0.55             # s de entrada do lapis
OUTRO_LIFT = 0.75             # s de saida do lapis
HOLD_TIME = 1.30              # s de tela final parada

random.seed(7)

# --------------------------------------------------------------- letras (tracos)
# Cada letra e uma lista de tracos; cada traco e uma lista de pontos (x, y)
# no espaco normalizado: y = 0 no topo das maiusculas, y = 1 na linha de base.


def _ellipse(cx, cy, rx, ry, a0, a1, n=64):
    return [
        (cx + rx * math.cos(a0 + (a1 - a0) * i / n),
         cy + ry * math.sin(a0 + (a1 - a0) * i / n))
        for i in range(n + 1)
    ]


GLYPHS = {
    "A": (0.78, [
        [(0.02, 1.0), (0.20, 0.45), (0.39, 0.0), (0.58, 0.46), (0.76, 1.0)],
        [(0.16, 0.66), (0.62, 0.62)],
    ]),
    "N": (0.76, [
        [(0.03, 1.0), (0.03, 0.0)],
        [(0.03, 0.04), (0.72, 0.98)],
        [(0.72, 1.0), (0.72, 0.02)],
    ]),
    "O": (0.84, [_ellipse(0.42, 0.5, 0.38, 0.5, -math.pi / 2, -math.pi / 2 - 2 * math.pi)]),
    "T": (0.74, [
        [(0.0, 0.03), (0.72, 0.02)],
        [(0.37, 0.03), (0.36, 1.0)],
    ]),
    "I": (0.30, [
        [(0.15, 0.02), (0.14, 1.0)],
    ]),
    # acento agudo, desenhado acima do I
    "'": (0.0, [
        [(0.02, -0.22), (0.26, -0.44)],
    ]),
    " ": (0.46, []),
}


def build_strokes():
    """Monta a lista de tracos (em px, na folha) para o texto completo."""
    # sequencia de glifos: acento do I entra depois da haste
    seq = ["A", "N", "O", "T", "A", " ", "A", "I", "'"]

    # largura total (o acento nao avanca o cursor, e desenhado sobre o I)
    total = 0.0
    for i, g in enumerate(seq):
        total += GLYPHS[g][0]
        if GLYPHS[g][0] > 0 and i < len(seq) - 1:
            total += LETTER_GAP
    total_px = total * CAP_HEIGHT

    x0 = (W - total_px) / 2.0
    # a linha de base cai exatamente sobre uma das linhas do caderno
    baseline = H / 2.0 + BASELINE_OFFSET

    # a escrita acompanha a inclinacao da folha
    th = math.radians(-PAPER_ROT)
    cos_t, sin_t = math.cos(th), math.sin(th)

    def tilt(x, y):
        dx, dy = x - W / 2.0, y - H / 2.0
        return (W / 2.0 + dx * cos_t - dy * sin_t,
                H / 2.0 + dx * sin_t + dy * cos_t)

    strokes = []
    cursor = x0
    last_advance_x = cursor
    for g in seq:
        adv, glyph = GLYPHS[g]
        origin = cursor if adv > 0 else last_advance_x
        for stroke in glyph:
            pts = [tilt(origin + px * CAP_HEIGHT, baseline - (1.0 - py) * CAP_HEIGHT)
                   for px, py in stroke]
            strokes.append(pts)
        if adv > 0:
            last_advance_x = cursor
            cursor += (adv + LETTER_GAP) * CAP_HEIGHT
    return strokes


def resample(points, step=2.5):
    """Reamostra uma polilinha em passos regulares e aplica jitter de mao humana."""
    # 1) interpolacao linear densa
    dense = []
    for a, b in zip(points, points[1:]):
        seg = math.hypot(b[0] - a[0], b[1] - a[1])
        n = max(1, int(seg / step))
        for i in range(n):
            t = i / n
            dense.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    dense.append(points[-1])

    # 2) suavizacao (media movel) para curvas mais organicas
    out = []
    for i in range(len(dense)):
        lo, hi = max(0, i - 2), min(len(dense), i + 3)
        win = dense[lo:hi]
        out.append((sum(p[0] for p in win) / len(win),
                    sum(p[1] for p in win) / len(win)))

    # 3) jitter de baixa frequencia, perpendicular ao traco
    ph1, ph2 = random.uniform(0, 6.28), random.uniform(0, 6.28)
    jittered = []
    for i, (x, y) in enumerate(out):
        j = math.sin(i * 0.055 + ph1) * 1.7 + math.sin(i * 0.021 + ph2) * 2.3
        if i + 1 < len(out):
            dx, dy = out[i + 1][0] - x, out[i + 1][1] - y
        else:
            dx, dy = x - out[i - 1][0], y - out[i - 1][1]
        n = math.hypot(dx, dy) or 1.0
        jittered.append((x - dy / n * j, y + dx / n * j))
    return jittered


# ------------------------------------------------------------------ cena / papel

def make_background():
    bg = Image.new("RGB", (W, H), GREEN)

    pad = PAPER_PAD
    sheet = Image.new("RGBA", (PAPER_W + pad * 2, PAPER_H + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(sheet)
    box = (pad, pad, pad + PAPER_W, pad + PAPER_H)
    d.rounded_rectangle(box, radius=10, fill=PAPER + (255,),
                        outline=PAPER_EDGE + (255,), width=3)

    # linhas de caderno bem suaves
    for y in range(pad + RULE_TOP, pad + PAPER_H - 40, RULE_STEP):
        d.line((pad + 56, y, pad + PAPER_W - 56, y), fill=RULE + (150,), width=2)
    # margem vertical
    d.line((pad + 118, pad + 40, pad + 118, pad + PAPER_H - 40),
           fill=(238, 186, 186, 130), width=2)

    # textura leve do papel, restrita a area da folha (o fundo verde fica limpo)
    grain = Image.effect_noise((sheet.width, sheet.height), 28).convert("L")
    grain = grain.filter(ImageFilter.GaussianBlur(0.7))
    alpha = grain.point(lambda v: max(0, min(30, int((v - 128) * 0.55))))
    mask = Image.new("L", sheet.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=10, fill=255)
    tint = Image.new("RGBA", sheet.size, (178, 172, 156, 255))
    tint.putalpha(ImageChops.multiply(alpha, mask))
    sheet.alpha_composite(tint)

    sheet = sheet.rotate(PAPER_ROT, resample=Image.BICUBIC, expand=True)
    bg.paste(sheet, ((W - sheet.width) // 2, (H - sheet.height) // 2), sheet)
    return bg


# ------------------------------------------------------------------------- lapis

PENCIL_LEN = 760
SPRITE = 1100  # canvas quadrado, ponta no centro


def make_pencil():
    s = Image.new("RGBA", (SPRITE, SPRITE), (0, 0, 0, 0))
    d = ImageDraw.Draw(s)
    cx, tip_y = SPRITE // 2, SPRITE // 2
    hw = 27  # meia largura do corpo

    body_top = tip_y - PENCIL_LEN
    cone_h = 78
    cone_base = tip_y - cone_h
    lead_h = 26

    # madeira apontada
    d.polygon([(cx - hw, cone_base), (cx + hw, cone_base),
               (cx + 6, tip_y - lead_h), (cx - 6, tip_y - lead_h)],
              fill=(226, 197, 152, 255))
    d.polygon([(cx - hw, cone_base), (cx - 6, tip_y - lead_h),
               (cx - 1, tip_y - lead_h), (cx - 1, cone_base)],
              fill=(206, 174, 126, 255))
    # grafite
    d.polygon([(cx - 6, tip_y - lead_h), (cx + 6, tip_y - lead_h),
               (cx + 1, tip_y), (cx - 1, tip_y)], fill=(48, 46, 52, 255))

    # corpo hexagonal amarelo
    ferrule_h = 62
    eraser_h = 46
    body_bot = cone_base
    body_up = body_top + ferrule_h + eraser_h
    d.rectangle((cx - hw, body_up, cx + hw, body_bot), fill=(247, 191, 45, 255))
    d.rectangle((cx - hw, body_up, cx - hw + 11, body_bot), fill=(214, 158, 26, 255))
    d.rectangle((cx + hw - 13, body_up, cx + hw, body_bot), fill=(255, 214, 96, 255))
    d.line((cx - 4, body_up, cx - 4, body_bot), fill=(226, 170, 34, 200), width=2)
    d.line((cx + 12, body_up, cx + 12, body_bot), fill=(226, 170, 34, 160), width=2)

    # virola metalica
    d.rectangle((cx - hw, body_top + eraser_h, cx + hw, body_up),
                fill=(186, 190, 196, 255))
    for i in range(3):
        y = body_top + eraser_h + 14 + i * 14
        d.line((cx - hw, y, cx + hw, y), fill=(150, 155, 162, 255), width=3)
    d.rectangle((cx - hw, body_top + eraser_h, cx - hw + 10, body_up),
                fill=(150, 155, 162, 255))

    # borracha
    d.rounded_rectangle((cx - hw, body_top, cx + hw, body_top + eraser_h),
                        radius=14, fill=(232, 137, 137, 255))
    d.rounded_rectangle((cx - hw, body_top, cx - hw + 11, body_top + eraser_h),
                        radius=10, fill=(206, 112, 112, 255))

    # contorno geral suave
    d.line((cx - hw, body_up, cx - hw, body_bot), fill=(180, 130, 20, 120), width=2)
    d.line((cx + hw, body_up, cx + hw, body_bot), fill=(180, 130, 20, 120), width=2)
    return s


_pencil = None
_cache = {}


def pencil_at(angle):
    """Sprite do lapis rotacionado, com a ponta no centro do canvas."""
    key = round(angle * 2) / 2
    if key not in _cache:
        img = _pencil.rotate(key, resample=Image.BICUBIC,
                             center=(SPRITE // 2, SPRITE // 2))
        _cache[key] = img
    return _cache[key]


# ---------------------------------------------------------------------- timeline

def main():
    global _pencil
    out = sys.argv[1] if len(sys.argv) > 1 else "anota_ai_green_screen.mp4"

    strokes = [resample(s) for s in build_strokes()]
    _pencil = make_pencil()
    bg = make_background()

    # duracao de cada traco
    segs = []
    t = INTRO_TIME
    for pts in strokes:
        length = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))
        dur = max(0.12, length / WRITE_SPEED)
        segs.append({"pts": pts, "t0": t, "dur": dur})
        t += dur + LIFT_TIME
    write_end = t - LIFT_TIME
    total = write_end + OUTRO_LIFT + HOLD_TIME
    n_frames = int(round(total * FPS))

    # duas camadas: o nucleo escuro (com supersampling) e um halo suave de
    # grafite em resolucao normal. ImageDraw sobrescreve o alfa em vez de
    # mesclar, por isso o halo nao pode compartilhar a camada do nucleo.
    ink = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    ink_d = ImageDraw.Draw(ink)
    soft = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    soft_d = ImageDraw.Draw(soft)
    drawn = [0] * len(strokes)  # indice do ultimo ponto desenhado por traco

    def draw_upto(i, upto):
        pts = segs[i]["pts"]
        j = drawn[i]
        while j < upto:
            a, b = pts[j], pts[min(j + 1, len(pts) - 1)]
            r = STROKE_W / 2 + random.uniform(-0.35, 0.35)
            x0, y0, x1, y1 = a[0] * SS, a[1] * SS, b[0] * SS, b[1] * SS
            rs = r * SS
            ink_d.line((x0, y0, x1, y1), fill=INK + (255,), width=int(rs * 2))
            ink_d.ellipse((x0 - rs, y0 - rs, x0 + rs, y0 + rs), fill=INK + (255,))
            # halo (o granulado do grafite espalhado ao redor do traco)
            hr = r * 1.9
            soft_d.line((a[0], a[1], b[0], b[1]), fill=INK + (46,), width=int(hr * 2))
            j += 1
        drawn[i] = upto

    ffmpeg = subprocess.run(
        [sys.executable, "-c",
         "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"],
        capture_output=True, text=True, check=True).stdout.strip()

    cmd = [ffmpeg, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "17",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    first_pt = segs[0]["pts"][0]
    last_pt = segs[-1]["pts"][-1]

    for f in range(n_frames):
        now = f / FPS
        pen = None       # (x, y, angle, lift)

        if now < INTRO_TIME:                      # lapis desce para a folha
            k = 1 - (1 - now / INTRO_TIME) ** 3
            pen = (first_pt[0] + 40 * (1 - k), first_pt[1] - 220 * (1 - k),
                   -34 - 6 * (1 - k), 0)
        elif now <= write_end:
            state = None
            for i, s in enumerate(segs):
                if now < s["t0"]:                 # levantado, indo para o traco i
                    prev = segs[i - 1]
                    k = (now - (prev["t0"] + prev["dur"])) / LIFT_TIME
                    k = min(max(k, 0.0), 1.0)
                    a, b = prev["pts"][-1], s["pts"][0]
                    x = a[0] + (b[0] - a[0]) * k
                    y = a[1] + (b[1] - a[1]) * k - math.sin(k * math.pi) * 34
                    state = (x, y, -34, math.sin(k * math.pi))
                    break
                if now <= s["t0"] + s["dur"]:     # escrevendo o traco i
                    k = (now - s["t0"]) / s["dur"]
                    pts = s["pts"]
                    idx = min(len(pts) - 1, max(1, int(k * (len(pts) - 1))))
                    for jj in range(i):
                        draw_upto(jj, len(segs[jj]["pts"]) - 1)
                    draw_upto(i, idx)
                    x, y = pts[idx]
                    state = (x, y, -34, 0)
                    break
            if state is None:
                state = (last_pt[0], last_pt[1], -34, 0)
            pen = state
        else:                                     # saida do lapis
            for i in range(len(segs)):
                draw_upto(i, len(segs[i]["pts"]) - 1)
            k = min(1.0, (now - write_end) / OUTRO_LIFT)
            e = k * k * (3 - 2 * k)
            pen = (last_pt[0] + 150 * e, last_pt[1] - 520 * e, -34 - 10 * e, 1)

        frame = bg.copy()
        frame.paste(soft, (0, 0), soft)
        layer = ink.resize((W, H), Image.LANCZOS)
        frame.paste(layer, (0, 0), layer)

        x, y, ang, lift = pen
        wob = math.sin(now * 21.0) * 1.6 * (1 - lift)
        spr = pencil_at(ang + math.sin(now * 9.0) * 1.4)
        px = int(round(x + wob)) - SPRITE // 2
        py = int(round(y - 2 - lift * 6 + wob * 0.4)) - SPRITE // 2
        frame.paste(spr, (px, py), spr)

        proc.stdin.write(frame.tobytes())
        if f % 20 == 0:
            print(f"frame {f + 1}/{n_frames}", flush=True)

    proc.stdin.close()
    err = proc.stderr.read().decode(errors="ignore")
    if proc.wait() != 0:
        print(err[-2500:], file=sys.stderr)
        sys.exit(1)
    print(f"ok: {out} ({total:.2f}s, {n_frames} frames, {os.path.getsize(out)/1e6:.2f} MB)")


if __name__ == "__main__":
    main()
