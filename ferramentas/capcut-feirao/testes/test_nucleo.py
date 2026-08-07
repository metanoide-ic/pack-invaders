"""Testes do nucleo (nao precisam do CapCut nem do Windows).

Rode com:  python -m pytest testes/ -v
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from feirao import capcut, inspetor, legendas, media, template  # noqa: E402


# ------------------------------------------------------- trechos uteis

def test_sem_silencio_mantem_tudo():
    assert media.trechos_uteis(10.0, []) == [(0.0, 10.0)]


def test_silencio_no_meio_vira_dois_trechos():
    r = media.trechos_uteis(10.0, [(4.0, 6.0)], margem=0.0)
    assert r == [(0.0, 4.0), (6.0, 10.0)]


def test_margem_devolve_respiro_nas_pontas():
    r = media.trechos_uteis(10.0, [(4.0, 6.0)], margem=0.2)
    assert r[0][1] == 4.2 and r[1][0] == 5.8


def test_silencio_no_fim_e_descartado():
    r = media.trechos_uteis(10.0, [(8.0, 10.0)], margem=0.0)
    assert r == [(0.0, 8.0)]


def test_trecho_curto_demais_some():
    r = media.trechos_uteis(10.0, [(0.1, 5.0)], margem=0.0, minimo_trecho=0.5)
    assert r == [(5.0, 10.0)]


def test_silencios_colados_viram_um_trecho_so():
    # com margem generosa os dois buracos fecham e sobra a fita inteira
    r = media.trechos_uteis(10.0, [(4.0, 4.3), (4.5, 4.8)], margem=0.5)
    assert len(r) == 1


# ------------------------------------------------------------ legendas

def test_carimbo_srt():
    assert legendas._carimbo(0) == "00:00:00,000"
    assert legendas._carimbo(3661.5) == "01:01:01,500"


def test_carimbo_nao_estoura_no_arredondamento():
    assert legendas._carimbo(1.9999) == "00:00:02,000"


def test_quebra_em_duas_linhas():
    txt = legendas.quebra_linhas("palavra " * 12, largura=20)
    assert len(txt.split("\n")) <= 2


def test_quebra_nao_corta_palavra():
    txt = legendas.quebra_linhas("interessantissimo texto", largura=10)
    assert "interessantissimo" in txt


def test_srt_bem_formado():
    falas = [legendas.Fala(0.0, 1.5, "Boa tarde"),
             legendas.Fala(2.0, 3.0, "Chegou o feirao")]
    srt = legendas.para_srt(falas)
    assert srt.startswith("1\n00:00:00,000 --> 00:00:01,500\nBoa tarde")
    assert "2\n00:00:02,000 --> 00:00:03,000\nChegou o feirao" in srt


def test_legenda_instantanea_ganha_duracao_minima():
    srt = legendas.para_srt([legendas.Fala(1.0, 1.0, "oi")])
    assert "00:00:01,000 --> 00:00:01,200" in srt


def test_deslocamento_apos_corte():
    # cortamos 2s..4s; a fala de 5s..6s deve andar para 3s..4s
    falas = [legendas.Fala(5.0, 6.0, "depois do corte")]
    r = legendas.desloca(falas, [(0.0, 2.0), (4.0, 8.0)])
    assert len(r) == 1 and r[0].inicio == 3.0 and r[0].fim == 4.0


def test_fala_dentro_do_corte_some():
    falas = [legendas.Fala(2.5, 3.5, "sumiu")]
    r = legendas.desloca(falas, [(0.0, 2.0), (4.0, 8.0)])
    assert r == []


# ------------------------------------------------------------ template

def test_plano_encaixa_ofertas(tmp_path):
    conf = template.template_padrao()
    plano = template.monta_plano(
        conf, ["a.mp4", "b.mp4"],
        ofertas=[{"carro": "Onix", "preco": "R$ 59.990", "condicao": "0km"},
                 {"carro": "HB20", "preco": "R$ 62.990", "condicao": "2023"}])
    assert [b.tipo for b in plano.blocos] == \
        ["titulo", "oferta", "oferta", "encerramento"]
    assert "Onix" in plano.blocos[1].textos["legenda"]
    assert plano.duracao_total() == 2.5 + 4.0 + 4.0 + 3.0


def test_campo_faltando_na_oferta_nao_derruba():
    conf = template.template_padrao()
    plano = template.monta_plano(conf, ["a.mp4"], ofertas=[{"carro": "Onix"}])
    assert "falta o campo" in plano.blocos[1].textos["legenda"]


def test_template_e_criado_se_nao_existir(tmp_path):
    alvo = tmp_path / "t.json"
    conf = template.carrega(str(alvo))
    assert alvo.exists() and conf["abertura"]["titulo"] == "FEIRÃO"


# ------------------------------------------------------------- capcut

def _projeto_falso(raiz, nome="Projeto 1"):
    pasta = raiz / nome
    pasta.mkdir(parents=True)
    (pasta / capcut.ARQ_CONTEUDO).write_text(json.dumps({
        "duration": 12_000_000,
        "fps": 30.0,
        "canvas_config": {"width": 1080, "height": 1920},
        "tracks": [{"type": "video",
                    "segments": [{"id": "s1", "material_id": "m1",
                                  "target_timerange": {"start": 0,
                                                       "duration": 5_000_000}}]}],
        "materials": {"videos": [{"id": "m1",
                                  "path": "C:\\Users\\joao\\video.mp4"}],
                      "texts": []},
    }), encoding="utf-8")
    (pasta / capcut.ARQ_META).write_text(
        json.dumps({"draft_name": nome, "draft_fold_path": str(pasta)}),
        encoding="utf-8")
    return capcut.Projeto(nome, str(pasta), 0.0)


def test_reconhece_pasta_de_projetos(tmp_path):
    _projeto_falso(tmp_path)
    assert capcut.eh_pasta_de_projetos(str(tmp_path))
    assert not capcut.eh_pasta_de_projetos(str(tmp_path / "nao-existe"))


def test_lista_projetos(tmp_path):
    _projeto_falso(tmp_path, "A")
    _projeto_falso(tmp_path, "B")
    assert {p.nome for p in capcut.lista_projetos(str(tmp_path))} == {"A", "B"}


def test_clone_nao_toca_no_original(tmp_path):
    modelo = _projeto_falso(tmp_path)
    novo = capcut.clona_projeto(modelo, "Feirao 02")
    assert os.path.isfile(novo.conteudo)
    assert modelo.carrega()["duration"] == 12_000_000
    meta = json.load(open(os.path.join(novo.pasta, capcut.ARQ_META),
                          encoding="utf-8"))
    assert meta["draft_name"] == "Feirao 02"


def test_clone_recusa_sobrescrever(tmp_path):
    modelo = _projeto_falso(tmp_path)
    capcut.clona_projeto(modelo, "Feirao 02")
    try:
        capcut.clona_projeto(modelo, "Feirao 02")
        assert False, "deveria ter recusado"
    except FileExistsError:
        pass


# ------------------------------------------------------------ inspetor

def test_inspecao_mapeia_trilhas_e_materiais(tmp_path):
    rel = inspetor.inspeciona(_projeto_falso(tmp_path))
    assert rel["trilhas"][0]["tipo"] == "video"
    assert rel["trilhas"][0]["segmentos"] == 1
    assert rel["materiais"]["videos"]["quantidade"] == 1
    assert "duration" in rel["chaves_do_topo"]


def test_inspecao_esconde_caminho_pessoal(tmp_path):
    rel = inspetor.inspeciona(_projeto_falso(tmp_path))
    bruto = json.dumps(rel, ensure_ascii=False)
    assert "C:\\Users" not in bruto and "joao" not in bruto


def test_resumo_corta_lista_longa():
    r = inspetor.resume(list(range(50)))
    assert r[-1].startswith("...mais 48")
