"""Template do feirao: a estrutura fixa que todo video segue.

O plano de edicao (a lista de blocos com tempos e textos) e neutro de
proposito: hoje ele vira SRT e MP4 pelo ffmpeg, e vai virar projeto do
CapCut assim que o formato da sua versao estiver mapeado.
"""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field, asdict

ARQUIVO_PADRAO = "template_feirao.json"


@dataclass
class Bloco:
    """Um pedaco da timeline."""
    nome: str
    tipo: str                    # "midia" | "titulo" | "oferta" | "encerramento"
    duracao: float = 0.0         # 0 = usa a duracao natural da midia
    arquivo: str = ""
    textos: dict = field(default_factory=dict)


@dataclass
class PlanoDeEdicao:
    nome: str
    largura: int = 1080
    altura: int = 1920           # vertical, padrao de Reels/TikTok
    fps: int = 30
    blocos: list = field(default_factory=list)

    def duracao_total(self) -> float:
        return round(sum(b.duracao for b in self.blocos), 3)

    def para_dict(self) -> dict:
        d = asdict(self)
        d["duracao_total"] = self.duracao_total()
        return d

    def salva(self, destino: str) -> str:
        with open(destino, "w", encoding="utf-8") as fh:
            json.dump(self.para_dict(), fh, ensure_ascii=False, indent=2)
        return destino


def template_padrao() -> dict:
    """Modelo inicial, feito para ser editado no bloco de notas."""
    return {
        "nome": "Feirao",
        "largura": 1080,
        "altura": 1920,
        "fps": 30,
        "abertura": {"duracao": 2.5,
                     "titulo": "FEIRÃO",
                     "subtitulo": "OFERTAS DA SEMANA"},
        "oferta": {"duracao": 4.0,
                   "modelo_de_texto": "{carro}\n{preco}\n{condicao}"},
        "encerramento": {"duracao": 3.0,
                         "titulo": "CORRE QUE ACABA!",
                         "subtitulo": "{loja} · {telefone}"},
    }


def carrega(caminho: str | None = None) -> dict:
    """Le o template do disco; cria com os valores padrao se nao existir."""
    caminho = caminho or ARQUIVO_PADRAO
    if not os.path.isfile(caminho):
        padrao = template_padrao()
        with open(caminho, "w", encoding="utf-8") as fh:
            json.dump(padrao, fh, ensure_ascii=False, indent=2)
        return padrao
    with open(caminho, encoding="utf-8") as fh:
        return json.load(fh)


def _preenche(modelo: str, dados: dict) -> str:
    """Troca {campo} pelos dados; some com o que ficou sem valor.

    Sem isso um campo nao preenchido aparecia literalmente na tela como
    "{loja}" — pior do que nao aparecer nada.
    """
    saida = modelo
    for chave, valor in (dados or {}).items():
        saida = saida.replace("{" + str(chave) + "}", str(valor))
    saida = re.sub(r"\{[^{}]*\}", "", saida)
    # limpa separadores que ficaram orfaos (" · ", " - ") nas pontas
    saida = re.sub(r"\s*[·|\-–]\s*(?=$|[·|\-–])", "", saida)
    return re.sub(r"\s{2,}", " ", saida).strip(" ·|-–\n")


def monta_plano(template: dict, midias: list[str],
                ofertas: list[dict] | None = None,
                nome: str = "Feirao",
                dados: dict | None = None) -> PlanoDeEdicao:
    """Encaixa as midias e as ofertas na estrutura do template.

    `dados` preenche os campos entre chaves do template (loja, telefone...).
    """
    plano = PlanoDeEdicao(nome=nome,
                          largura=int(template.get("largura", 1080)),
                          altura=int(template.get("altura", 1920)),
                          fps=int(template.get("fps", 30)))

    abertura = template.get("abertura") or {}
    if abertura:
        plano.blocos.append(Bloco(
            nome="abertura", tipo="titulo",
            duracao=float(abertura.get("duracao", 2.5)),
            textos={"titulo": _preenche(abertura.get("titulo", ""), dados),
                    "subtitulo": _preenche(abertura.get("subtitulo", ""),
                                           dados)}))

    conf_oferta = template.get("oferta") or {}
    modelo = conf_oferta.get("modelo_de_texto", "{carro}\n{preco}")
    dur_oferta = float(conf_oferta.get("duracao", 4.0))

    for i, midia in enumerate(midias):
        textos = {}
        if ofertas and i < len(ofertas):
            try:
                textos["legenda"] = modelo.format(**ofertas[i])
            except KeyError as erro:
                textos["legenda"] = (f"[falta o campo {erro} na oferta "
                                     f"{i + 1}]")
        plano.blocos.append(Bloco(nome=f"oferta_{i + 1}", tipo="oferta",
                                  duracao=dur_oferta, arquivo=midia,
                                  textos=textos))

    fim = template.get("encerramento") or {}
    if fim:
        plano.blocos.append(Bloco(
            nome="encerramento", tipo="encerramento",
            duracao=float(fim.get("duracao", 3.0)),
            textos={"titulo": _preenche(fim.get("titulo", ""), dados),
                    "subtitulo": _preenche(fim.get("subtitulo", ""), dados)}))
    return plano
