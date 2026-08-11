"""Texto na tela: desenhado aqui, queimado no video aqui.

Ate agora o executor so anotava "poe TAL texto no segundo X" no roteiro e
deixava o trabalho para voce. Agora ele desenha e aplica.

Dois modos:

  - na frente: o texto entra por cima da imagem, com fade curto para nao
    aparecer estalando;
  - atras da pessoa: o mesmo texto entra por cima do video e a pessoa
    recortada (recorte.py) entra por cima do texto. E a camada do meio — o
    efeito que faz o video parecer editado por gente.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFilter

from . import fontes, media, recorte

OURO = (255, 205, 60)

# estilo -> (familia da fonte, cor, tamanho relativo a altura, contorno)
ESTILOS = {
    "impacto": ("impacto", (255, 255, 255), 0.085, "contorno"),
    "oferta": ("pesada", OURO, 0.095, "sombra"),
    "sutil": ("condensada", (232, 236, 244), 0.042, "leve"),
}

# posicao -> (ancora horizontal, centro vertical relativo)
POSICOES = {
    "topo": ("centro", 0.16),
    "centro": ("centro", 0.50),
    "rodape": ("centro", 0.84),
    "esquerda": ("esquerda", 0.50),
    "direita": ("direita", 0.50),
}

FADE = 0.18


def _quebra(texto: str, f, largura_max: int) -> list:
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


def desenha(texto: str, estilo: str = "impacto", posicao: str = "centro",
            largura: int = 1080, altura: int = 1920) -> Image.Image:
    """Uma camada RGBA do tamanho do video, com o texto no lugar certo."""
    familia, cor, rel, acabamento = ESTILOS.get(estilo, ESTILOS["impacto"])
    ancora, centro_y = POSICOES.get(posicao, POSICOES["centro"])

    img = Image.new("RGBA", (largura, altura), (0, 0, 0, 0))
    texto = (texto or "").strip()
    if not texto:
        return img

    if estilo != "sutil":
        texto = texto.upper()
    largura_max = int(largura * (0.60 if ancora != "centro" else 0.86))
    tam = max(12, int(altura * rel))
    f = fontes.carrega(familia, tam)
    linhas = _quebra(texto, f, largura_max)

    def mais_larga(ls, fonte):
        return max((fonte.getbbox(l)[2] for l in ls), default=0)

    # encolhe ate caber na largura E em tres linhas — palavra comprida nao e
    # quebrada no meio, entao contar linhas sozinho deixa vazar pela lateral
    while tam > 14 and (len(linhas) > 3 or mais_larga(linhas, f) > largura_max):
        tam = int(tam * 0.9)
        f = fontes.carrega(familia, tam)
        linhas = _quebra(texto, f, largura_max)

    alt_linha = int(tam * 1.15)
    y = altura * centro_y - (len(linhas) * alt_linha) / 2
    margem = int(largura * 0.06)
    d = ImageDraw.Draw(img)

    for linha in linhas:
        bb = f.getbbox(linha)
        if ancora == "esquerda":
            x = margem
        elif ancora == "direita":
            x = largura - margem - (bb[2] - bb[0]) - bb[0]
        else:
            x = largura / 2 - (bb[2] + bb[0]) / 2

        if acabamento == "contorno":
            grossura = max(2, tam // 16)
            d.text((x, y), linha, font=f, fill=(0, 0, 0, 235),
                   stroke_width=grossura, stroke_fill=(0, 0, 0, 235))
        elif acabamento == "sombra":
            sombra = Image.new("RGBA", img.size, (0, 0, 0, 0))
            ImageDraw.Draw(sombra).text((x + tam * 0.05, y + tam * 0.07), linha,
                                        font=f, fill=(0, 0, 0, 210))
            img.alpha_composite(sombra.filter(
                ImageFilter.GaussianBlur(max(2, tam // 22))))
            d = ImageDraw.Draw(img)
        d.text((x, y), linha, font=f, fill=cor + (255,))
        y += alt_linha
    return img


# ------------------------------------------------------------- aplicacao


def aplica(entrada: str, saida: str, itens: list, progresso=None) -> dict:
    """Queima os textos no video. Devolve o que deu certo e o que nao deu.

    `itens` sao dicionarios com texto, inicio, duracao, posicao, estilo e
    atras_da_pessoa.
    """
    itens = [i for i in (itens or []) if str(i.get("texto", "")).strip()]
    if not itens:
        raise ValueError("nenhum texto para aplicar")

    info = media.sonda(entrada)
    fps = int(round(info.fps)) or 30
    temp = tempfile.mkdtemp(prefix="feirao_texto_")
    avisos = []

    try:
        entradas, filtros = [], []
        atual = "[0:v]"
        proximo = 1

        for k, item in enumerate(itens):
            inicio = max(0.0, float(item.get("inicio", 0.0)))
            dur = max(0.3, float(item.get("duracao", 2.0)))
            fim = min(info.duracao, inicio + dur)
            if inicio >= info.duracao:
                avisos.append(f'texto "{item["texto"]}" comeca depois do fim '
                              f'do video')
                continue
            dur = fim - inicio

            png = os.path.join(temp, f"txt{k}.png")
            desenha(str(item["texto"]), item.get("estilo", "impacto"),
                    item.get("posicao", "centro"),
                    info.largura, info.altura).save(png)
            entradas += ["-i", png]

            # a imagem parada vira fluxo com tempo proprio: sem isso nao ha
            # onde pendurar o fade
            filtros.append(
                f"[{proximo}:v]format=rgba,loop=loop=-1:size=1:start=0,"
                f"setpts=N/{fps}/TB,"
                f"fade=t=in:st=0:d={FADE}:alpha=1,"
                f"fade=t=out:st={max(0.0, dur - FADE):.3f}:d={FADE}:alpha=1,"
                f"setpts=PTS+{inicio:.3f}/TB[tx{k}]")
            filtros.append(
                f"{atual}[tx{k}]overlay=0:0:eof_action=pass:"
                f"enable='between(t,{inicio:.3f},{fim:.3f})'[ct{k}]")
            atual = f"[ct{k}]"
            proximo += 1

            if not item.get("atras_da_pessoa"):
                continue

            if not recorte.disponivel():
                avisos.append(
                    f'"{item["texto"]}" ficou NA FRENTE da pessoa: '
                    + recorte.instrucao_de_instalacao().replace("\n", " "))
                continue
            try:
                pasta = os.path.join(temp, f"pes{k}")
                camada = recorte.camada_pessoa(entrada, inicio, dur, fps,
                                               pasta, progresso=progresso)
            except Exception as erro:
                avisos.append(f'nao consegui recortar a pessoa para '
                              f'"{item["texto"]}": {erro}')
                continue
            if not camada["quadros"]:
                continue
            if camada["duracao"] < dur - 0.05:
                avisos.append(f'"{item["texto"]}" ficou atras da pessoa por '
                              f'{camada["duracao"]:.1f}s (limite do recorte)')
            entradas += ["-framerate", str(fps), "-start_number", "0",
                         "-i", os.path.join(pasta, "%05d.png")]
            fim_p = inicio + camada["duracao"]
            filtros.append(f"[{proximo}:v]format=rgba,"
                           f"setpts=PTS+{inicio:.3f}/TB[pe{k}]")
            filtros.append(
                f"{atual}[pe{k}]overlay=0:0:eof_action=pass:repeatlast=0:"
                f"enable='between(t,{inicio:.3f},{fim_p:.3f})'[cp{k}]")
            atual = f"[cp{k}]"
            proximo += 1

        if atual == "[0:v]":
            raise ValueError("nenhum texto pode ser aplicado")

        filtros.append(f"{atual}format=yuv420p[vo]")
        cmd = ([media.ffmpeg(), "-y", "-hide_banner", "-i", entrada]
               + entradas
               + ["-filter_complex", ";".join(filtros), "-map", "[vo]"])
        if info.tem_audio:
            cmd += ["-map", "0:a", "-c:a", "copy"]
        cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18", saida]

        r = subprocess.run(cmd, capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        if r.returncode != 0:
            raise RuntimeError(r.stderr[-1500:])
    finally:
        shutil.rmtree(temp, ignore_errors=True)

    return {"video": saida, "avisos": avisos}
