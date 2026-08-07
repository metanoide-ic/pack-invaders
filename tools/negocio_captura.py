"""
Gera a animacao "NEGOCIO fugindo e sendo capturado por uma rede".

Saida: 1920x1080, 30fps, 5s exatos, fundo chroma key verde puro (#00FF00),
codificado em H.264 (yuv420p) para MP4.

Uso:
    python3 tools/negocio_captura.py [saida.mp4]
"""

import math
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------- configuracao

W, H = 1920, 1080
FPS = 30
DURATION = 5.0
NFRAMES = int(round(FPS * DURATION))  # 150
SS = 2  # supersampling: desenha em 2x e reduz com LANCZOS

CHROMA = (0, 255, 0)
INK = (16, 26, 56)  # azul quase preto: contorno da palavra e cordas
FILL = (255, 122, 26)  # laranja: preenchimento da palavra
FILL_DARK = (214, 84, 8)
ROPE = (26, 38, 74)
ROPE_LIT = (78, 96, 148)
WEIGHT = (58, 66, 92)
SWEAT = (70, 150, 240)

FONT_DIR = Path("/mnt/skills/examples/canvas-design/canvas-fonts")
FONT_CANDIDATES = [
    FONT_DIR / "Outfit-Bold.ttf",
    FONT_DIR / "WorkSans-Bold.ttf",
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]

WORD = "NEGÓCIO"

# ------------------------------------------------------------------- utilidades


def pick_font(size):
    for path in FONT_CANDIDATES:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    raise RuntimeError("nenhuma fonte disponivel")


def ease_out(x):
    return 1.0 - (1.0 - x) ** 3


def ease_in(x):
    return x * x * x


def ease_in_out(x):
    return 3 * x * x - 2 * x * x * x


def clamp01(x):
    return max(0.0, min(1.0, x))


def seg(t, t0, t1):
    """Progresso normalizado de t dentro da janela [t0, t1]."""
    if t1 <= t0:
        return 1.0
    return clamp01((t - t0) / (t1 - t0))


def lerp(a, b, k):
    return a + (b - a) * k


# --------------------------------------------------------- sprite da palavra


def build_word_sprite():
    """Renderiza a palavra uma unica vez, em alta resolucao, com contorno."""
    font = pick_font(210 * SS)
    stroke = 12 * SS
    pad = 40 * SS
    tmp = Image.new("RGBA", (10, 10))
    box = ImageDraw.Draw(tmp).textbbox(
        (0, 0), WORD, font=font, stroke_width=stroke, anchor="lt"
    )
    w = box[2] - box[0] + pad * 2
    h = box[3] - box[1] + pad * 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ox, oy = pad - box[0], pad - box[1]
    # sombra chapada deslocada, estilo arcade
    d.text(
        (ox + 10 * SS, oy + 12 * SS),
        WORD,
        font=font,
        fill=INK,
        stroke_width=stroke,
        stroke_fill=INK,
        anchor="lt",
    )
    d.text(
        (ox, oy),
        WORD,
        font=font,
        fill=FILL,
        stroke_width=stroke,
        stroke_fill=INK,
        anchor="lt",
    )
    # faixa inferior mais escura, dando volume ao preenchimento
    band = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(band).rectangle([0, int(h * 0.62), w, h], fill=FILL_DARK + (110,))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).text(
        (ox, oy), WORD, font=font, fill=255, stroke_width=0, anchor="lt"
    )
    img = Image.composite(Image.alpha_composite(img, band), img, mask)
    return img


WORD_SPRITE = build_word_sprite()
WORD_W = WORD_SPRITE.width / SS
WORD_H = WORD_SPRITE.height / SS


def paste_word(canvas, cx, cy, scale_x, scale_y, angle):
    """Cola a palavra centrada em (cx, cy) — coordenadas em 1x."""
    w = max(4, int(WORD_SPRITE.width * scale_x))
    h = max(4, int(WORD_SPRITE.height * scale_y))
    spr = WORD_SPRITE.resize((w, h), Image.LANCZOS)
    if abs(angle) > 0.01:
        spr = spr.rotate(angle, resample=Image.BICUBIC, expand=True)
    x = int(cx * SS - spr.width / 2)
    y = int(cy * SS - spr.height / 2)
    canvas.alpha_composite(spr, (x, y))


# ------------------------------------------------------------------- a rede


def net_mapper(cx, cy, rx, ry, rot, mesh_rot, wobble, phase):
    """Mapeia o disco unitario (u, v) para a posicao da rede na tela."""
    ca, sa = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    cm, sm = math.cos(math.radians(mesh_rot)), math.sin(math.radians(mesh_rot))

    def f(u, v):
        # ondulacao do tecido
        du = wobble * math.sin(4.2 * v + 3.1 * u + phase)
        dv = wobble * math.sin(3.7 * u - 2.6 * v + phase * 1.3)
        uu, vv = u + du, v + dv
        # rotaciona a malha ainda no espaco unitario: as celulas viram losangos
        mu, mv = uu * cm - vv * sm, uu * sm + vv * cm
        px, py = mu * rx, mv * ry
        return (cx + px * ca - py * sa, cy + px * sa + py * ca)

    return f


def _circle_hit(a, b):
    """Onde o segmento a->b (espaco unitario) cruza o circulo unitario."""
    ax, ay = a
    dx, dy = b[0] - ax, b[1] - ay
    qa = dx * dx + dy * dy
    if qa <= 1e-9:
        return a
    qb = 2 * (ax * dx + ay * dy)
    qc = ax * ax + ay * ay - 1.0
    disc = qb * qb - 4 * qa * qc
    if disc < 0:
        return a
    s = (-qb + math.sqrt(disc)) / (2 * qa)
    s = clamp01(s)
    return (ax + dx * s, ay + dy * s)


def draw_net(canvas, cx, cy, rx, ry, rot, phase, wobble=0.0, thick=1.0, grid=13):
    """Rede opaca: malha em losangos fechada por um aro com pesos."""
    d = ImageDraw.Draw(canvas)
    f = net_mapper(cx, cy, rx, ry, rot, 45.0, wobble, phase)
    lw = max(1, int(round(4.5 * thick * SS)))
    hl = max(1, int(round(1.6 * thick * SS)))

    def line(a, b, color, width):
        d.line([a[0] * SS, a[1] * SS, b[0] * SS, b[1] * SS], fill=color, width=width)

    uv = [
        [(-1.0 + 2.0 * i / (grid - 1), -1.0 + 2.0 * j / (grid - 1)) for j in range(grid)]
        for i in range(grid)
    ]
    inside = [[uv[i][j][0] ** 2 + uv[i][j][1] ** 2 <= 1.0 for j in range(grid)] for i in range(grid)]

    for i in range(grid):
        for j in range(grid):
            for di, dj in ((1, 0), (0, 1)):
                ni, nj = i + di, j + dj
                if ni >= grid or nj >= grid:
                    continue
                pa, pb = uv[i][j], uv[ni][nj]
                ia, ib = inside[i][j], inside[ni][nj]
                if not ia and not ib:
                    continue
                if not ib:  # corta na borda: a malha encosta no aro
                    pb = _circle_hit(pa, pb)
                elif not ia:
                    pa = _circle_hit(pb, pa)
                a, b = f(*pa), f(*pb)
                line(a, b, ROPE, lw)
                line((a[0], a[1] - 1.4), (b[0], b[1] - 1.4), ROPE_LIT, hl)

    # aro / cordao de fechamento
    steps = 96
    rim = []
    for k in range(steps + 1):
        th = 2 * math.pi * k / steps
        px, py = f(math.cos(th), math.sin(th))
        rim.append((px * SS, py * SS))
    d.line(rim, fill=ROPE, width=max(2, int(round(7.5 * thick * SS))), joint="curve")

    # pesos do lancamento nas pontas
    for k in range(6):
        wx, wy = rim[int(steps * k / 6)]
        r = 12 * thick * SS
        d.ellipse([wx - r, wy - r, wx + r, wy + r], fill=WEIGHT)
        d.ellipse(
            [wx - r * 0.5, wy - r * 0.66, wx - r * 0.06, wy - r * 0.22],
            fill=(150, 158, 180),
        )
    return rim


def draw_tether(canvas, ax, ay, bx, by, sag):
    """Cabo que liga a rede ao lancador, fora de quadro."""
    d = ImageDraw.Draw(canvas)
    pts = []
    for k in range(41):
        s = k / 40
        x = lerp(ax, bx, s)
        y = lerp(ay, by, s) + math.sin(math.pi * s) * sag
        pts.append((x * SS, y * SS))
    d.line(pts, fill=ROPE, width=int(6 * SS), joint="curve")


# ------------------------------------------------------------------- efeitos


def speed_lines(canvas, x, y, direction, strength, t):
    """Rastro de velocidade atras da palavra. Some encurtando, nunca esmaecendo."""
    if strength <= 0.01:
        return
    d = ImageDraw.Draw(canvas)
    for k in range(8):
        off = (k * 131 + int(t * 620)) % 300
        ly = y - 130 + k * 42 + math.sin(t * 22 + k) * 7
        length = (150 + off * 0.9) * strength
        x0 = x - direction * (WORD_W * 0.48 + off * 0.6)
        d.line(
            [x0 * SS, ly * SS, (x0 - direction * length) * SS, ly * SS],
            fill=INK,
            width=int((6 + (k % 3) * 3) * SS),
        )


def dust_puff(canvas, x, y, age, count=9, spread=210, base=26):
    """Poeira: as particulas crescem, sobem e encolhem ate sumir."""
    if not (0.0 <= age <= 1.0):
        return
    d = ImageDraw.Draw(canvas)
    e = ease_out(age)
    for k in range(count):
        ang = math.pi * (0.1 + 0.8 * k / (count - 1))
        dist = 30 + spread * e * (0.6 + 0.4 * ((k * 5) % 4) / 3)
        px = x - math.cos(ang) * dist
        py = y - math.sin(ang) * dist * 0.45
        r = base * (1 - age) * (0.65 + 0.35 * ((k * 3) % 3) / 2)
        if r < 1.5:
            continue
        d.ellipse(
            [(px - r) * SS, (py - r) * SS, (px + r) * SS, (py + r) * SS],
            fill=(126, 132, 156),
        )


def impact_burst(canvas, x, y, age):
    """Anel e estrelinhas do impacto. Encolhem a espessura ate desaparecer."""
    if not (0.0 <= age < 1.0):
        return
    d = ImageDraw.Draw(canvas)
    for ring, scale in ((0.0, 1.0), (0.24, 0.5)):
        if age <= ring:
            continue
        p = clamp01((age - ring) / (1 - ring))
        rr = 140 + 700 * ease_out(p)
        wdt = int(round(9 * (1 - p) ** 1.6 * scale * SS))
        if wdt < SS:
            continue
        d.ellipse(
            [(x - rr) * SS, (y - rr * 0.62) * SS, (x + rr) * SS, (y + rr * 0.62) * SS],
            outline=FILL,
            width=wdt,
        )
    e = ease_out(age)
    for k in range(14):
        ang = 2 * math.pi * k / 14 + 0.15
        r0 = 170 + 340 * e
        r1 = r0 + 160 * (1 - age)
        wdt = int(round(10 * (1 - age) ** 1.4 * SS))
        if wdt < SS:
            continue
        d.line(
            [
                (x + math.cos(ang) * r0) * SS,
                (y + math.sin(ang) * r0 * 0.62) * SS,
                (x + math.cos(ang) * r1) * SS,
                (y + math.sin(ang) * r1 * 0.62) * SS,
            ],
            fill=INK,
            width=wdt,
        )


def panic_marks(canvas, x, y, t, strength):
    """Dois '!' piscando. O pisca e liga/desliga: nada semitransparente."""
    if strength <= 0.01 or math.sin(t * 34) < -0.25:
        return
    font = pick_font(int(150 * SS))
    for sgn in (-1, 1):
        img = Image.new("RGBA", (200 * SS, 240 * SS), (0, 0, 0, 0))
        ImageDraw.Draw(img).text(
            (100 * SS, 120 * SS),
            "!",
            font=font,
            fill=FILL,
            stroke_width=int(11 * SS),
            stroke_fill=INK,
            anchor="mm",
        )
        img = img.rotate(-sgn * 18, resample=Image.BICUBIC)
        px = (x + sgn * (WORD_W * 0.42 * strength + 60)) * SS - img.width // 2
        py = (y - 70 - 14 * math.sin(t * 24)) * SS - img.height // 2
        canvas.alpha_composite(img, (int(px), int(py)))


def sweat(canvas, x, y, t, strength):
    """Gotas de suor caindo nas laterais da palavra."""
    if strength <= 0.01:
        return
    d = ImageDraw.Draw(canvas)
    for k in range(4):
        ph = (t * 1.9 + k * 0.27) % 1.0
        sgn = -1 if k % 2 else 1
        px = x + sgn * (WORD_W * 0.5 + 40 + (k // 2) * 60) + ph * 34 * sgn
        py = y - WORD_H * 0.5 + ph * 190
        r = 18 * (1 - ph * 0.85) * strength
        if r < 2:
            continue
        d.ellipse(
            [(px - r) * SS, (py - r * 1.35) * SS, (px + r) * SS, (py + r * 1.15) * SS],
            fill=SWEAT,
            outline=INK,
            width=max(1, int(3 * SS)),
        )


# ----------------------------------------------------------------- coreografia

# marcos de tempo (segundos)
T_RUN1 = (0.00, 0.78)  # entra pela esquerda correndo
T_SKID = (0.78, 1.05)  # freia e vira
T_RUN2 = (1.05, 1.72)  # corre de volta para a esquerda
T_PANIC = (1.72, 2.28)  # percebe a rede e se desespera
T_SHOT = 1.86  # disparo da rede
T_HIT = 2.28  # impacto
T_DRAG = (2.28, 3.30)  # puxao do cabo
T_END = 5.00

CAP_X, CAP_Y = 880.0, 545.0  # onde a captura acontece
LAUNCH = (2180.0, 1290.0)  # posicao do lancador, fora de quadro


def word_state(t):
    """Retorna (x, y, escala_x, escala_y, angulo, direcao, forca_das_linhas)."""
    if t < T_RUN1[1]:
        p = seg(t, *T_RUN1)
        x = lerp(-620, 1620, ease_out(p))
        hop = abs(math.sin(t * 15.5)) * 46
        y = CAP_Y - hop
        squash = 1.0 + 0.10 * math.sin(t * 15.5 * 2)
        return x, y, 1.0 / squash, squash, -7 - 3 * math.sin(t * 9), 1.0, 1.0
    if t < T_SKID[1]:
        p = seg(t, *T_SKID)
        x = lerp(1620, 1700, ease_out(p)) - 60 * ease_in(p)
        y = CAP_Y - 10 * math.sin(math.pi * p)
        ang = lerp(-7, 15, ease_out(p))
        return x, y, 1.06, 0.94, ang, 1.0, 1.0 - p
    if t < T_RUN2[1]:
        p = seg(t, *T_RUN2)
        x = lerp(1640, 760, ease_in_out(p))
        hop = abs(math.sin(t * 16.5)) * 40
        y = CAP_Y - hop
        squash = 1.0 + 0.09 * math.sin(t * 16.5 * 2)
        return x, y, 1.0 / squash, squash, 8 + 3 * math.sin(t * 9), -1.0, min(1.0, p * 3)
    if t < T_PANIC[1]:
        p = seg(t, *T_PANIC)
        x = lerp(760, CAP_X, ease_out(p))
        jump = abs(math.sin(p * math.pi * 3.2)) * 55 * (1 - p * 0.4)
        y = CAP_Y - jump
        ang = 6 * math.sin(t * 26) * (1 - p * 0.3)
        s = 1.0 + 0.05 * math.sin(t * 26)
        return x, y, s, 2.0 - s, ang, -1.0, 0.0
    # capturado
    p = seg(t, T_HIT, T_END)
    drag = ease_out(seg(t, *T_DRAG))
    x = CAP_X + 70 * drag
    y = CAP_Y + 34 * drag
    # luta: amplitude com decaimento exponencial
    damp = math.exp(-2.5 * (t - T_HIT))
    x += 26 * damp * math.sin((t - T_HIT) * 21)
    y += 16 * damp * math.sin((t - T_HIT) * 17 + 1.1)
    ang = 10 * drag + 7 * damp * math.sin((t - T_HIT) * 19 + 0.4)
    # esmagada pela rede logo apos o impacto
    hit = clamp01((t - T_HIT) / 0.16)
    sx = lerp(1.20, 0.90 + 0.02 * damp * math.sin((t - T_HIT) * 23), ease_out(hit))
    sy = lerp(0.78, 0.86 + 0.02 * damp * math.sin((t - T_HIT) * 23), ease_out(hit))
    return x, y, sx, sy, ang, -1.0, 0.0


def net_state(t):
    """(cx, cy, rx, ry, rot, wobble, thick) da rede, ou None antes do disparo."""
    if t < T_SHOT:
        return None
    if t < T_HIT:
        p = seg(t, T_SHOT, T_HIT)
        e = ease_in_out(p)
        cx = lerp(LAUNCH[0], CAP_X, e)
        cy = lerp(LAUNCH[1], CAP_Y + 10, e) - math.sin(math.pi * p) * 130
        # voa fechada e so se abre na chegada
        open_p = ease_out(clamp01((p - 0.58) / 0.42))
        rx = lerp(95, 640, open_p)
        ry = lerp(80, 372, open_p)
        rot = -220 * p + 40
        return cx, cy, rx, ry, rot, 0.05 + 0.05 * math.sin(t * 40), 1.0
    wx, wy, _, _, wang, _, _ = word_state(t)
    damp = math.exp(-2.3 * (t - T_HIT))
    settle = ease_out(clamp01((t - T_HIT) / 0.5))
    rx = lerp(660, 570, settle) + 14 * damp * math.sin((t - T_HIT) * 20)
    ry = lerp(400, 330, settle) + 10 * damp * math.sin((t - T_HIT) * 18 + 0.7)
    rot = wang * 0.55
    wob = 0.045 + 0.075 * damp * math.sin((t - T_HIT) * 15)
    return wx, wy + 6, rx, ry, rot, wob, 1.0


# ------------------------------------------------------------------- render


def render_frame(i):
    t = i / FPS
    canvas = Image.new("RGBA", (W * SS, H * SS), CHROMA + (255,))

    wx, wy, sx, sy, wang, wdir, slines = word_state(t)
    net = net_state(t)

    speed_lines(canvas, wx, wy, wdir, slines, t)
    if t > T_SKID[0]:
        dust_puff(canvas, 1660, CAP_Y + WORD_H * 0.5, seg(t, T_SKID[0], T_SKID[0] + 0.45))

    panic_s = 0.0
    if T_PANIC[0] <= t < T_HIT:
        panic_s = min(1.0, (t - T_PANIC[0]) / 0.12)
    sweat(canvas, wx, wy, t, panic_s)

    # cabo do lancador, visivel a partir do disparo
    if net is not None:
        cx, cy, rx, ry, rot, wob, thick = net
        draw_tether(canvas, LAUNCH[0], LAUNCH[1], cx + rx * 0.35, cy + ry * 0.55, -40)

    # a rede vem de longe por tras da palavra e passa a frente ao se abrir
    net_in_front = t >= T_HIT or (net is not None and seg(t, T_SHOT, T_HIT) > 0.6)
    if net is not None and not net_in_front:
        cx, cy, rx, ry, rot, wob, thick = net
        draw_net(canvas, cx, cy, rx, ry, rot, t * 9, wob, thick=0.85, grid=11)

    paste_word(canvas, wx, wy, sx, sy, wang)
    panic_marks(canvas, wx, wy - WORD_H * 0.55, t, panic_s)

    if net is not None and net_in_front:
        late = t >= T_HIT
        cx, cy, rx, ry, rot, wob, thick = net
        draw_net(canvas, cx, cy, rx, ry, rot, t * (4.5 if late else 9), wob,
                 thick=1.0 if late else 0.9, grid=13 if late else 11)

    if t >= T_HIT:
        impact_burst(canvas, CAP_X, CAP_Y, seg(t, T_HIT, T_HIT + 0.42))
        dust_puff(canvas, CAP_X, CAP_Y + 470, seg(t, T_HIT, T_HIT + 0.55),
                  count=11, spread=520, base=28)

    out = canvas.convert("RGB").resize((W, H), Image.LANCZOS)
    return out


def main():
    dest = Path(sys.argv[1] if len(sys.argv) > 1 else "negocio_capturado.mp4")
    import imageio_ffmpeg

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg, "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "pipe:0",
        "-an",
        "-c:v", "libx264", "-preset", "slow", "-crf", "16",
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
        "-movflags", "+faststart",
        str(dest),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
                            stderr=subprocess.PIPE)
    for i in range(NFRAMES):
        proc.stdin.write(render_frame(i).tobytes())
        if i % 25 == 0:
            print(f"frame {i}/{NFRAMES}", flush=True)
    proc.stdin.close()
    err = proc.stderr.read().decode(errors="ignore")
    if proc.wait() != 0:
        raise SystemExit(err[-3000:])
    print(f"ok -> {dest}")


if __name__ == "__main__":
    main()
