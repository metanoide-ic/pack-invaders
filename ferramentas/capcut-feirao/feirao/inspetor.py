"""Radiografa um projeto do CapCut para descobrir o formato dessa versao.

Gera um relatorio com a ESTRUTURA do projeto (nomes de campos, tipos,
quantidades e amostras curtas) em vez do conteudo inteiro: o arquivo fica
pequeno, legivel e sem os seus caminhos pessoais.
"""

from __future__ import annotations

import getpass
import json
import os
import re

from . import capcut

LIMITE_TEXTO = 90
MAX_ITENS_AMOSTRA = 2


def _limpa(texto: str) -> str:
    """Tira nome de usuario e caminhos de disco do texto."""
    try:
        usuario = getpass.getuser()
        if usuario:
            texto = re.sub(re.escape(usuario), "USUARIO", texto,
                           flags=re.IGNORECASE)
    except Exception:
        pass
    texto = re.sub(r"[A-Za-z]:[\\/][^\"']*", "<CAMINHO>", texto)
    return texto


def resume(valor, profundidade: int = 0):
    """Reduz o JSON a um esqueleto: tipos, tamanhos e amostras curtas."""
    if profundidade > 6:
        return "..."

    if isinstance(valor, dict):
        return {chave: resume(sub, profundidade + 1)
                for chave, sub in valor.items()}

    if isinstance(valor, list):
        if not valor:
            return []
        amostra = [resume(v, profundidade + 1)
                   for v in valor[:MAX_ITENS_AMOSTRA]]
        if len(valor) > MAX_ITENS_AMOSTRA:
            amostra.append(f"...mais {len(valor) - MAX_ITENS_AMOSTRA} item(ns)")
        return amostra

    if isinstance(valor, str):
        limpo = _limpa(valor)
        if len(limpo) > LIMITE_TEXTO:
            return limpo[:LIMITE_TEXTO] + f"...(+{len(limpo)-LIMITE_TEXTO})"
        return limpo

    return valor


def mapa_de_trilhas(dados: dict) -> list[dict]:
    """Extrai um resumo das trilhas da timeline, se elas existirem."""
    trilhas = dados.get("tracks")
    if not isinstance(trilhas, list):
        return []
    resumo = []
    for t in trilhas:
        if not isinstance(t, dict):
            continue
        segmentos = t.get("segments")
        resumo.append({
            "tipo": t.get("type"),
            "segmentos": len(segmentos) if isinstance(segmentos, list) else 0,
            "campos_do_segmento": sorted(segmentos[0].keys())
            if isinstance(segmentos, list) and segmentos
            and isinstance(segmentos[0], dict) else [],
        })
    return resumo


def inspeciona(projeto: capcut.Projeto) -> dict:
    """Relatorio estrutural de um projeto."""
    dados = projeto.carrega()

    materiais = dados.get("materials")
    resumo_materiais = {}
    if isinstance(materiais, dict):
        for chave, valor in materiais.items():
            if isinstance(valor, list):
                resumo_materiais[chave] = {
                    "quantidade": len(valor),
                    "campos": sorted(valor[0].keys())
                    if valor and isinstance(valor[0], dict) else [],
                }

    return {
        "versao_do_relatorio": 1,
        "projeto": projeto.nome,
        "chaves_do_topo": sorted(dados.keys()),
        "duracao": dados.get("duration"),
        "canvas": resume(dados.get("canvas_config")),
        "fps": dados.get("fps"),
        "versao_do_app": dados.get("version") or dados.get("app_version"),
        "trilhas": mapa_de_trilhas(dados),
        "materiais": resumo_materiais,
        "esqueleto": resume(dados),
    }


def salva_relatorio(projeto: capcut.Projeto, destino: str) -> str:
    relatorio = inspeciona(projeto)
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump(relatorio, fh, ensure_ascii=False, indent=2)
    return destino


def texto_resumido(relatorio: dict) -> str:
    """Versao curta e legivel, para mostrar na tela do app."""
    linhas = [f"Projeto: {relatorio['projeto']}",
              f"Duracao: {relatorio.get('duracao')}",
              f"Campos no topo: {', '.join(relatorio['chaves_do_topo'][:12])}",
              ""]
    if relatorio["trilhas"]:
        linhas.append("Trilhas encontradas:")
        for t in relatorio["trilhas"]:
            linhas.append(f"  - {t['tipo']}: {t['segmentos']} segmento(s)")
    else:
        linhas.append("Nenhuma trilha reconhecida (formato diferente do "
                      "esperado).")
    linhas.append("")
    if relatorio["materiais"]:
        linhas.append("Materiais:")
        for nome, info in sorted(relatorio["materiais"].items()):
            if info["quantidade"]:
                linhas.append(f"  - {nome}: {info['quantidade']}")
    return "\n".join(linhas)
