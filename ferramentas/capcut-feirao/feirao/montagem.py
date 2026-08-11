"""Monta um video do zero a partir de fotos, clipes e uma lista de ofertas.

Este e o modulo que faltava para o `template.py` sair do papel: ele pega a
estrutura (abertura -> ofertas -> encerramento) e vira MP4 de verdade.

Cada bloco e renderizado como um clipe normalizado (mesma resolucao, mesmo
fps, sempre com trilha de audio — silenciosa quando a midia nao tem) e no fim
tudo e emendado. Normalizar antes de emendar e o que evita o classico video
que trava na virada de um clipe para o outro.
"""

from __future__ import annotations

import os
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFilter

from . import fontes, media, template

FUNDO = (14, 18, 28)
OURO = (255, 205, 60)


# ------------------------------------------------------------- cartoes


def _quebra(d, texto: str, f, largura_max: int) -> list:
    """Quebra o texto em linhas que cabem na largura dada."""
    linhas, atual = [], ""
    for palavra in texto.split():
        teste = f"{atual} {palavra}".strip()
        if atual and f.getbbox(teste)[2] > largura_max:
            linhas.append(atual)
            atual = palavra
        else:
            atual = teste
    if atual:
        linhas.append(atual)
    return linhas


def cartao(titulo: str, subtitulo: str, largura: int, altura: int,
           cor_titulo=OURO) -> Image.Image:
    """Uma tela de texto — serve de abertura e de encerramento."""
    img = Image.new("RGB", (largura, altura), FUNDO)
    d = ImageDraw.Draw(img)

    # brilho suave atras do texto, para nao ficar chapado
    halo = Image.new("L", (largura, altura), 0)
    ImageDraw.Draw(halo).ellipse(
        [largura * 0.06, altura * 0.30, largura * 0.94, altura * 0.70], fill=64)
    img.paste(Image.new("RGB", (largura, altura), (38, 48, 70)), (0, 0),
              halo.filter(ImageFilter.GaussianBlur(largura // 8)))

    tam = int(altura * 0.085)
    f = fontes.carrega("impacto", tam)
    linhas = _quebra(d, (titulo or "").upper(), f, int(largura * 0.86))
    while len(linhas) > 3 and tam > 20:
        tam = int(tam * 0.88)
        f = fontes.carrega("impacto", tam)
        linhas = _quebra(d, (titulo or "").upper(), f, int(largura * 0.86))

    alt_linha = int(tam * 1.16)
    y = altura / 2 - (len(linhas) * alt_linha) / 2
    if subtitulo:
        y -= altura * 0.035
    for linha in linhas:
        bb = f.getbbox(linha)
        x = largura / 2 - (bb[2] + bb[0]) / 2
        d.text((x + 3, y + 4), linha, font=f, fill=(0, 0, 0))
        d.text((x, y), linha, font=f, fill=cor_titulo)
        y += alt_linha

    if subtitulo:
        fs = fontes.carrega("impacto", int(altura * 0.034))
        y += altura * 0.018
        for linha in _quebra(d, subtitulo, fs, int(largura * 0.82)):
            bb = fs.getbbox(linha)
            d.text((largura / 2 - (bb[2] + bb[0]) / 2, y), linha, font=fs,
                   fill=(236, 240, 248))
            y += int(fs.size * 1.24)
    return img


def faixa_oferta(texto: str, largura: int, altura: int) -> Image.Image:
    """Faixa translucida com o texto da oferta, para sobrepor na midia."""
    img = Image.new("RGBA", (largura, altura), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    linhas = [l for l in (texto or "").split("\n") if l.strip()]
    if not linhas:
        return img

    tam = int(altura * 0.052)
    f = fontes.carrega("impacto", tam)
    while tam > 16 and max(f.getbbox(l)[2] for l in linhas) > largura * 0.84:
        tam = int(tam * 0.9)
        f = fontes.carrega("impacto", tam)

    alt_linha = int(tam * 1.22)
    alto = alt_linha * len(linhas) + int(altura * 0.045)
    # a faixa vai no topo e o rodape fica inteiro livre para a legenda
    # queimada — as duas competiam pelo mesmo terco de baixo
    topo = int(altura * 0.10)
    d.rectangle([0, topo, largura, topo + alto], fill=(8, 10, 16, 205))
    d.rectangle([0, topo, largura, topo + max(3, altura // 320)], fill=OURO + (255,))

    y = topo + int(altura * 0.022)
    for i, linha in enumerate(linhas):
        bb = f.getbbox(linha)
        cor = OURO if i == 1 else (255, 255, 255)     # a 2a linha e o preco
        d.text((largura / 2 - (bb[2] + bb[0]) / 2, y), linha, font=f,
               fill=cor + (255,))
        y += alt_linha
    return img


# --------------------------------------------------------- clipes


def _clipe_de_imagem(img: Image.Image, saida: str, duracao: float,
                     fps: int) -> str:
    """Imagem parada vira clipe com trilha silenciosa."""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        caminho_png = tmp.name
    img.save(caminho_png)
    try:
        _roda([media.ffmpeg(), "-y", "-hide_banner", "-loop", "1",
               "-i", caminho_png, "-f", "lavfi",
               "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
               "-t", f"{duracao:.3f}", "-r", str(fps),
               "-c:v", "libx264", "-preset", "medium", "-crf", "18",
               "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
               "-shortest", saida])
    finally:
        os.unlink(caminho_png)
    return saida


def _clipe_de_midia(arquivo: str, saida: str, duracao: float,
                    largura: int, altura: int, fps: int,
                    sobreposicao: Image.Image | None = None) -> str:
    """Foto ou video vira um clipe do tamanho certo, com a faixa por cima.

    Foto ganha um movimento lento de aproximacao (Ken Burns) — parado no meio
    de um video em movimento chama atencao pelo motivo errado.
    """
    eh_foto = os.path.splitext(arquivo)[1].lower() in (
        ".jpg", ".jpeg", ".png", ".webp", ".bmp")

    enquadra = (f"scale={largura}:{altura}:force_original_aspect_ratio=increase,"
                f"crop={largura}:{altura}")

    entradas = ["-loop", "1", "-i", arquivo] if eh_foto else ["-i", arquivo]
    if eh_foto:
        quadros = max(2, int(duracao * fps))
        # dobra a escala antes do zoompan: sem isso o movimento sai tremido
        cadeia = (f"{enquadra},scale={largura * 2}:{altura * 2},"
                  f"zoompan=z='min(zoom+0.0009,1.18)'"
                  f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
                  f":d={quadros}:s={largura}x{altura}:fps={fps}")
    else:
        cadeia = f"{enquadra},fps={fps}"

    caminho_png = None
    if sobreposicao is not None:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            caminho_png = tmp.name
        sobreposicao.save(caminho_png)

    try:
        cmd = [media.ffmpeg(), "-y", "-hide_banner"] + entradas
        if caminho_png:
            cmd += ["-i", caminho_png]
        cmd += ["-f", "lavfi",
                "-i", "anullsrc=channel_layout=stereo:sample_rate=44100"]

        idx_audio = 2 if caminho_png else 1
        if caminho_png:
            grafo = f"[0:v]{cadeia}[base];[base][1:v]overlay=0:0[vo]"
        else:
            grafo = f"[0:v]{cadeia}[vo]"

        cmd += ["-filter_complex", grafo, "-map", "[vo]",
                "-map", f"{idx_audio}:a", "-t", f"{duracao:.3f}",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
                "-shortest", saida]
        _roda(cmd)
    finally:
        if caminho_png:
            os.unlink(caminho_png)
    return saida


def _roda(cmd: list) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])


def _emenda(clipes: list, saida: str) -> str:
    """Junta os clipes ja normalizados."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False,
                                     encoding="utf-8") as fh:
        lista = fh.name
        for c in clipes:
            seguro = os.path.abspath(c).replace("\\", "/").replace("'", "'\\''")
            fh.write(f"file '{seguro}'\n")
    try:
        _roda([media.ffmpeg(), "-y", "-hide_banner", "-f", "concat",
               "-safe", "0", "-i", lista, "-c", "copy", saida])
    finally:
        os.unlink(lista)
    return saida


# ------------------------------------------------------------- montagem


def monta(midias: list, saida: str, ofertas: list | None = None,
          conf: dict | None = None, nome: str = "Feirao",
          progresso=None) -> dict:
    """Monta o video completo. Devolve o caminho e o plano usado."""
    if not midias:
        raise ValueError("nenhuma foto ou clipe para montar")

    conf = conf or template.template_padrao()
    plano = template.monta_plano(conf, midias, ofertas, nome=nome)
    L, A, FPS = plano.largura, plano.altura, plano.fps

    faltando = [m for m in midias if not os.path.isfile(m)]
    if faltando:
        raise FileNotFoundError(f"nao achei: {faltando[0]}")

    temp = tempfile.mkdtemp(prefix="feirao_")
    clipes = []
    try:
        for i, bloco in enumerate(plano.blocos):
            destino = os.path.join(temp, f"{i:03d}.mp4")
            if progresso:
                progresso(f"  bloco {i + 1}/{len(plano.blocos)}: {bloco.nome}")

            if bloco.tipo in ("titulo", "encerramento"):
                img = cartao(bloco.textos.get("titulo", ""),
                             bloco.textos.get("subtitulo", ""), L, A)
                _clipe_de_imagem(img, destino, bloco.duracao, FPS)
            else:
                legenda = bloco.textos.get("legenda", "")
                faixa = faixa_oferta(legenda, L, A) if legenda else None
                _clipe_de_midia(bloco.arquivo, destino, bloco.duracao,
                                L, A, FPS, faixa)
            clipes.append(destino)

        if progresso:
            progresso("  emendando...")
        os.makedirs(os.path.dirname(os.path.abspath(saida)), exist_ok=True)
        _emenda(clipes, saida)
    finally:
        for c in clipes:
            try:
                os.unlink(c)
            except OSError:
                pass
        try:
            os.rmdir(temp)
        except OSError:
            pass

    return {"video": saida, "plano": plano,
            "duracao": plano.duracao_total(),
            "blocos": [b.nome for b in plano.blocos]}
