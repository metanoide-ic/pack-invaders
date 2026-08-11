"""Testes das legendas estilizadas e da montagem do zero.

O que importa aqui: o .ass tem de sair valido e alinhado com a fala, e a
montagem tem de nunca mostrar um campo de template nao preenchido na tela.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from feirao import (acoes, estilos, fontes, montagem,  # noqa: E402
                    template)
from feirao.legendas import Fala, Palavra  # noqa: E402


def _falas(pares, inicio=0.5):
    t, ps = inicio, []
    for w, d in pares:
        ps.append(Palavra(round(t, 3), round(t + d, 3), w))
        t += d
    return [Fala(ps[0].inicio, ps[-1].fim, " ".join(p.texto for p in ps), ps)]


EXEMPLO = _falas([("CHEGOU", .4), ("O", .15), ("FEIRÃO", .5), ("COM", .2)])


# ------------------------------------------------------------------ fontes

def test_fontes_embutidas_presentes():
    assert fontes.embutidas_presentes(), "as fontes OFL sumiram da pasta"


def test_caminho_de_fonte_nunca_vazio_para_apelido_conhecido():
    assert os.path.isfile(fontes.caminho("impacto"))


def test_apelido_desconhecido_cai_no_padrao():
    assert fontes.caminho("nao_existe") == fontes.caminho("impacto")


# --------------------------------------------------------------- cores ASS

def test_cor_inverte_canais_como_o_ass_espera():
    # #FFD400 -> &H0000D4FF (alpha, B, G, R)
    assert estilos._cor("#FFD400") == "&H0000D4FF"


def test_cor_invalida_vira_branco():
    assert estilos._cor("xyz") == "&H00FFFFFF"


def test_tempo_ass_em_centesimos():
    assert estilos._tempo(0) == "0:00:00.00"
    assert estilos._tempo(3661.5) == "1:01:01.50"


def test_tempo_ass_nao_estoura_no_arredondamento():
    assert estilos._tempo(1.9999) == "0:00:02.00"


# ------------------------------------------------------- montagem do .ass

def test_ass_tem_cabecalho_e_eventos():
    txt = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920)
    assert "[V4+ Styles]" in txt and "[Events]" in txt
    assert txt.count("Dialogue:") == 4      # um evento por palavra


def test_quebra_de_linha_ligada():
    """WrapStyle 2 nao quebra linha e a frase vaza pela lateral da tela."""
    txt = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920)
    assert "WrapStyle: 0" in txt


def test_caixa_preta_tem_preenchimento():
    """Com BorderStyle=3 a espessura E a caixa; zero deixaria sem fundo."""
    cfg = estilos.ESTILOS["caixa_preta"]
    assert cfg["caixa"] and cfg["espessura"] > 0
    assert "3," in estilos.monta_ass(EXEMPLO, "caixa_preta", 1080, 1920)


def test_uma_palavra_mostra_uma_por_vez():
    txt = estilos.monta_ass(EXEMPLO, "uma_palavra", 1080, 1920)
    linhas = [l for l in txt.splitlines() if l.startswith("Dialogue:")]
    for l in linhas:
        corpo = l.split(",,", 1)[1]
        limpo = corpo.replace("{", "|").split("|")
        assert len([p for p in limpo if p.strip() and "\\" not in p]) <= 1


def test_destaque_muda_de_cor_na_palavra_ativa():
    txt = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920)
    assert estilos._cor("#FFD400") in txt


def test_evento_nunca_tem_duracao_negativa():
    txt = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920)
    for l in txt.splitlines():
        if l.startswith("Dialogue:"):
            ini, fim = l.split(",")[1], l.split(",")[2]
            assert fim > ini or fim == ini


def test_chaves_no_texto_nao_viram_comando_ass():
    """Texto com { } quebraria a renderizacao — tem de ser neutralizado."""
    f = _falas([("{\\fs99}HACK", .4)])
    txt = estilos.monta_ass(f, "viral_amarelo", 1080, 1920)
    corpo = [l for l in txt.splitlines() if l.startswith("Dialogue:")][0]
    assert "\\fs99" not in corpo


def test_estilo_desconhecido_levanta():
    try:
        estilos.monta_ass(EXEMPLO, "neon_roxo", 1080, 1920)
        assert False, "deveria ter levantado"
    except KeyError:
        pass


def test_sem_tempo_por_palavra_nao_gera_evento():
    sem = [Fala(1.0, 3.0, "sem palavras", [])]
    txt = estilos.monta_ass(sem, "viral_amarelo", 1080, 1920)
    assert "Dialogue:" not in txt
    assert not estilos.tem_tempo_por_palavra(sem)


def test_detecta_tempo_por_palavra():
    assert estilos.tem_tempo_por_palavra(EXEMPLO)


def test_corpo_escala_com_a_altura():
    baixo = estilos.monta_ass(EXEMPLO, "viral_amarelo", 720, 1280)
    alto = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920)
    assert "PlayResY: 1280" in baixo and "PlayResY: 1920" in alto


def test_caminho_windows_escapado_para_o_filtro():
    saida = estilos._para_filtro("C:\\Users\\jp\\Desktop\\a.ass")
    assert "\\\\:" in saida and "\\" not in saida.replace("\\\\:", "")


# ---------------------------------------------------- vocabulario ligado

def test_enum_de_legendas_bate_com_o_implementado():
    assert set(acoes.LEGENDAS) == set(estilos.ESTILOS)


def test_estilo_de_legenda_invalido_e_descartado():
    p = acoes.valida_plano(
        {"resumo": "t", "acoes": [{"tipo": "legendas", "estilo": "arco_iris",
                                   "motivo": "x"}]}, 10.0)
    assert p.acoes == [] and "arco_iris" in p.avisos[0]


def test_estilo_de_legenda_valido_passa():
    p = acoes.valida_plano(
        {"resumo": "t", "acoes": [{"tipo": "legendas",
                                   "estilo": "viral_amarelo",
                                   "motivo": "x"}]}, 10.0)
    assert len(p.acoes) == 1


# ------------------------------------------------------------- template

def test_campo_nao_preenchido_nao_aparece_na_tela():
    conf = template.template_padrao()
    p = template.monta_plano(conf, ["a.jpg"])
    assert "{" not in p.blocos[-1].textos["subtitulo"]


def test_campos_preenchidos_aparecem():
    conf = template.template_padrao()
    p = template.monta_plano(conf, ["a.jpg"],
                            dados={"loja": "JP Autos", "telefone": "1199"})
    assert p.blocos[-1].textos["subtitulo"] == "JP Autos · 1199"


def test_separador_orfao_e_limpo():
    assert template._preenche("{a} · {b}", {"a": "X"}) == "X"
    assert template._preenche("{a} · {b}", {}) == ""


# ------------------------------------------------------------- montagem

def test_cartao_tem_o_tamanho_pedido():
    img = montagem.cartao("FEIRÃO", "OFERTAS", 1080, 1920)
    assert img.size == (1080, 1920)


def test_cartao_com_titulo_enorme_nao_estoura():
    img = montagem.cartao("PALAVRA " * 20, "", 1080, 1920)
    assert img.size == (1080, 1920)


def test_faixa_vazia_e_transparente():
    img = montagem.faixa_oferta("", 1080, 1920)
    assert img.getbbox() is None


def test_faixa_com_texto_desenha_algo():
    img = montagem.faixa_oferta("ONIX\nR$ 59.990\n0KM", 1080, 1920)
    assert img.getbbox() is not None


def test_montar_sem_midia_levanta():
    try:
        montagem.monta([], "/tmp/x.mp4")
        assert False, "deveria ter levantado"
    except ValueError:
        pass


def test_montar_com_arquivo_inexistente_levanta():
    try:
        montagem.monta(["/nao/existe/foto.jpg"], "/tmp/x.mp4")
        assert False, "deveria ter levantado"
    except FileNotFoundError:
        pass


# ------------------------- regressao: faixa x legenda disputavam o rodape

def test_faixa_de_oferta_nao_invade_a_zona_da_legenda():
    """A faixa e a legenda queimada ocupavam o mesmo terco de baixo e ficavam
    ilegiveis uma sobre a outra. A faixa foi para o topo."""
    A = 1920
    img = montagem.faixa_oferta("ONIX 1.0\nR$ 59.990\nENTRADA + 48X", 1080, A)
    _, _, _, base = img.getbbox()
    zona_legenda = A * 0.70            # onde a legenda 'padrao' comeca
    assert base < zona_legenda, (
        f"a faixa desce ate {base}px e invade a legenda a partir de "
        f"{zona_legenda:.0f}px")


def test_posicao_alta_sobe_a_legenda():
    baixa = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920, "padrao")
    alta = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920, "alta")
    m_baixa = int([l for l in baixa.splitlines()
                   if l.startswith("Style:")][0].split(",")[-2])
    m_alta = int([l for l in alta.splitlines()
                  if l.startswith("Style:")][0].split(",")[-2])
    assert m_alta > m_baixa


def test_posicao_centro_usa_alinhamento_do_meio():
    txt = estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920, "centro")
    campos = [l for l in txt.splitlines() if l.startswith("Style:")][0].split(",")
    assert campos[-5] == "5"           # Alignment 5 = centro da tela


def test_posicao_invalida_levanta():
    try:
        estilos.monta_ass(EXEMPLO, "viral_amarelo", 1080, 1920, "flutuante")
        assert False, "deveria ter levantado"
    except KeyError:
        pass


def test_posicao_de_legenda_invalida_e_descartada_no_plano():
    p = acoes.valida_plano({"resumo": "t", "acoes": [
        {"tipo": "legendas", "estilo": "viral_amarelo",
         "posicao": "flutuante", "motivo": "x"}]}, 10.0)
    assert p.acoes == [] and "posicao" in p.avisos[0]
