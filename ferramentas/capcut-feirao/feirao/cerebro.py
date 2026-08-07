"""Traduz o pedido em portugues num plano de edicao executavel.

Fluxo: entender o video (fala com tempo + quadros) -> mandar para o Claude
junto com o pedido -> receber um plano validado -> o executor aplica.

O modelo nunca toca no video. Ele so escolhe acoes do vocabulario em
acoes.py, e o codigo deterministico faz o resto.
"""

from __future__ import annotations

import base64
import io
import json
import os

from . import acoes, media

MODELO = "claude-opus-5"
MAX_TOKENS = 16000
QUADROS_AMOSTRA = 6          # quantos frames o modelo ve do video


INSTRUCOES = """\
Voce e o editor de video de uma loja que faz feirao de carros. Recebe o pedido \
do dono em portugues coloquial e devolve um plano de edicao.

Voce nao edita nada: escolhe acoes de uma lista fechada, e um programa aplica. \
So existe o que esta no esquema — se o pedido precisar de algo que nao esta la, \
nao invente uma acao parecida; escreva em "avisos" o que ficou de fora e por que.

Como decidir:

- Cada acao precisa de um momento. Use a transcricao com tempo para achar o \
segundo exato. Ancore no que foi falado, nao no seu chute.
- Quando o pedido for generico ("deixa legal", "poe animacao onde fizer \
sentido"), voce e quem escolhe onde. Prefira poucos momentos fortes a muitos \
efeitos fracos: um video de 30s aguenta 2 ou 3 animacoes bem colocadas.
- Case a animacao com a fala. "Rasgando preco" pede rasgar_papel com o texto \
PRECO no segundo em que a palavra e dita. Uma comemoracao pede confete. Uma \
afirmacao definitiva pede carimbo.
- Em "motivo", diga qual pedaco da fala justificou a acao. E o que o dono le \
para conferir seu trabalho.
- Corte silencio e tropeço, nao conteudo. Na duvida, mantenha.
- Texto atras da pessoa e caro de produzir: use so quando o texto for o \
assunto do momento, no maximo uma ou duas vezes no video.

Escreva resumo, motivos e avisos em portugues do Brasil, direto, sem enrolacao.\
"""


def disponivel() -> bool:
    try:
        import anthropic  # noqa: F401
    except ImportError:
        return False
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


def _cliente():
    try:
        import anthropic
    except ImportError as erro:
        raise RuntimeError("Biblioteca nao instalada.\n"
                           "Rode: pip install anthropic") from erro
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise RuntimeError(
            "Falta a chave da API.\n"
            "Pegue em console.anthropic.com e configure assim no Windows:\n"
            '  setx ANTHROPIC_API_KEY "sua-chave-aqui"\n'
            "Depois feche e abra o app de novo.")
    return anthropic.Anthropic()


# ------------------------------------------------- entendimento do video


def amostra_quadros(caminho: str, duracao: float,
                    quantos: int = QUADROS_AMOSTRA) -> list:
    """Extrai quadros espalhados pelo video, em JPEG pequeno (base64)."""
    from PIL import Image

    if duracao <= 0:
        return []
    quadros = []
    for i in range(quantos):
        t = duracao * (i + 0.5) / quantos
        bruto = _quadro_em(caminho, t)
        if not bruto:
            continue
        img = Image.open(io.BytesIO(bruto)).convert("RGB")
        img.thumbnail((768, 768))            # barato e suficiente para o plano
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=78)
        quadros.append((round(t, 1),
                        base64.b64encode(buf.getvalue()).decode("ascii")))
    return quadros


def _quadro_em(caminho: str, t: float) -> bytes:
    import subprocess
    r = subprocess.run([media.ffmpeg(), "-v", "error", "-ss", f"{t:.3f}",
                        "-i", caminho, "-frames:v", "1", "-f", "image2",
                        "-c:v", "mjpeg", "-"],
                       capture_output=True)
    return r.stdout if r.returncode == 0 else b""


def _bloco_transcricao(falas: list) -> str:
    if not falas:
        return "(sem transcricao — o video pode nao ter fala)"
    return "\n".join(f"[{f.inicio:6.2f}s - {f.fim:6.2f}s] {f.texto}"
                     for f in falas)


# ------------------------------------------------------------ planejamento


def monta_plano(pedido: str, info: media.InfoMidia, falas: list,
                quadros: list | None = None, progresso=None) -> acoes.Plano:
    """Manda pedido + video para o Claude e devolve o plano ja validado."""
    cliente = _cliente()

    conteudo = [{
        "type": "text",
        "text": (f"VIDEO: {info.duracao:.1f}s, {info.largura}x{info.altura}, "
                 f"{info.fps:.0f}fps\n\n"
                 f"FALA COM TEMPO:\n{_bloco_transcricao(falas)}\n\n"
                 f"PEDIDO DO DONO:\n{pedido.strip()}")}]

    for t, b64 in (quadros or []):
        conteudo.append({"type": "text", "text": f"Quadro em {t}s:"})
        conteudo.append({"type": "image",
                         "source": {"type": "base64",
                                    "media_type": "image/jpeg", "data": b64}})

    if progresso:
        progresso("pensando no plano de edicao...")

    # streaming: o planejamento pensa por um bom tempo e um POST comum
    # estoura o timeout do SDK antes de responder
    with cliente.messages.stream(
        model=MODELO,
        max_tokens=MAX_TOKENS,
        system=INSTRUCOES,
        thinking={"type": "adaptive"},
        output_config={"effort": "high",
                       "format": {"type": "json_schema",
                                  "schema": acoes.esquema_json()}},
        messages=[{"role": "user", "content": conteudo}],
    ) as fluxo:
        resposta = fluxo.get_final_message()

    if resposta.stop_reason == "refusal":
        raise RuntimeError("O modelo recusou esse pedido. Reformule e tente "
                           "de novo.")

    texto = "".join(b.text for b in resposta.content if b.type == "text")
    if not texto.strip():
        raise RuntimeError("O modelo respondeu vazio. Tente de novo.")

    try:
        bruto = json.loads(texto)
    except json.JSONDecodeError as erro:
        raise RuntimeError(f"Resposta do modelo veio quebrada: {erro}") from erro

    return acoes.valida_plano(bruto, info.duracao)


def entende_e_planeja(caminho: str, pedido: str, falas: list,
                      olhar: bool = True, progresso=None) -> acoes.Plano:
    """Caminho completo: sonda o video, olha alguns quadros, planeja."""
    info = media.sonda(caminho)
    quadros = []
    if olhar:
        if progresso:
            progresso("olhando o video...")
        quadros = amostra_quadros(caminho, info.duracao)
        if progresso:
            progresso(f"  {len(quadros)} quadro(s) analisado(s)")
    return monta_plano(pedido, info, falas, quadros, progresso=progresso)
