"""O contrato entre o pedido em portugues e o que o app sabe executar.

A ideia central: o Claude decide O QUE fazer e ONDE; o codigo deterministico
decide COMO. O modelo nunca escreve o efeito — ele escolhe de uma lista fechada
(os enums abaixo). Se nao esta nesta lista, o modelo nao consegue pedir, e o
executor nunca recebe uma acao que nao sabe aplicar.

Para ensinar uma capacidade nova ao app: acrescente o item ao enum, escreva o
executor, e o Claude passa a poder usa-la. Nao ha nada solto entre os dois.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from . import animacoes

# ------------------------------------------------------ vocabulario fechado

# O vocabulario de animacoes vem do registro real em animacoes.py: se nao esta
# implementado, o Claude nao consegue pedir. Contrato e implementacao nao
# podem divergir.
ANIMACOES = animacoes.DISPONIVEIS

CORES = {
    "quente_vibrante": "Satura e esquenta. Padrao para feirao — chama atencao "
                       "no feed.",
    "cinematico_frio": "Contraste alto e sombras azuladas. Para um tom mais "
                       "sofisticado.",
    "natural_limpo": "Corrige exposicao e balanco de branco sem estilizar. "
                     "Use quando o video ja esta bom e so precisa de acerto.",
    "punch_alto_contraste": "Contraste e nitidez no talo. Para cortes rapidos "
                            "e conteudo viral.",
}

POSICOES = ["topo", "centro", "rodape", "esquerda", "direita"]

ESTILOS_TEXTO = {
    "impacto": "Bold condensado, branco com contorno preto. Legivel em "
               "qualquer fundo.",
    "oferta": "Dourado com sombra. Para preco e condicao.",
    "sutil": "Fino e discreto. Para credito, endereco, telefone.",
}

TIPOS = ["cortar", "legendas_fonte", "animacao", "cor", "texto"]


# --------------------------------------------------------------- validacao


class PlanoInvalido(ValueError):
    """O plano que voltou do modelo nao pode ser executado como veio."""


@dataclass
class Acao:
    tipo: str
    dados: dict
    motivo: str = ""

    def __repr__(self) -> str:      # aparece no log do app
        quando = ""
        if "inicio" in self.dados:
            quando = f" @{self.dados['inicio']:.1f}s"
        return f"<{self.tipo}{quando}>"


@dataclass
class Plano:
    resumo: str = ""
    acoes: list = field(default_factory=list)
    avisos: list = field(default_factory=list)

    def por_tipo(self, tipo: str) -> list:
        return [a for a in self.acoes if a.tipo == tipo]


def _num(dados: dict, chave: str, obrigatorio: bool = True,
         minimo: float = 0.0) -> float:
    if chave not in dados:
        if obrigatorio:
            raise PlanoInvalido(f"falta '{chave}'")
        return 0.0
    try:
        valor = float(dados[chave])
    except (TypeError, ValueError):
        raise PlanoInvalido(f"'{chave}' nao e um numero: {dados[chave]!r}")
    if valor < minimo:
        raise PlanoInvalido(f"'{chave}' fora da faixa: {valor}")
    return valor


def valida_acao(bruta: dict, duracao: float) -> Acao:
    """Confere uma acao contra o vocabulario e contra a duracao do video."""
    if not isinstance(bruta, dict):
        raise PlanoInvalido(f"acao nao e um objeto: {bruta!r}")

    tipo = bruta.get("tipo")
    if tipo not in TIPOS:
        raise PlanoInvalido(f"tipo desconhecido: {tipo!r}")

    dados = {k: v for k, v in bruta.items() if k not in ("tipo", "motivo")}

    if tipo == "cortar":
        ini, fim = _num(dados, "inicio"), _num(dados, "fim")
        if fim <= ini:
            raise PlanoInvalido(f"corte invertido: {ini} -> {fim}")
        if ini >= duracao:
            raise PlanoInvalido(f"corte comeca depois do fim do video: {ini}")
        dados["fim"] = min(fim, duracao)

    elif tipo == "legendas_fonte":
        if not dados.get("fonte"):
            raise PlanoInvalido("falta 'fonte'")

    elif tipo == "animacao":
        nome = dados.get("nome")
        if nome not in ANIMACOES:
            raise PlanoInvalido(f"animacao desconhecida: {nome!r}")
        ini = _num(dados, "inicio")
        if ini >= duracao:
            raise PlanoInvalido(f"animacao depois do fim do video: {ini}")
        dados["duracao"] = _num(dados, "duracao", obrigatorio=False) or 1.5
        if nome in ("rasgar_papel", "carimbo") and not dados.get("texto"):
            raise PlanoInvalido(f"'{nome}' precisa de 'texto'")

    elif tipo == "cor":
        if dados.get("preset") not in CORES:
            raise PlanoInvalido(f"preset de cor desconhecido: "
                                f"{dados.get('preset')!r}")

    elif tipo == "texto":
        if not dados.get("texto"):
            raise PlanoInvalido("falta 'texto'")
        if dados.get("posicao", "centro") not in POSICOES:
            raise PlanoInvalido(f"posicao desconhecida: {dados.get('posicao')!r}")
        if dados.get("estilo", "impacto") not in ESTILOS_TEXTO:
            raise PlanoInvalido(f"estilo desconhecido: {dados.get('estilo')!r}")
        ini = _num(dados, "inicio")
        if ini >= duracao:
            raise PlanoInvalido(f"texto depois do fim do video: {ini}")
        dados["duracao"] = _num(dados, "duracao", obrigatorio=False) or 2.0

    return Acao(tipo=tipo, dados=dados, motivo=str(bruta.get("motivo", "")))


def valida_plano(bruto: dict, duracao: float) -> Plano:
    """Valida o plano inteiro, descartando so as acoes ruins.

    Uma acao invalida vira aviso em vez de derrubar o plano — melhor aplicar
    oito de dez do que perder tudo por causa de um numero fora de faixa.
    """
    if not isinstance(bruto, dict):
        raise PlanoInvalido("o plano nao veio como objeto")

    plano = Plano(resumo=str(bruto.get("resumo", "")),
                  avisos=[str(a) for a in bruto.get("avisos", []) or []])

    for i, bruta in enumerate(bruto.get("acoes", []) or [], start=1):
        try:
            plano.acoes.append(valida_acao(bruta, duracao))
        except PlanoInvalido as erro:
            plano.avisos.append(f"acao {i} descartada ({erro})")

    # cortes sobrepostos viram um corte so, senao o tempo removido sai errado
    cortes = sorted(plano.por_tipo("cortar"),
                    key=lambda a: a.dados["inicio"])
    if len(cortes) > 1:
        juntos, atual = [], cortes[0]
        for prox in cortes[1:]:
            if prox.dados["inicio"] <= atual.dados["fim"]:
                atual.dados["fim"] = max(atual.dados["fim"], prox.dados["fim"])
            else:
                juntos.append(atual)
                atual = prox
        juntos.append(atual)
        if len(juntos) < len(cortes):
            plano.avisos.append(
                f"{len(cortes) - len(juntos)} corte(s) sobreposto(s) unido(s)")
        plano.acoes = [a for a in plano.acoes if a.tipo != "cortar"] + juntos

    return plano


# ------------------------------------------------- esquema para o modelo


def esquema_json() -> dict:
    """JSON Schema do plano, entregue ao Claude via structured outputs.

    Os enums sao a parte que importa: o modelo so consegue escolher efeitos
    que o executor sabe aplicar. Nao ha como pedir algo inexistente.
    """
    def obj(props: dict, obrigatorios: list) -> dict:
        return {"type": "object", "additionalProperties": False,
                "properties": props, "required": obrigatorios}

    motivo = {"type": "string",
              "description": "Por que esta acao, em uma frase curta, em "
                             "portugues. Aparece para o usuario."}

    return obj({
        "resumo": {"type": "string",
                   "description": "O que voce entendeu do pedido e o que vai "
                                  "fazer, em 1-2 frases, em portugues."},
        "avisos": {"type": "array", "items": {"type": "string"},
                   "description": "O que foi pedido mas voce NAO conseguiu "
                                  "fazer, e por que. Seja franco."},
        "acoes": {
            "type": "array",
            "description": "As edicoes, em ordem de tempo.",
            "items": {"anyOf": [
                obj({"tipo": {"const": "cortar"},
                     "inicio": {"type": "number"},
                     "fim": {"type": "number"},
                     "motivo": motivo},
                    ["tipo", "inicio", "fim", "motivo"]),

                obj({"tipo": {"const": "legendas_fonte"},
                     "fonte": {"type": "string"},
                     "tamanho": {"type": "integer"},
                     "cor": {"type": "string",
                             "description": "Hex, ex: #FFD700"},
                     "motivo": motivo},
                    ["tipo", "fonte", "motivo"]),

                obj({"tipo": {"const": "animacao"},
                     "nome": {"type": "string", "enum": sorted(ANIMACOES)},
                     "inicio": {"type": "number"},
                     "duracao": {"type": "number"},
                     "texto": {"type": "string",
                               "description": "A palavra que aparece na "
                                              "animacao. Curta — uma palavra."},
                     "motivo": motivo},
                    ["tipo", "nome", "inicio", "duracao", "motivo"]),

                obj({"tipo": {"const": "cor"},
                     "preset": {"type": "string", "enum": sorted(CORES)},
                     "intensidade": {"type": "number",
                                     "description": "0.0 a 1.0"},
                     "motivo": motivo},
                    ["tipo", "preset", "motivo"]),

                obj({"tipo": {"const": "texto"},
                     "texto": {"type": "string"},
                     "inicio": {"type": "number"},
                     "duracao": {"type": "number"},
                     "posicao": {"type": "string", "enum": POSICOES},
                     "estilo": {"type": "string", "enum": sorted(ESTILOS_TEXTO)},
                     "atras_da_pessoa": {"type": "boolean"},
                     "motivo": motivo},
                    ["tipo", "texto", "inicio", "duracao", "posicao",
                     "estilo", "motivo"]),
            ]},
        },
    }, ["resumo", "acoes"])
