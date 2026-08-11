"""Testes de keyframes, efeitos, curadoria de pasta e video so-texto."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from feirao import (acoes, curadoria, efeitos, montagem,  # noqa: E402
                    movimento)


def _plano(brutas, duracao=30.0):
    return acoes.valida_plano({"resumo": "t", "acoes": brutas}, duracao)


# ------------------------------------------------------------ movimento

def test_vocabulario_de_movimento_bate_com_o_implementado():
    assert set(acoes.MOVIMENTOS) == set(movimento.MOVIMENTOS)


def test_sem_movimento_a_expressao_e_neutra():
    z, x, y = movimento.expressoes([], 30)
    assert z == "1" and "iw/2" in x and "ih/2" in y


def test_zoom_in_cresce_e_zoom_out_diminui():
    zi = movimento.expressoes(
        [{"nome": "zoom_in", "inicio": 0, "duracao": 2, "intensidade": 1}], 30)[0]
    zo = movimento.expressoes(
        [{"nome": "zoom_out", "inicio": 0, "duracao": 2, "intensidade": 1}], 30)[0]
    assert zi.startswith("if(") and "1+0.2800" in zi
    assert "1.2800-" in zo


def test_pan_usa_zoom_de_folga():
    """Sem zoom extra o pan mostraria borda preta."""
    z = movimento.expressoes(
        [{"nome": "pan_direita", "inicio": 0, "duracao": 2,
          "intensidade": 1}], 30)[0]
    assert str(movimento._ZOOM_BASE_PAN) in z


def test_pan_horizontal_mexe_no_x_e_nao_no_y():
    _, x, y = movimento.expressoes(
        [{"nome": "pan_direita", "inicio": 0, "duracao": 2,
          "intensidade": 1}], 30)
    assert "if(" in x and "if(" not in y


def test_pan_vertical_mexe_no_y_e_nao_no_x():
    _, x, y = movimento.expressoes(
        [{"nome": "pan_cima", "inicio": 0, "duracao": 2,
          "intensidade": 1}], 30)
    assert "if(" in y and "if(" not in x


def test_progresso_fica_preso_entre_zero_e_um():
    """Fora do trecho a formula passa de 1; sem trava o zoom exploderia."""
    z = movimento.expressoes(
        [{"nome": "zoom_in", "inicio": 1, "duracao": 1,
          "intensidade": 1}], 30)[0]
    assert "max(0" in z and "min(1" in z


def test_movimentos_empilham_sem_se_apagar():
    z = movimento.expressoes([
        {"nome": "zoom_in", "inicio": 0, "duracao": 1, "intensidade": 1},
        {"nome": "tremor", "inicio": 2, "duracao": 1, "intensidade": 1},
    ], 30)[0]
    assert z.count("if(") == 2


def test_intensidade_maior_move_mais():
    fraco = movimento.expressoes(
        [{"nome": "zoom_in", "inicio": 0, "duracao": 2,
          "intensidade": 0.3}], 30)[0]
    forte = movimento.expressoes(
        [{"nome": "zoom_in", "inicio": 0, "duracao": 2,
          "intensidade": 1.5}], 30)[0]
    assert fraco != forte


def test_filtro_pre_escala_a_fonte():
    """Sem ampliar antes, o zoom amolece a imagem."""
    f = movimento.filtro(
        [{"nome": "zoom_in", "inicio": 0, "duracao": 1, "intensidade": 1}],
        1080, 1920, 30)
    assert f.startswith("scale=2160:3840") and "zoompan" in f


def test_movimento_invalido_e_ignorado_na_expressao():
    z, _, _ = movimento.expressoes(
        [{"nome": "teletransporte", "inicio": 0, "duracao": 1}], 30)
    assert z == "1"


def test_movimento_invalido_e_descartado_no_plano():
    p = _plano([{"tipo": "movimento", "nome": "teletransporte", "inicio": 1,
                 "duracao": 1, "intensidade": 1, "motivo": "x"}])
    assert p.acoes == [] and "teletransporte" in p.avisos[0]


def test_movimento_depois_do_fim_e_descartado():
    p = _plano([{"tipo": "movimento", "nome": "zoom_in", "inicio": 99,
                 "duracao": 1, "intensidade": 1, "motivo": "x"}], duracao=10.0)
    assert p.acoes == []


def test_aplicar_sem_movimento_levanta():
    try:
        movimento.aplica("a.mp4", "b.mp4", [])
        assert False, "deveria ter levantado"
    except ValueError:
        pass


# -------------------------------------------------------------- efeitos

def test_vocabulario_de_efeitos_bate_com_o_implementado():
    assert set(acoes.EFEITOS) == set(efeitos.EFEITOS)


def test_todo_efeito_tem_recorte_no_tempo():
    """Sem `enable` o efeito valeria para o video inteiro."""
    for nome in efeitos.EFEITOS:
        f = efeitos.filtro_de(nome, 1.0, 0.5, 1.0)
        assert "enable='between(t," in f, nome


def test_cadeia_junta_todos_com_virgula():
    c = efeitos.cadeia([
        {"nome": "flash", "inicio": 0, "duracao": 0.2, "intensidade": 1},
        {"nome": "vinheta", "inicio": 1, "duracao": 1, "intensidade": 1}])
    assert c.count("enable=") == 2 and "," in c


def test_efeito_desconhecido_levanta():
    try:
        efeitos.filtro_de("raio_laser", 0, 1, 1)
        assert False, "deveria ter levantado"
    except KeyError:
        pass


def test_efeito_desconhecido_e_descartado_no_plano():
    p = _plano([{"tipo": "efeito", "nome": "raio_laser", "inicio": 1,
                 "duracao": 1, "intensidade": 1, "motivo": "x"}])
    assert p.acoes == [] and "raio_laser" in p.avisos[0]


def test_duracao_zero_vira_janela_minima():
    """Janela de duracao zero nao renderiza efeito nenhum."""
    f = efeitos.filtro_de("flash", 2.0, 0.0, 1.0)
    ini, fim = f.split("between(t,")[1].split(")")[0].split(",")
    assert float(fim) > float(ini)


def test_intensidade_e_limitada():
    baixo = efeitos.filtro_de("flash", 0, 1, -5)
    alto = efeitos.filtro_de("flash", 0, 1, 99)
    assert "brightness=" in baixo and "brightness=0.750" in alto


def test_estrobo_recalcula_por_quadro():
    """Sem eval=frame a expressao e avaliada uma vez e nao pisca."""
    assert "eval=frame" in efeitos.filtro_de("estrobo", 0, 1, 1)


def test_aplicar_sem_efeito_levanta():
    try:
        efeitos.aplica("a.mp4", "b.mp4", [])
        assert False, "deveria ter levantado"
    except ValueError:
        pass


# ------------------------------------------------------------ curadoria

def _pasta_de_teste(tmp_path):
    from PIL import Image, ImageDraw, ImageFilter
    import random
    rnd = random.Random(3)

    def faz(nome, w, h, cor, mod=None):
        im = Image.new("RGB", (w, h), cor)
        d = ImageDraw.Draw(im)
        for _ in range(200):
            x, y = rnd.randrange(w), rnd.randrange(h)
            d.ellipse([x, y, x + 60, y + 60],
                      fill=tuple(min(255, c + rnd.randrange(-40, 60))
                                 for c in cor))
        if mod == "borrada":
            im = im.filter(ImageFilter.GaussianBlur(9))
        if mod == "escura":
            im = Image.eval(im, lambda v: int(v * 0.07))
        im.save(tmp_path / nome, quality=88)

    faz("boa.jpg", 1600, 1200, (120, 60, 50))
    faz("borrada.jpg", 1600, 1200, (100, 100, 100), "borrada")
    faz("escura.jpg", 1600, 1200, (90, 70, 60), "escura")
    faz("pequena.jpg", 320, 240, (70, 80, 90))
    (tmp_path / "leiame.txt").write_text("nao sou foto")
    return str(tmp_path)


def test_lista_pasta_ignora_o_que_nao_e_imagem(tmp_path):
    pasta = _pasta_de_teste(tmp_path)
    achadas = curadoria.lista_pasta(pasta)
    assert len(achadas) == 4
    assert all(not a.endswith(".txt") for a in achadas)


def test_pasta_inexistente_levanta():
    try:
        curadoria.lista_pasta("/nao/existe")
        assert False, "deveria ter levantado"
    except NotADirectoryError:
        pass


def test_triagem_recusa_so_o_inequivoco(tmp_path):
    pasta = _pasta_de_teste(tmp_path)
    ok, ruins = curadoria.triagem(curadoria.lista_pasta(pasta))
    motivos = " ".join(r["motivo"] for r in ruins)
    assert "escura" in motivos and "baixa" in motivos
    nomes_ok = {os.path.basename(m["arquivo"]) for m in ok}
    assert "boa.jpg" in nomes_ok


def test_triagem_nao_recusa_por_desfoque(tmp_path):
    """Foto nitida de pouco detalhe marca quase igual a uma borrada; a
    triagem local nao tem como separar as duas, entao nao tenta."""
    pasta = _pasta_de_teste(tmp_path)
    ok, ruins = curadoria.triagem(curadoria.lista_pasta(pasta))
    assert "borrada.jpg" in {os.path.basename(m["arquivo"]) for m in ok}
    # a mensagem de resolucao baixa tambem contem a palavra "borrada";
    # o que nao pode existir e recusa pela METRICA de nitidez
    assert all("nitidez" not in r["motivo"] for r in ruins)


def test_nenhuma_foto_se_perde_na_triagem(tmp_path):
    pasta = _pasta_de_teste(tmp_path)
    fotos = curadoria.lista_pasta(pasta)
    ok, ruins = curadoria.triagem(fotos)
    assert len(ok) + len(ruins) == len(fotos)


def test_esquema_da_curadoria_e_estrito():
    def caminha(no):
        if isinstance(no, dict):
            if no.get("type") == "object":
                assert no.get("additionalProperties") is False
                assert set(no["properties"]) == set(no["required"])
            for v in no.values():
                caminha(v)
        elif isinstance(no, list):
            for v in no:
                caminha(v)
    caminha(curadoria.esquema())


def test_indice_inventado_pelo_modelo_e_ignorado():
    aprovadas = [{"arquivo": "a.jpg"}, {"arquivo": "b.jpg"}]
    r = curadoria._resolve(
        {"resumo": "", "escolhidas": [{"indice": 99, "motivo": "x",
                                       "destaque": False}],
         "recusadas": []}, aprovadas, [])
    assert r["escolhidas"] == []


def test_indice_repetido_entra_uma_vez_so():
    aprovadas = [{"arquivo": "a.jpg"}, {"arquivo": "b.jpg"}]
    r = curadoria._resolve(
        {"resumo": "", "escolhidas": [
            {"indice": 0, "motivo": "x", "destaque": True},
            {"indice": 0, "motivo": "de novo", "destaque": False}],
         "recusadas": []}, aprovadas, [])
    assert len(r["escolhidas"]) == 1


def test_foto_esquecida_pelo_modelo_vira_recusa_explicita():
    """Nenhuma foto pode sumir sem o usuario saber por que."""
    aprovadas = [{"arquivo": "a.jpg"}, {"arquivo": "b.jpg"}]
    r = curadoria._resolve(
        {"resumo": "", "escolhidas": [{"indice": 0, "motivo": "boa",
                                       "destaque": True}],
         "recusadas": []}, aprovadas, [])
    assert len(r["escolhidas"]) + len(r["recusadas"]) == 2
    assert "sem motivo" in r["recusadas"][0]["motivo"]


def test_triagem_local_e_curadoria_nao_se_atropelam():
    aprovadas = [{"arquivo": "a.jpg"}]
    locais = [{"arquivo": "z.jpg", "motivo": "escura"}]
    r = curadoria._resolve(
        {"resumo": "", "escolhidas": [{"indice": 0, "motivo": "boa",
                                       "destaque": True}],
         "recusadas": []}, aprovadas, locais)
    assert len(r["recusadas"]) == 1 and r["recusadas"][0]["arquivo"] == "z.jpg"


# ------------------------------------------------------- video so-texto

def test_cena_de_texto_tem_o_tamanho_pedido():
    img = montagem.cena_de_texto("OFERTA", "hoje", "escuro", 1080, 1920)
    assert img.size == (1080, 1920)


def test_fundo_desconhecido_cai_no_padrao():
    a = montagem.fundo_liso("arco_iris", 200, 300)
    b = montagem.fundo_liso("escuro", 200, 300)
    assert list(a.getdata())[:5] == list(b.getdata())[:5]


def test_video_so_texto_sem_cena_levanta():
    try:
        montagem.monta_so_texto([], "/tmp/x.mp4")
        assert False, "deveria ter levantado"
    except ValueError:
        pass


def test_palavra_longa_nao_vaza_do_cartao():
    """A quebra nunca parte uma palavra; sem encolher, ela sai da tela."""
    from PIL import ImageStat
    for titulo in ("FINANCIAMENTO SEM ENTRADA", "SUPERCALIFRAGILISTICO" * 2):
        img = montagem.cartao(titulo, "sub", 1080, 1920)
        esq = ImageStat.Stat(img.crop((0, 0, 20, 1920))).stddev[0]
        dir_ = ImageStat.Stat(img.crop((1060, 0, 1080, 1920))).stddev[0]
        assert max(esq, dir_) < 18, titulo
