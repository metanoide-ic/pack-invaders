"""
Base compartilhada pelas animacoes de chroma key deste projeto.

Formato padrao: 1920x1080, 30fps, fundo verde puro (#00FF00), H.264/yuv420p.

Regra de ouro do chroma: nada semitransparente pode encostar no fundo. Um
elemento com alpha parcial vira "verde escuro" na hora do key. Por isso todo
efeito aqui aparece e some por tamanho/espessura, nunca por opacidade, e as
cores de frente ficam longe do verde no espectro.
"""

import math
import subprocess
from pathlib import Path

from PIL import ImageFont

# ---------------------------------------------------------------- configuracao

W, H = 1920, 1080
FPS = 30
SS = 2  # supersampling: desenha em 2x e reduz com LANCZOS

CHROMA = (0, 255, 0)
INK = (16, 26, 56)  # azul quase preto: contornos
FILL = (255, 122, 26)  # laranja
FILL_DARK = (214, 84, 8)

FONT_DIR = Path("/mnt/skills/examples/canvas-design/canvas-fonts")
FONT_CANDIDATES = [
    FONT_DIR / "Outfit-Bold.ttf",
    FONT_DIR / "WorkSans-Bold.ttf",
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]


def pick_font(size):
    for path in FONT_CANDIDATES:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    raise RuntimeError("nenhuma fonte disponivel")


# ------------------------------------------------------------------- easings


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


def rand(*seed):
    """Pseudo-aleatorio deterministico em [0, 1): mesmo frame, mesmo resultado."""
    x = math.sin(sum(s * k for s, k in zip(seed, (12.9898, 78.233, 37.719)))) * 43758.5453
    return x - math.floor(x)


# -------------------------------------------------------------- codificacao


def encode(frames, dest, fps=FPS, size=(W, H)):
    """Consome um iteravel de PIL.Image RGB e grava um MP4 H.264."""
    import imageio_ffmpeg

    cmd = [
        imageio_ffmpeg.get_ffmpeg_exe(), "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{size[0]}x{size[1]}", "-r", str(fps), "-i", "pipe:0",
        "-an",
        "-c:v", "libx264", "-preset", "slow", "-crf", "16",
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
        "-movflags", "+faststart",
        str(dest),
    ]
    proc = subprocess.Popen(
        cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE
    )
    for i, frame in enumerate(frames):
        proc.stdin.write(frame.tobytes())
        if i % 25 == 0:
            print(f"frame {i}", flush=True)
    proc.stdin.close()
    err = proc.stderr.read().decode(errors="ignore")
    if proc.wait() != 0:
        raise SystemExit(err[-3000:])
    print(f"ok -> {dest}")
