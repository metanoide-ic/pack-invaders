"""Voce joga uma pasta de fotos; o Claude escolhe quais entram e em que ordem.

Nem toda foto presta: tem a tremida, a que ficou escura, a duplicada, a do
chao. O modelo olha cada uma e devolve as aprovadas com uma ordem que faz
sentido, mais o motivo de cada recusa — para voce discordar quando quiser.

Antes de gastar API, um filtro barato roda local (escuro demais, borrada,
minuscula). Foto obviamente ruim nao precisa de modelo para ser recusada.
"""

from __future__ import annotations

import base64
import io
import json
import os

from PIL import Image, ImageFilter, ImageStat

EXTENSOES = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".heic")
MAX_FOTOS = 40            # teto de seguranca: 40 imagens ja e um lote grande
LADO_ANALISE = 512        # o suficiente para julgar; nao precisa mandar 4K


def lista_pasta(pasta: str) -> list:
    """Todas as imagens da pasta, em ordem alfabetica."""
    if not os.path.isdir(pasta):
        raise NotADirectoryError(pasta)
    achadas = [os.path.join(pasta, n) for n in sorted(os.listdir(pasta))
               if n.lower().endswith(EXTENSOES)]
    return achadas


# ------------------------------------------------------- triagem local


def mede(caminho: str) -> dict:
    """Numeros basicos de qualidade, sem custo de API."""
    with Image.open(caminho) as img:
        img = img.convert("RGB")
        larg, alt = img.size
        pequena = img.copy()
        pequena.thumbnail((360, 360))
        cinza = pequena.convert("L")
        brilho = ImageStat.Stat(cinza).mean[0]
        contraste = ImageStat.Stat(cinza).stddev[0]
        # variancia da laplaciana: quanto menor, mais borrada
        bordas = cinza.filter(ImageFilter.FIND_EDGES)
        nitidez = ImageStat.Stat(bordas).stddev[0]
    return {"arquivo": caminho, "largura": larg, "altura": alt,
            "brilho": round(brilho, 1), "contraste": round(contraste, 1),
            "nitidez": round(nitidez, 1)}


# A triagem local NAO recusa por desfoque, de proposito. A medida que temos
# (variancia das bordas) confunde "borrada" com "pouco detalhe": uma foto
# nitida de um carro contra ceu limpo marca ~14, e uma borrada marca ~12 — nao
# existe limite que separe os dois sem jogar fora foto boa. Entao a nitidez
# vai como INFORMACAO junto da imagem, e quem decide e o Claude, que ve a foto.
NITIDEZ_SUSPEITA = 15.0


def triagem(caminhos: list, largura_minima: int = 640) -> tuple:
    """Separa o que da para recusar sem modelo, so pelo que e inequivoco.

    Resolucao, escuridao e estouro de luz sao objetivos. Desfoque nao — veja
    a nota acima.
    """
    passou, recusadas = [], []
    for c in caminhos:
        try:
            m = mede(c)
        except Exception as erro:
            recusadas.append({"arquivo": c, "motivo": f"nao consegui abrir "
                                                      f"({erro})"})
            continue
        if min(m["largura"], m["altura"]) < largura_minima:
            recusadas.append({"arquivo": c, "motivo": (
                f"resolucao baixa ({m['largura']}x{m['altura']}) — "
                f"ficaria borrada em tela cheia")})
        elif m["brilho"] < 26:
            recusadas.append({"arquivo": c,
                              "motivo": f"escura demais (brilho {m['brilho']})"})
        elif m["brilho"] > 233:
            recusadas.append({"arquivo": c,
                              "motivo": f"estourada de luz ({m['brilho']})"})
        else:
            passou.append(m)
    return passou, recusadas


# --------------------------------------------------------- curadoria IA


def _miniatura(caminho: str) -> str:
    with Image.open(caminho) as img:
        img = img.convert("RGB")
        img.thumbnail((LADO_ANALISE, LADO_ANALISE))
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=72)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def esquema() -> dict:
    return {
        "type": "object", "additionalProperties": False,
        "required": ["escolhidas", "recusadas", "resumo"],
        "properties": {
            "resumo": {"type": "string",
                       "description": "Em uma frase: o que voce escolheu e "
                                      "por que essa ordem."},
            "escolhidas": {
                "type": "array",
                "description": "Na ordem em que devem aparecer no video.",
                "items": {
                    "type": "object", "additionalProperties": False,
                    "required": ["indice", "motivo", "destaque"],
                    "properties": {
                        "indice": {"type": "integer",
                                   "description": "O numero da foto na lista."},
                        "motivo": {"type": "string"},
                        "destaque": {"type": "boolean",
                                     "description": "true se for a melhor "
                                                    "foto, para abrir o video."},
                    }}},
            "recusadas": {
                "type": "array",
                "items": {
                    "type": "object", "additionalProperties": False,
                    "required": ["indice", "motivo"],
                    "properties": {
                        "indice": {"type": "integer"},
                        "motivo": {"type": "string",
                                   "description": "Por que nao entra. Seja "
                                                  "concreto: 'so aparece a "
                                                  "roda', 'repetida da 3'."},
                    }}},
        }}


INSTRUCOES = """\
Voce e o editor escolhendo as fotos que vao para um video de feirao de carros.

Recebe fotos numeradas e escolhe quais entram e em que ordem. Nao precisa usar \
todas — e melhor um video curto so com foto boa do que um longo com enchimento.

Recuse sem dó: foto borrada ou tremida, repetida (fique com a melhor das \
parecidas), enquadramento que nao mostra o carro, foto do chao ou do teto, \
tirada contra a luz, com gente ou papelada na frente do produto, e qualquer \
uma que nao ajude a vender.

Algumas fotos vem com um aviso de que a medida de bordas ficou baixa. Isso \
NAO quer dizer que esta borrada — uma foto nitida de carro contra ceu limpo \
tambem marca baixo. Use como alerta para olhar com atencao, nao como veredito.

Ordem importa: comece pela foto mais forte, porque os primeiros segundos \
decidem se a pessoa continua. Depois alterne angulos para nao ficar repetitivo \
— externa, interna, detalhe. Marque `destaque` na melhor de todas.

Em cada motivo, aponte o que voce viu na imagem, nao uma frase generica. \
Escreva em portugues do Brasil, direto.\
"""


def escolhe(caminhos: list, pedido: str = "", quantas_no_maximo: int = 0,
            progresso=None) -> dict:
    """Manda as fotos para o Claude e devolve a selecao.

    Nao chama a API se a triagem local ja tiver reprovado tudo.
    """
    from . import cerebro

    aprovadas, recusadas_local = triagem(caminhos)
    if not aprovadas:
        return {"resumo": "nenhuma foto passou na triagem basica",
                "escolhidas": [], "recusadas": recusadas_local}

    if len(aprovadas) > MAX_FOTOS:
        sobra = aprovadas[MAX_FOTOS:]
        aprovadas = aprovadas[:MAX_FOTOS]
        recusadas_local += [{"arquivo": m["arquivo"],
                             "motivo": f"passou do limite de {MAX_FOTOS} fotos "
                                       f"por lote"} for m in sobra]

    cliente = cerebro._cliente()
    if progresso:
        progresso(f"olhando {len(aprovadas)} foto(s)...")

    conteudo = [{"type": "text", "text":
                 (f"PEDIDO: {pedido.strip() or 'monte o melhor video possivel'}"
                  + (f"\n\nUse no maximo {quantas_no_maximo} fotos."
                     if quantas_no_maximo else "")
                  + f"\n\n{len(aprovadas)} fotos para avaliar:")}]
    for i, m in enumerate(aprovadas):
        dica = ""
        if m["nitidez"] < NITIDEZ_SUSPEITA:
            dica = (" — a medida de bordas ficou baixa; pode estar borrada, "
                    "ou so ter pouco detalhe. Confirme olhando.")
        conteudo.append({"type": "text",
                         "text": f"Foto {i}: {os.path.basename(m['arquivo'])} "
                                 f"({m['largura']}x{m['altura']}){dica}"})
        conteudo.append({"type": "image",
                         "source": {"type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": _miniatura(m["arquivo"])}})

    with cliente.messages.stream(
        model=cerebro.MODELO,
        max_tokens=cerebro.MAX_TOKENS,
        system=INSTRUCOES,
        thinking={"type": "adaptive"},
        output_config={"effort": "high",
                       "format": {"type": "json_schema", "schema": esquema()}},
        messages=[{"role": "user", "content": conteudo}],
    ) as fluxo:
        resposta = fluxo.get_final_message()

    if resposta.stop_reason == "refusal":
        raise RuntimeError("O modelo recusou avaliar essas fotos.")
    texto = "".join(b.text for b in resposta.content if b.type == "text")
    try:
        bruto = json.loads(texto)
    except json.JSONDecodeError as erro:
        raise RuntimeError(f"resposta veio quebrada: {erro}") from erro

    return _resolve(bruto, aprovadas, recusadas_local)


def _resolve(bruto: dict, aprovadas: list, recusadas_local: list) -> dict:
    """Troca os indices por caminhos e descarta o que veio fora da faixa."""
    escolhidas, vistos = [], set()
    for e in bruto.get("escolhidas", []) or []:
        i = e.get("indice")
        if not isinstance(i, int) or not (0 <= i < len(aprovadas)):
            continue                      # indice inventado: ignora
        if i in vistos:
            continue                      # repetiu a mesma foto: fica uma
        vistos.add(i)
        escolhidas.append({"arquivo": aprovadas[i]["arquivo"],
                           "motivo": str(e.get("motivo", "")),
                           "destaque": bool(e.get("destaque"))})

    recusadas = list(recusadas_local)
    for r in bruto.get("recusadas", []) or []:
        i = r.get("indice")
        if isinstance(i, int) and 0 <= i < len(aprovadas) and i not in vistos:
            recusadas.append({"arquivo": aprovadas[i]["arquivo"],
                              "motivo": str(r.get("motivo", ""))})

    # o que o modelo simplesmente esqueceu tambem e uma recusa, so que muda
    justificadas = {r["arquivo"] for r in recusadas}
    for i, m in enumerate(aprovadas):
        if i not in vistos and m["arquivo"] not in justificadas:
            recusadas.append({"arquivo": m["arquivo"],
                              "motivo": "nao foi escolhida (sem motivo dado)"})

    return {"resumo": str(bruto.get("resumo", "")),
            "escolhidas": escolhidas, "recusadas": recusadas}
