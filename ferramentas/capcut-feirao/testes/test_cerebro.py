"""Testes do planejador e do executor.

Nenhum chama a API: o valor esta em garantir que um plano mal formado nunca
vira uma edicao errada, e que o mapa de tempo mantem cada efeito em cima da
fala certa depois dos cortes.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from feirao import acoes, animacoes, cerebro, executor  # noqa: E402


# ------------------------------------------------- vocabulario / esquema

def test_enum_so_tem_animacao_implementada():
    esquema = acoes.esquema_json()
    variantes = esquema["properties"]["acoes"]["items"]["anyOf"]
    anim = next(v for v in variantes
                if v["properties"]["tipo"]["const"] == "animacao")
    assert set(anim["properties"]["nome"]["enum"]) == set(animacoes.REGISTRO)


def test_esquema_respeita_limites_de_structured_outputs():
    def caminha(no):
        if isinstance(no, dict):
            if no.get("type") == "object":
                assert no.get("additionalProperties") is False
                assert "required" in no
            for v in no.values():
                caminha(v)
        elif isinstance(no, list):
            for v in no:
                caminha(v)
    caminha(acoes.esquema_json())


def test_esquema_serializa():
    json.dumps(acoes.esquema_json())


# --------------------------------------------------------- validacao

def _plano(acoes_brutas, duracao=30.0):
    return acoes.valida_plano({"resumo": "t", "acoes": acoes_brutas}, duracao)


def test_acao_boa_passa():
    p = _plano([{"tipo": "cortar", "inicio": 2, "fim": 5, "motivo": "silencio"}])
    assert len(p.acoes) == 1 and not p.avisos


def test_tipo_inventado_e_descartado_sem_derrubar_o_resto():
    p = _plano([{"tipo": "explodir_tela", "motivo": "x"},
                {"tipo": "cortar", "inicio": 1, "fim": 2, "motivo": "ok"}])
    assert len(p.acoes) == 1 and len(p.avisos) == 1


def test_animacao_inventada_e_descartada():
    p = _plano([{"tipo": "animacao", "nome": "chuva_de_dinheiro",
                 "inicio": 3, "duracao": 1, "motivo": "x"}])
    assert p.acoes == [] and "chuva_de_dinheiro" in p.avisos[0]


def test_corte_invertido_e_descartado():
    p = _plano([{"tipo": "cortar", "inicio": 9, "fim": 4, "motivo": "x"}])
    assert p.acoes == []


def test_corte_alem_do_fim_e_aparado():
    p = _plano([{"tipo": "cortar", "inicio": 25, "fim": 99, "motivo": "x"}],
               duracao=30.0)
    assert p.acoes[0].dados["fim"] == 30.0


def test_acao_depois_do_fim_do_video_e_descartada():
    p = _plano([{"tipo": "animacao", "nome": "confete", "inicio": 45,
                 "duracao": 1, "motivo": "x"}], duracao=30.0)
    assert p.acoes == []


def test_rasgar_papel_sem_texto_e_descartado():
    p = _plano([{"tipo": "animacao", "nome": "rasgar_papel", "inicio": 3,
                 "duracao": 1, "motivo": "x"}])
    assert p.acoes == [] and "texto" in p.avisos[0]


def test_tempo_como_texto_nao_derruba():
    p = _plano([{"tipo": "cortar", "inicio": "abc", "fim": 5, "motivo": "x"}])
    assert p.acoes == [] and "numero" in p.avisos[0]


def test_cortes_sobrepostos_viram_um():
    p = _plano([{"tipo": "cortar", "inicio": 2, "fim": 6, "motivo": "a"},
                {"tipo": "cortar", "inicio": 5, "fim": 9, "motivo": "b"}])
    cortes = p.por_tipo("cortar")
    assert len(cortes) == 1
    assert cortes[0].dados["inicio"] == 2 and cortes[0].dados["fim"] == 9


def test_cortes_separados_continuam_separados():
    p = _plano([{"tipo": "cortar", "inicio": 2, "fim": 4, "motivo": "a"},
                {"tipo": "cortar", "inicio": 8, "fim": 9, "motivo": "b"}])
    assert len(p.por_tipo("cortar")) == 2


def test_preset_de_cor_invalido_e_descartado():
    p = _plano([{"tipo": "cor", "preset": "vaporwave", "motivo": "x"}])
    assert p.acoes == []


def test_plano_que_nao_e_objeto_levanta():
    try:
        acoes.valida_plano(["nao", "sou", "objeto"], 10.0)
        assert False, "deveria ter levantado"
    except acoes.PlanoInvalido:
        pass


# ------------------------------------------- mapa de tempo apos os cortes

def test_trechos_apos_cortes():
    cortes = [acoes.Acao("cortar", {"inicio": 5.0, "fim": 8.0})]
    assert executor.trechos_apos_cortes(20.0, cortes) == [(0.0, 5.0), (8.0, 20.0)]


def test_corte_no_inicio():
    cortes = [acoes.Acao("cortar", {"inicio": 0.0, "fim": 3.0})]
    assert executor.trechos_apos_cortes(10.0, cortes) == [(3.0, 10.0)]


def _linha(duracao, cortes=(), velocidades=(), transicoes=()):
    from feirao import tempo
    return tempo.LinhaDoTempo.de(duracao, cortes, velocidades, transicoes)


def test_animacao_anda_junto_com_o_corte():
    # removemos 5s-8s; o que estava em 12s tem de virar 9s
    linha = _linha(20.0, cortes=[(5.0, 8.0)])
    assert linha.converte(12.0) == 9.0
    assert linha.converte(2.0) == 2.0


def test_efeito_dentro_do_trecho_cortado_some():
    assert _linha(20.0, cortes=[(5.0, 8.0)]).converte(6.5) is None


def test_sem_corte_o_tempo_nao_muda():
    assert _linha(30.0).converte(17.3) == 17.3


def test_linha_do_plano_junta_corte_velocidade_e_transicao():
    plano = acoes.valida_plano({"resumo": "t", "acoes": [
        {"tipo": "cortar", "inicio": 2.0, "fim": 4.0, "motivo": "x"},
        {"tipo": "velocidade", "inicio": 6.0, "fim": 8.0, "fator": 0.5,
         "motivo": "x"},
        {"tipo": "transicao", "nome": "fade", "inicio": 2.0, "duracao": 0.5,
         "motivo": "x"},
    ]}, 20.0)
    linha = executor.linha_do_plano(plano, 20.0)
    # 20 - 2 de corte + 2 de camera lenta - 0.5 de transicao
    assert linha.duracao_saida() == 19.5
    assert linha.tem_velocidade() and linha.tem_transicao()


# ------------------------------------------------------------ filtro de cor

def test_intensidade_zero_e_praticamente_neutra():
    f = executor.filtro_de_cor("quente_vibrante", 0.0)
    assert "saturation=1.0" in f and "contrast=1.0" in f


def test_intensidade_cheia_muda_de_verdade():
    f = executor.filtro_de_cor("quente_vibrante", 1.0)
    assert "saturation=1.35" in f


def test_intensidade_meia_fica_no_meio():
    f = executor.filtro_de_cor("punch_alto_contraste", 0.5)
    assert "saturation=1.14" in f


def test_todo_preset_tem_filtro():
    for preset in acoes.CORES:
        assert executor.filtro_de_cor(preset, 1.0)


# -------------------------------------------------------------- animacoes

def test_registro_e_vocabulario_batem():
    assert set(animacoes.DISPONIVEIS) == set(animacoes.REGISTRO)


def test_gera_animacao_desconhecida_levanta():
    try:
        animacoes.gera("nao_existe", "x", "/tmp/x.mp4")
        assert False, "deveria ter levantado"
    except KeyError:
        pass


def test_texto_gigante_nao_quebra_o_papel():
    img = animacoes._folha("PALAVRAMUITOLONGA", 400, 120)
    assert img.size == (400, 120)


def test_ordem_do_roteiro():
    linhas = ["12.00s  ANIMACAO x", "COR: quente", "3.00s  TEXTO y"]
    assert sorted(linhas, key=executor._ordem_roteiro)[0].startswith("COR")


# ---------------------------------------------------------------- cerebro

def test_transcricao_vazia_nao_quebra():
    assert "sem transcricao" in cerebro._bloco_transcricao([])


def test_bloco_de_transcricao_traz_tempos():
    from feirao.legendas import Fala
    txt = cerebro._bloco_transcricao([Fala(1.5, 3.0, "rasgando preço")])
    assert "1.50s" in txt and "rasgando preço" in txt


def test_disponivel_e_falso_sem_chave(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert cerebro.disponivel() is False


def test_erro_util_sem_chave(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    try:
        cerebro._cliente()
        assert False, "deveria ter levantado"
    except RuntimeError as erro:
        assert "setx ANTHROPIC_API_KEY" in str(erro)


def test_modelo_e_o_esperado():
    assert cerebro.MODELO == "claude-opus-5"


# ------------------------------------------- regressoes da revisao (Fable)

def test_intensidade_zero_nao_vira_um(tmp_path):
    """Bug: `dados.get('intensidade', 1.0) or 1.0` transformava 0.0 em 1.0."""
    import inspect
    fonte = inspect.getsource(executor.aplica)
    assert '"intensidade") or' not in fonte and "'intensidade') or" not in fonte
    # e o filtro com 0.0 tem de sair neutro
    assert "saturation=1.0" in executor.filtro_de_cor("quente_vibrante", 0.0)


def test_cortes_totais_nao_derrubam(tmp_path):
    """Cortes cobrindo o video inteiro viram aviso, nao erro do ffmpeg."""
    plano = acoes.valida_plano({
        "resumo": "t",
        "acoes": [{"tipo": "cortar", "inicio": 0, "fim": 99, "motivo": "x"},
                  {"tipo": "cor", "preset": "natural_limpo",
                   "intensidade": 1.0, "motivo": "x"}],
    }, 10.0)
    import feirao.media as m
    chamadas = {}
    original = executor._renderiza

    def falso(entrada, saida, linha, filtro, tem_audio=True, fps=None):
        chamadas["trechos"] = linha.pares_de_corte()
        open(saida, "w").close()

    executor._renderiza = falso
    m_sonda = m.sonda
    m.sonda = lambda c: m.InfoMidia(c, 10.0, 640, 360, 30.0, True)
    try:
        r = executor.aplica(plano, "video.mp4", str(tmp_path))
    finally:
        executor._renderiza = original
        m.sonda = m_sonda
    assert chamadas["trechos"] == [(0.0, 10.0)]
    assert any("video inteiro" in a for a in r["avisos"])


def test_renderiza_video_sem_audio(tmp_path):
    """O grafo de filtros nao pode citar [0:a] quando nao ha trilha."""
    import subprocess as sp
    capturado = {}
    original = executor.subprocess.run

    def falso(cmd, **kw):
        capturado["cmd"] = cmd

        class R:
            returncode = 0
            stderr = ""
        return R()

    executor.subprocess.run = falso
    try:
        executor._renderiza("in.mp4", "out.mp4",
                            _linha(10.0, cortes=[(5.0, 6.0)]), None,
                            tem_audio=False)
    finally:
        executor.subprocess.run = original
    grafo = capturado["cmd"][capturado["cmd"].index("-filter_complex") + 1]
    assert "[0:a]" not in grafo and "a=0" in grafo
    assert "[ao]" not in capturado["cmd"]


def test_renderiza_sem_trechos_levanta():
    from feirao import tempo
    try:
        executor._renderiza("in.mp4", "out.mp4", tempo.LinhaDoTempo([]), None)
        assert False, "deveria ter levantado"
    except ValueError:
        pass


def test_esquema_tudo_obrigatorio():
    """Strict mode sem zona cinzenta: required cobre todas as propriedades."""
    for v in acoes.esquema_json()["properties"]["acoes"]["items"]["anyOf"]:
        assert set(v["properties"]) == set(v["required"])


def test_desloca_com_trechos_vazios_devolve_como_esta():
    from feirao.legendas import Fala, desloca
    falas = [Fala(1.0, 2.0, "oi")]
    assert desloca(falas, []) == falas
