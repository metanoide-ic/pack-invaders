"""Testes da linha do tempo, das transicoes, do audio e dos textos.

Nenhum deles chama a API nem renderiza video: e tudo conta de tempo e monta de
string de filtro, que e exatamente onde os erros silenciosos moram.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from feirao import acoes, audio, tempo, textos, transicoes  # noqa: E402
from feirao.legendas import Fala, Palavra, remapeia  # noqa: E402


# ------------------------------------------------------------- corte puro

def test_sem_nada_a_linha_e_o_video_inteiro():
    linha = tempo.LinhaDoTempo.de(10.0)
    assert linha.duracao_saida() == 10.0
    assert not linha.mexeu()
    assert not linha.tem_velocidade()


def test_corte_encurta_e_desloca():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(2.0, 4.0)])
    assert linha.duracao_saida() == 8.0
    assert linha.converte(1.0) == 1.0
    assert linha.converte(3.0) is None
    assert linha.converte(5.0) == 3.0


def test_cortes_que_cobrem_tudo_deixam_a_linha_vazia():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(0.0, 10.0)])
    assert linha.trechos == []
    assert linha.duracao_saida() == 0.0


# ---------------------------------------------------------- velocidade

def test_camera_lenta_alonga_o_video():
    linha = tempo.LinhaDoTempo.de(10.0, velocidades=[(2.0, 4.0, 0.5)])
    assert linha.duracao_saida() == 12.0
    assert linha.converte(3.0) == 4.0        # 2s + 1s de origem a meia marcha
    assert linha.converte(5.0) == 7.0


def test_acelerado_encurta_o_video():
    linha = tempo.LinhaDoTempo.de(10.0, velocidades=[(0.0, 4.0, 2.0)])
    assert linha.duracao_saida() == 8.0
    assert linha.converte(2.0) == 1.0


def test_duracao_de_efeito_acompanha_a_velocidade():
    linha = tempo.LinhaDoTempo.de(10.0, velocidades=[(2.0, 6.0, 0.5)])
    assert linha.converte_duracao(3.0, 1.0) == 2.0     # dentro da lenta
    assert linha.converte_duracao(8.0, 1.0) == 1.0     # fora dela


def test_velocidade_fica_dentro_da_faixa():
    linha = tempo.LinhaDoTempo.de(10.0, velocidades=[(0.0, 5.0, 99.0)])
    assert linha.trechos[0].fator == tempo.VELOCIDADE_MAX
    linha = tempo.LinhaDoTempo.de(10.0, velocidades=[(0.0, 5.0, 0.01)])
    assert linha.trechos[0].fator == tempo.VELOCIDADE_MIN


def test_corte_e_velocidade_juntos():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(1.0, 2.0)],
                                  velocidades=[(4.0, 6.0, 0.5)])
    assert linha.duracao_saida() == 11.0     # -1 de corte, +2 de camera lenta
    assert linha.converte(0.5) == 0.5
    assert linha.converte(1.5) is None
    assert linha.converte(7.0) == 8.0


def test_atempo_encadeia_fora_da_faixa_do_filtro():
    # cada instancia do atempo so vai de 0.5 a 2.0
    assert tempo._atempo(4.0) == "atempo=2.0,atempo=2.0000"
    assert tempo._atempo(0.25) == "atempo=0.5,atempo=0.5000"
    assert tempo._atempo(1.5) == "atempo=1.5000"


# ---------------------------------------------------------- transicoes

def test_transicao_gruda_num_corte_existente():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(4.0, 5.0)],
                                  transicoes=[(4.0, "zoom", 0.5)])
    assert len(linha.trechos) == 2
    assert linha.trechos[1].transicao == "zoom"
    assert linha.duracao_saida() == 8.5      # 9 de corte, -0.5 de transicao


def test_transicao_longe_de_corte_abre_uma_junta():
    linha = tempo.LinhaDoTempo.de(10.0, transicoes=[(6.0, "circulo", 0.8)])
    assert [(t.inicio, t.fim) for t in linha.trechos] == [(0.0, 6.0),
                                                          (6.0, 10.0)]
    assert linha.duracao_saida() == 9.2


def test_transicao_nao_come_mais_do_que_o_trecho_tem():
    linha = tempo.LinhaDoTempo.de(10.0, transicoes=[(0.6, "fade", 2.0)])
    # o primeiro trecho tem 0.6s: a transicao nao pode durar 2s
    assert linha.trechos[1].transicao_dur <= 0.9 * 0.6
    assert linha.duracao_saida() > 9.0


def test_transicao_colada_no_comeco_vira_aviso():
    # nao ha nada antes do segundo 0.2 para cruzar com o que vem depois
    linha = tempo.LinhaDoTempo.de(10.0, transicoes=[(0.2, "fade", 0.5)])
    assert linha.perdidas == [(0.2, "fade")]
    assert not linha.tem_transicao()


def test_transicao_entre_trechos_curtos_demais_vira_aviso():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(0.1, 9.95)],
                                  transicoes=[(0.1, "fade", 0.5)])
    assert linha.perdidas and not linha.tem_transicao()


def test_primeiro_trecho_nunca_tem_transicao():
    linha = tempo.LinhaDoTempo.de(10.0, transicoes=[(0.0, "fade", 0.5)])
    assert linha.trechos[0].transicao == ""


def test_grupos_separam_onde_ha_transicao():
    linha = tempo.LinhaDoTempo.de(12.0, cortes=[(3.0, 4.0), (7.0, 8.0)],
                                  transicoes=[(7.0, "fade", 0.4)])
    # tres trechos, transicao so na ultima junta -> dois grupos
    assert linha.grupos() == [[0, 1], [2]]


def test_toda_transicao_do_vocabulario_existe_no_ffmpeg():
    for nome in transicoes.DISPONIVEIS:
        assert transicoes.xfade(nome), f"{nome} sem xfade correspondente"


def test_duracao_de_transicao_e_limitada():
    assert transicoes.limita(99) == transicoes.DURACAO_MAX
    assert transicoes.limita(0.001) == transicoes.DURACAO_MIN
    assert transicoes.limita("nao e numero") == transicoes.DURACAO_PADRAO


# ------------------------------------------------------------ o grafo

def _grafo(**kw):
    return tempo.grafo(tempo.LinhaDoTempo.de(10.0, **kw), fps=30)


def test_grafo_de_corte_simples_nao_cita_xfade():
    g = _grafo(cortes=[(2.0, 4.0)])
    assert "xfade" not in g and "concat=n=2" in g
    assert g.endswith("[vo];[a0][a1]concat=n=2:v=0:a=1[ao]") or "[vo]" in g


def test_grafo_com_transicao_usa_xfade_e_acrossfade():
    g = _grafo(cortes=[(4.0, 5.0)], transicoes=[(4.0, "zoom", 0.5)])
    assert "xfade=transition=zoomin" in g
    assert "acrossfade=d=0.5" in g


def test_grafo_sem_audio_nao_cita_a_trilha():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(2.0, 4.0)])
    g = tempo.grafo(linha, tem_audio=False, fps=30)
    assert "[0:a]" not in g and "[ao]" not in g


def test_grafo_normaliza_para_o_xfade_aceitar():
    # sem settb/setsar/aformat o ffmpeg recusa a juncao dos fluxos
    g = _grafo(cortes=[(4.0, 5.0)], transicoes=[(4.0, "fade", 0.4)])
    assert "settb=AVTB" in g and "setsar=1" in g and "asettb=AVTB" in g


def test_grafo_de_linha_vazia_levanta():
    try:
        tempo.grafo(tempo.LinhaDoTempo([]))
        assert False, "deveria ter levantado"
    except ValueError:
        pass


# ------------------------------------------------- legendas remapeadas

def _fala(ini, fim, texto, palavras):
    return Fala(ini, fim, texto,
                [Palavra(a, b, t) for a, b, t in palavras])


def test_legenda_anda_com_o_corte():
    falas = [_fala(6.0, 7.0, "boa oferta", [(6.0, 6.4, "boa"),
                                            (6.5, 7.0, "oferta")])]
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(2.0, 4.0)])
    r = remapeia(falas, linha)
    assert r[0].palavras[0].inicio == 4.0
    assert r[0].inicio == 4.0


def test_legenda_estica_na_camera_lenta():
    falas = [_fala(2.0, 3.0, "olha o preco", [(2.0, 2.5, "olha"),
                                              (2.5, 3.0, "preco")])]
    linha = tempo.LinhaDoTempo.de(10.0, velocidades=[(2.0, 4.0, 0.5)])
    r = remapeia(falas, linha)
    assert r[0].palavras[0].inicio == 2.0
    assert r[0].palavras[1].inicio == 3.0      # 0.5s de origem viram 1s
    assert r[0].fim > 3.9


def test_palavra_cortada_some_da_legenda():
    falas = [_fala(1.0, 6.0, "um dois tres", [(1.0, 1.5, "um"),
                                              (3.0, 3.5, "dois"),
                                              (5.5, 6.0, "tres")])]
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(2.0, 4.0)])
    r = remapeia(falas, linha)
    assert [p.texto for p in r[0].palavras] == ["um", "tres"]


def test_fala_inteiramente_cortada_desaparece():
    falas = [_fala(2.2, 3.5, "sumiu", [(2.2, 3.5, "sumiu")])]
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(2.0, 4.0)])
    assert remapeia(falas, linha) == []


def test_remapeia_sem_linha_devolve_como_esta():
    falas = [_fala(1.0, 2.0, "x", [(1.0, 2.0, "x")])]
    assert remapeia(falas, None) is falas


# ---------------------------------------------------------------- audio

def test_todo_som_do_vocabulario_tem_formula():
    for nome in audio.DISPONIVEIS:
        dur, fonte, filtro, texto = audio.SONS[nome]
        assert dur > 0 and fonte and filtro and texto


def test_precisa_de_audio_so_quando_ha_o_que_fazer():
    assert not audio.precisa(None, [], 1.0)
    assert audio.precisa("musica.mp3", [], 1.0)
    assert audio.precisa(None, [{"nome": "pop"}], 1.0)
    assert audio.precisa(None, [], 0.0)


def test_audio_sem_nada_a_fazer_levanta(tmp_path):
    try:
        audio.aplica("in.mp4", str(tmp_path / "out.mp4"), 5.0)
        assert False, "deveria ter levantado"
    except ValueError:
        pass


def test_trilha_inexistente_levanta(tmp_path):
    try:
        audio.aplica("in.mp4", str(tmp_path / "out.mp4"), 5.0,
                     trilha=str(tmp_path / "nao_existe.mp3"))
        assert False, "deveria ter levantado"
    except FileNotFoundError:
        pass


def test_ducking_entra_no_grafo(tmp_path, monkeypatch):
    musica = tmp_path / "m.mp3"
    musica.write_bytes(b"x")
    capturado = {}

    class R:
        returncode = 0
        stderr = ""

    monkeypatch.setattr(audio.subprocess, "run",
                        lambda cmd, **kw: (capturado.setdefault("cmd", cmd),
                                           R())[1])
    audio.aplica("in.mp4", str(tmp_path / "o.mp4"), 8.0, tem_audio=True,
                 trilha=str(musica), abaixar_na_fala=True)
    g = capturado["cmd"][capturado["cmd"].index("-filter_complex") + 1]
    assert "sidechaincompress" in g and "asplit=2" in g
    # a imagem nao pode ser recomprimida so por causa do audio
    assert "copy" in capturado["cmd"]


def test_sem_abaixar_nao_ha_sidechain(tmp_path, monkeypatch):
    musica = tmp_path / "m.mp3"
    musica.write_bytes(b"x")
    capturado = {}

    class R:
        returncode = 0
        stderr = ""

    monkeypatch.setattr(audio.subprocess, "run",
                        lambda cmd, **kw: (capturado.setdefault("cmd", cmd),
                                           R())[1])
    audio.aplica("in.mp4", str(tmp_path / "o.mp4"), 8.0, tem_audio=True,
                 trilha=str(musica), abaixar_na_fala=False)
    g = capturado["cmd"][capturado["cmd"].index("-filter_complex") + 1]
    assert "sidechaincompress" not in g


def test_som_depois_do_fim_do_video_e_ignorado(tmp_path, monkeypatch):
    capturado = {}

    class R:
        returncode = 0
        stderr = ""

    monkeypatch.setattr(audio.subprocess, "run",
                        lambda cmd, **kw: (capturado.setdefault("cmd", cmd),
                                           R())[1])
    audio.aplica("in.mp4", str(tmp_path / "o.mp4"), 5.0, tem_audio=True,
                 sons=[{"nome": "pop", "inicio": 99.0},
                       {"nome": "pop", "inicio": 1.0}])
    g = capturado["cmd"][capturado["cmd"].index("-filter_complex") + 1]
    assert g.count("adelay") == 1


# --------------------------------------------------------------- textos

def test_desenha_devolve_camada_transparente_do_tamanho_do_video():
    img = textos.desenha("ENTRADA ZERO", "impacto", "centro", 720, 1280)
    assert img.size == (720, 1280) and img.mode == "RGBA"
    assert img.getextrema()[3][1] > 200          # tem tinta opaca


def test_texto_vazio_nao_desenha_nada():
    img = textos.desenha("   ", "impacto", "centro", 320, 480)
    assert img.getextrema()[3][1] == 0


def test_posicoes_mudam_onde_a_tinta_cai():
    def centro_de_massa(pos):
        img = textos.desenha("PRECO", "impacto", pos, 400, 600)
        alfa = img.split()[-1]
        pixels = [(x, y) for y in range(0, 600, 4) for x in range(0, 400, 4)
                  if alfa.getpixel((x, y)) > 128]
        n = max(1, len(pixels))
        return (sum(p[0] for p in pixels) / n, sum(p[1] for p in pixels) / n)

    assert centro_de_massa("topo")[1] < centro_de_massa("rodape")[1]
    assert centro_de_massa("esquerda")[0] < centro_de_massa("direita")[0]


def test_palavra_comprida_encolhe_ate_caber():
    img = textos.desenha("SUPERFINANCIAMENTOAPROVADISSIMO", "impacto",
                         "centro", 400, 700)
    alfa = img.split()[-1]
    colunas = [x for x in range(400) if any(alfa.getpixel((x, y)) > 100
                                            for y in range(0, 700, 5))]
    assert colunas and min(colunas) >= 0 and max(colunas) <= 399


def test_aplica_sem_texto_levanta():
    try:
        textos.aplica("in.mp4", "out.mp4", [{"texto": "  "}])
        assert False, "deveria ter levantado"
    except ValueError:
        pass


# ------------------------------------------------- contrato com o modelo

def test_vocabulario_de_transicao_vem_do_registro_real():
    assert acoes.TRANSICOES is transicoes.DISPONIVEIS


def test_vocabulario_de_som_vem_do_registro_real():
    assert acoes.SONS is audio.DISPONIVEIS


def test_velocidade_sem_efeito_e_recusada():
    for fator in (1.0, 0.99, 1.02):
        try:
            acoes.valida_acao({"tipo": "velocidade", "inicio": 1.0,
                               "fim": 2.0, "fator": fator}, 10.0)
            assert False, f"fator {fator} deveria ser recusado"
        except acoes.PlanoInvalido:
            pass


def test_velocidade_fora_da_faixa_e_recusada():
    for fator in (0.1, 9.0):
        try:
            acoes.valida_acao({"tipo": "velocidade", "inicio": 1.0,
                               "fim": 2.0, "fator": fator}, 10.0)
            assert False, f"fator {fator} deveria ser recusado"
        except acoes.PlanoInvalido:
            pass


def test_transicao_desconhecida_e_recusada():
    try:
        acoes.valida_acao({"tipo": "transicao", "nome": "explosao",
                           "inicio": 1.0, "duracao": 0.5}, 10.0)
        assert False, "deveria ter levantado"
    except acoes.PlanoInvalido:
        pass


def test_som_desconhecido_e_recusado():
    try:
        acoes.valida_acao({"tipo": "som", "nome": "buzina", "inicio": 1.0},
                          10.0)
        assert False, "deveria ter levantado"
    except acoes.PlanoInvalido:
        pass


def test_audio_ganha_valores_padrao():
    a = acoes.valida_acao({"tipo": "audio", "motivo": "x"}, 10.0)
    assert a.dados["volume_original"] == 1.0
    assert a.dados["abaixar_na_fala"] is True


def test_esquema_cobre_os_tipos_novos():
    esquema = acoes.esquema_json()
    variantes = {v["properties"]["tipo"]["const"]
                 for v in esquema["properties"]["acoes"]["items"]["anyOf"]}
    assert {"velocidade", "transicao", "som", "audio"} <= variantes
    assert variantes == set(acoes.TIPOS)


def test_toda_variante_tem_tudo_obrigatorio():
    for v in acoes.esquema_json()["properties"]["acoes"]["items"]["anyOf"]:
        assert set(v["required"]) == set(v["properties"])


# ---------------------------------------- instante colado numa borda

def test_instante_no_comeco_do_corte_gruda_na_junta():
    # "um whoosh no corte" e marcado no segundo em que o corte comeca — que e
    # justamente o primeiro instante que deixou de existir
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(3.2, 4.6)])
    assert linha.converte(3.2) == 3.2


def test_instante_no_fim_do_corte_tambem_gruda():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(3.2, 4.6)])
    assert linha.converte(4.6) == 3.2


def test_instante_no_meio_do_corte_continua_sumindo():
    linha = tempo.LinhaDoTempo.de(10.0, cortes=[(3.2, 4.6)])
    assert linha.converte(3.9) is None


def test_ultimo_instante_do_video_nao_some():
    assert tempo.LinhaDoTempo.de(10.0).converte(10.0) == 10.0
