"""Localiza a pasta de projetos do CapCut e clona projetos existentes.

A estrategia do app e "clonar e remendar": em vez de inventar um projeto do
zero (o formato do CapCut nao e documentado e muda de versao para versao),
partimos de um projeto MODELO que voce montou a mao no CapCut e trocamos
apenas os pedacos que interessam (midias, tempos, textos).
"""

from __future__ import annotations

import json
import os
import shutil
import time
from dataclasses import dataclass

# nomes de pasta ja vistos das duas versoes do editor
_MARCAS = ["CapCut", "JianyingPro", "CapCut Drafts"]
_SUFIXO = os.path.join("User Data", "Projects", "com.lveditor.draft")

ARQ_CONTEUDO = "draft_content.json"
ARQ_META = "draft_meta_info.json"


def pastas_candidatas() -> list[str]:
    """Lugares onde a pasta de rascunhos do CapCut costuma estar (Windows)."""
    bases = [os.environ.get("LOCALAPPDATA"), os.environ.get("APPDATA"),
             os.path.expanduser("~")]
    saida = []
    for base in filter(None, bases):
        for marca in _MARCAS:
            saida.append(os.path.join(base, marca, _SUFIXO))
    # Mac, caso um dia rode la
    saida.append(os.path.expanduser(
        "~/Movies/CapCut/User Data/Projects/com.lveditor.draft"))
    return saida


def acha_pasta_projetos(dica: str | None = None) -> str | None:
    """Devolve a pasta de rascunhos, ou None se nao achar."""
    if dica and eh_pasta_de_projetos(dica):
        return dica
    for p in pastas_candidatas():
        if eh_pasta_de_projetos(p):
            return p
    return None


def eh_pasta_de_projetos(caminho: str) -> bool:
    if not caminho or not os.path.isdir(caminho):
        return False
    try:
        for nome in os.listdir(caminho):
            sub = os.path.join(caminho, nome)
            if os.path.isfile(os.path.join(sub, ARQ_CONTEUDO)):
                return True
    except OSError:
        return False
    return False


@dataclass
class Projeto:
    nome: str
    pasta: str
    modificado: float

    @property
    def conteudo(self) -> str:
        return os.path.join(self.pasta, ARQ_CONTEUDO)

    def carrega(self) -> dict:
        with open(self.conteudo, encoding="utf-8") as fh:
            return json.load(fh)


def lista_projetos(pasta_projetos: str) -> list[Projeto]:
    """Projetos do CapCut, do mais recente para o mais antigo."""
    achados = []
    for nome in os.listdir(pasta_projetos):
        pasta = os.path.join(pasta_projetos, nome)
        alvo = os.path.join(pasta, ARQ_CONTEUDO)
        if os.path.isfile(alvo):
            achados.append(Projeto(nome, pasta, os.path.getmtime(alvo)))
    return sorted(achados, key=lambda p: p.modificado, reverse=True)


def clona_projeto(modelo: Projeto, novo_nome: str,
                  pasta_projetos: str | None = None) -> Projeto:
    """Copia um projeto inteiro sob um novo nome e devolve o novo projeto.

    Nao mexe no original: o modelo continua servindo para os proximos.
    """
    destino_base = pasta_projetos or os.path.dirname(modelo.pasta)
    destino = os.path.join(destino_base, novo_nome)
    if os.path.exists(destino):
        raise FileExistsError(f"ja existe um projeto chamado {novo_nome}")

    shutil.copytree(modelo.pasta, destino)
    novo = Projeto(novo_nome, destino, time.time())

    # o CapCut usa esses campos para nomear e ordenar na tela inicial
    meta = os.path.join(destino, ARQ_META)
    if os.path.isfile(meta):
        try:
            with open(meta, encoding="utf-8") as fh:
                dados = json.load(fh)
            agora = int(time.time() * 1_000_000)
            for chave, valor in (("draft_name", novo_nome),
                                 ("draft_fold_path", destino),
                                 ("tm_draft_create", agora),
                                 ("tm_draft_modified", agora)):
                if chave in dados:
                    dados[chave] = valor
            grava_json(meta, dados)
        except (OSError, ValueError):
            pass  # metadados sao cosmeticos; o projeto abre sem eles
    return novo


def grava_json(caminho: str, dados: dict) -> None:
    """Grava sem quebrar o arquivo caso falte energia no meio."""
    temp = caminho + ".tmp"
    with open(temp, "w", encoding="utf-8") as fh:
        json.dump(dados, fh, ensure_ascii=False, separators=(",", ":"))
    os.replace(temp, caminho)


def faz_backup(projeto: Projeto) -> str:
    """Copia de seguranca antes de qualquer escrita."""
    carimbo = time.strftime("%Y%m%d-%H%M%S")
    destino = f"{projeto.pasta}.backup-{carimbo}"
    shutil.copytree(projeto.pasta, destino)
    return destino
