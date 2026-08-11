"""Aplica um plano de edicao. Nada aqui e decidido por modelo.

A ordem importa e nao e arbitraria:

  1. linha do tempo (corte + velocidade + transicao) e tratamento de cor, num
     passe so — e o que define a duracao final do video;
  2. movimento de camera e efeitos, tambem num passe so;
  3. textos, inclusive os que passam ATRAS da pessoa;
  4. legendas queimadas, depois do texto de proposito: legenda tem de ficar
     por cima de tudo e nunca ser recortada junto com a pessoa;
  5. animacoes, que saem como arquivo de camada para o CapCut;
  6. audio — trilha, abaixamento na fala e efeitos sonoros — por ultimo,
     porque essa passada copia a imagem sem recomprimir.

Todo tempo que o modelo escreveu se refere ao video ORIGINAL. Quem traduz para
o video final e a `LinhaDoTempo`: sem ela um efeito marcado no segundo 12
apareceria no lugar errado depois de um corte ou de uma camera lenta.
"""

from __future__ import annotations

import os
import subprocess

from . import (acoes, animacoes, audio as mod_audio, efeitos as mod_efeitos,
               estilos, legendas, media, movimento, tempo, textos)

# preset -> (filtro ffmpeg no talo, descricao para o roteiro)
FILTROS_COR = {
    "quente_vibrante": ("eq=saturation={s}:contrast={c}:brightness={b},"
                        "colorbalance=rs=0.06:bs=-0.05",
                        "quente e saturado"),
    "cinematico_frio": ("eq=saturation={s}:contrast={c}:brightness={b},"
                        "colorbalance=rs=-0.05:bs=0.10",
                        "frio e contrastado"),
    "natural_limpo": ("eq=saturation={s}:contrast={c}:brightness={b}",
                      "corrigido sem estilizar"),
    "punch_alto_contraste": ("eq=saturation={s}:contrast={c}:brightness={b},"
                             "unsharp=5:5:0.7",
                             "contraste e nitidez altos"),
}


def _mistura(valor: float, neutro: float, intensidade: float) -> float:
    """Puxa o parametro de volta para o neutro conforme a intensidade cai."""
    return round(neutro + (valor - neutro) * max(0.0, min(1.0, intensidade)), 3)


def filtro_de_cor(preset: str, intensidade: float = 1.0) -> str:
    modelo, _ = FILTROS_COR[preset]
    alvos = {"quente_vibrante": (1.35, 1.10, 0.02),
             "cinematico_frio": (0.92, 1.22, -0.01),
             "natural_limpo": (1.06, 1.05, 0.01),
             "punch_alto_contraste": (1.28, 1.34, 0.0)}[preset]
    return modelo.format(s=_mistura(alvos[0], 1.0, intensidade),
                         c=_mistura(alvos[1], 1.0, intensidade),
                         b=_mistura(alvos[2], 0.0, intensidade))


def trechos_apos_cortes(duracao: float, cortes: list) -> list:
    """Converte 'o que remover' em 'o que manter'."""
    remover = sorted((a.dados["inicio"], a.dados["fim"]) for a in cortes)
    manter, cursor = [], 0.0
    for ini, fim in remover:
        if ini - cursor > 0.05:
            manter.append((round(cursor, 3), round(ini, 3)))
        cursor = max(cursor, fim)
    if duracao - cursor > 0.05:
        manter.append((round(cursor, 3), round(duracao, 3)))
    return manter


def linha_do_plano(plano: acoes.Plano, duracao: float):
    """Junta corte, velocidade e transicao numa linha do tempo so."""
    cortes = [(a.dados["inicio"], a.dados["fim"])
              for a in plano.por_tipo("cortar")]
    velocidades = [(a.dados["inicio"], a.dados["fim"], a.dados["fator"])
                   for a in plano.por_tipo("velocidade")]
    transicoes = [(a.dados["inicio"], a.dados["nome"], a.dados["duracao"])
                  for a in plano.por_tipo("transicao")]
    return tempo.LinhaDoTempo.de(duracao, cortes, velocidades, transicoes)


def aplica(plano: acoes.Plano, entrada: str, pasta_saida: str,
           progresso=None, falas: list | None = None,
           trilha: str | None = None) -> dict:
    """Executa o plano. Devolve o que foi gerado e o roteiro de montagem.

    `falas` e a transcricao com tempo por palavra — sem ela as legendas
    estilizadas nao tem como ser geradas. `trilha` e o arquivo de musica
    escolhido no app; sem ele as acoes de audio valem so para os sons.
    """
    falas = falas or []

    def log(msg):
        if progresso:
            progresso(msg)

    os.makedirs(pasta_saida, exist_ok=True)
    info = media.sonda(entrada)
    fps = int(round(info.fps)) or 30
    nome = os.path.splitext(os.path.basename(entrada))[0]
    resultado = {"previa": None, "camadas": [], "roteiro": [],
                 "legendas": None, "avisos": list(plano.avisos)}

    # ---- 1. linha do tempo e cor ---------------------------------------
    linha = linha_do_plano(plano, info.duracao)
    if not linha.trechos:
        resultado["avisos"].append(
            "os cortes pedidos removeriam o video inteiro; ignorei os cortes")
        linha = tempo.LinhaDoTempo.de(info.duracao)
    for quando, nome in linha.perdidas:
        resultado["avisos"].append(
            f"transicao '{nome}' em {quando:.1f}s ficou de fora: nao ha dois "
            f"trechos com folga para cruzar ali")

    acoes_cor = plano.por_tipo("cor")
    filtro = None
    if acoes_cor:
        a = acoes_cor[0]
        try:
            # 0.0 e um valor legitimo (quase neutro) — nao usar `or`
            inten = float(a.dados.get("intensidade"))
        except (TypeError, ValueError):
            inten = 1.0
        filtro = filtro_de_cor(a.dados["preset"], inten)
        resultado["roteiro"].append(
            f"COR: {FILTROS_COR[a.dados['preset']][1]} — {a.motivo}")
        if len(acoes_cor) > 1:
            resultado["avisos"].append(
                "mais de um tratamento de cor pedido; apliquei o primeiro")

    if linha.mexeu() or filtro:
        saida = os.path.join(pasta_saida, f"{nome}_previa.mp4")
        log(_conta_do_passe(plano, linha, filtro))
        _renderiza(entrada, saida, linha, filtro, tem_audio=info.tem_audio,
                   fps=fps)
        resultado["previa"] = saida
        _anota_linha(resultado, plano, linha, info.duracao)

    duracao_final = linha.duracao_saida() if linha.mexeu() else info.duracao

    # ---- 2. movimento de camera + efeitos, num passe so ----------------
    # juntos de proposito: sao os dois cadeias de -vf, e cada reencode a mais
    # custa qualidade. Os tempos passam pela linha do tempo antes.
    movs = [d for d, _ in _remarcados(plano, "movimento", linha, resultado,
                                      "MOVIMENTO")]
    efs = [d for d, _ in _remarcados(plano, "efeito", linha, resultado,
                                     "EFEITO")]

    if movs or efs:
        base = resultado["previa"] or entrada
        saida_mv = os.path.join(pasta_saida, f"{nome}_movimento.mp4")
        log(f"aplicando {len(movs)} movimento(s) e {len(efs)} efeito(s)...")
        try:
            _movimento_e_efeitos(base, saida_mv, movs, efs)
            resultado["previa"] = saida_mv
        except Exception as erro:
            resultado["avisos"].append(
                f"falhou ao aplicar movimento/efeito: {erro}")

    # ---- 3. textos, inclusive atras da pessoa ---------------------------
    pares_texto = _remarcados(plano, "texto", linha, resultado, None)
    itens_texto = [d for d, _ in pares_texto]
    for item, acao in pares_texto:
        resultado["roteiro"].append(
            f"{item['inicio']:6.2f}s  TEXTO \"{item['texto']}\" "
            f"({item['duracao']:.1f}s, {item.get('posicao', 'centro')}, "
            f"estilo {item.get('estilo', 'impacto')}"
            + (", ATRAS DA PESSOA" if item.get("atras_da_pessoa") else "")
            + f") — {acao.motivo}")

    if itens_texto:
        base = resultado["previa"] or entrada
        saida_tx = os.path.join(pasta_saida, f"{nome}_textos.mp4")
        quantos_atras = sum(1 for i in itens_texto if i.get("atras_da_pessoa"))
        log(f"queimando {len(itens_texto)} texto(s)"
            + (f", {quantos_atras} atras da pessoa (demora)"
               if quantos_atras else "") + "...")
        try:
            r = textos.aplica(base, saida_tx, itens_texto, progresso=log)
            resultado["previa"] = saida_tx
            resultado["avisos"] += r["avisos"]
        except Exception as erro:
            resultado["avisos"].append(f"falhou ao aplicar os textos: {erro}")

    # ---- 4. legendas queimadas -----------------------------------------
    # depois de tudo que mexe na imagem: a legenda entra por cima do video ja
    # na duracao final, senao ela desalinha da fala
    acoes_leg = plano.por_tipo("legendas")
    if acoes_leg:
        a = acoes_leg[0]
        if len(acoes_leg) > 1:
            resultado["avisos"].append(
                "mais de um estilo de legenda pedido; apliquei o primeiro")
        estilo = a.dados["estilo"]
        if not falas:
            resultado["avisos"].append(
                f"legenda '{estilo}' pedida mas nao ha transcricao; "
                f"instale o faster-whisper para usar")
        elif not estilos.tem_tempo_por_palavra(falas):
            resultado["avisos"].append(
                f"legenda '{estilo}' precisa do tempo de cada palavra e a "
                f"transcricao veio sem; refaca com por_palavra=True")
        else:
            base = resultado["previa"] or entrada
            info_base = media.sonda(base)
            falas_ajustadas = (legendas.remapeia(falas, linha)
                               if linha.mexeu() else falas)
            arq_ass = os.path.join(pasta_saida, f"{nome}_legendas.ass")
            posicao = a.dados.get("posicao", "padrao")
            estilos.salva_ass(falas_ajustadas, estilo, arq_ass,
                              info_base.largura, info_base.altura, posicao)
            saida_leg = os.path.join(pasta_saida, f"{nome}_legendado.mp4")
            log(f"queimando legendas '{estilo}'...")
            try:
                estilos.queima(base, arq_ass, saida_leg)
                resultado["previa"] = saida_leg
                resultado["legendas"] = arq_ass
                resultado["roteiro"].append(
                    f"LEGENDAS: estilo {estilo} ({posicao}), ja queimadas "
                    f"no video — {a.motivo}")
            except Exception as erro:
                resultado["avisos"].append(f"falhou ao queimar legendas: {erro}")

    # ---- 5. animacoes: viram arquivo E entram no video -----------------
    camadas_anim = []
    for i, a in enumerate(plano.por_tipo("animacao"), start=1):
        d = a.dados
        quando = linha.converte(d["inicio"])
        if quando is None:
            resultado["avisos"].append(
                f"animacao '{d['nome']}' caiu dentro de um trecho cortado; "
                f"deixei de fora")
            continue
        dur = linha.converte_duracao(d["inicio"], d["duracao"])
        arq = os.path.join(pasta_saida,
                           f"{nome}_anim{i}_{d['nome']}.mp4")
        log(f"gerando {d['nome']}...")
        try:
            animacoes.gera(d["nome"], d.get("texto", ""), arq,
                           duracao=dur, tamanho=_tamanho_camada(info))
        except Exception as erro:
            resultado["avisos"].append(f"falhou ao gerar {d['nome']}: {erro}")
            continue
        resultado["camadas"].append(arq)
        camadas_anim.append({"arquivo": arq, "inicio": quando,
                             "duracao": dur})
        resultado["roteiro"].append(
            f"{quando:6.2f}s  ANIMACAO {d['nome']}"
            + (f' "{d["texto"]}"' if d.get("texto") else "")
            + f" ({dur:.1f}s) — {a.motivo}\n"
            f"          arquivo: {os.path.basename(arq)} "
            f"(fundo verde, para refazer no CapCut se quiser)")

    if camadas_anim:
        base = resultado["previa"] or entrada
        saida_an = os.path.join(pasta_saida, f"{nome}_animado.mp4")
        log(f"chaveando o verde de {len(camadas_anim)} animacao(oes)...")
        try:
            _compoe_animacoes(base, saida_an, camadas_anim)
            resultado["previa"] = saida_an
        except Exception as erro:
            resultado["avisos"].append(
                f"nao consegui juntar as animacoes no video (elas continuam "
                f"como arquivo separado, para voce sobrepor no CapCut): "
                f"{erro}")

    # ---- 6. audio: trilha, abaixamento e efeitos sonoros ---------------
    _aplica_audio(plano, entrada, pasta_saida, nome, linha, duracao_final,
                  info, trilha, resultado, log)

    resultado["roteiro"].sort(key=_ordem_roteiro)
    caminho_roteiro = os.path.join(pasta_saida, f"{nome}_roteiro.txt")
    _grava_roteiro(caminho_roteiro, plano, resultado)
    resultado["arquivo_roteiro"] = caminho_roteiro
    return resultado


# --------------------------------------------------------------- pedacos


def _conta_do_passe(plano, linha, filtro) -> str:
    partes = []
    for tipo, um, muitos in (("cortar", "corte", "cortes"),
                             ("velocidade", "mudanca de velocidade",
                              "mudancas de velocidade"),
                             ("transicao", "transicao", "transicoes")):
        n = len(plano.por_tipo(tipo))
        if n:
            partes.append(f"{n} {um if n == 1 else muitos}")
    if filtro:
        partes.append("tratamento de cor")
    return "aplicando " + (", ".join(partes) or "a linha do tempo") + "..."


def _anota_linha(resultado: dict, plano, linha, duracao_original: float) -> None:
    """Escreve no roteiro o que a linha do tempo fez com a duracao.

    Os segundos aqui sao os do video FINAL, como no resto do roteiro: e por
    eles que voce vai procurar o momento no CapCut.
    """
    cortes = plano.por_tipo("cortar")
    if cortes:
        removido = round(duracao_original - linha.duracao_origem(), 1)
        resultado["roteiro"].append(
            f"CORTES: {len(cortes)} trecho(s), {removido}s a menos")
    for a in plano.por_tipo("velocidade"):
        d = a.dados
        quando = linha.converte(d["inicio"])
        if quando is None:
            continue
        como = "camera lenta" if d["fator"] < 1 else "acelerado"
        resultado["roteiro"].append(
            f"{quando:6.2f}s  VELOCIDADE {d['fator']:g}x ({como}, "
            f"{(d['fim'] - d['inicio']) / d['fator']:.1f}s na tela) — "
            f"{a.motivo}")
    for a in plano.por_tipo("transicao"):
        d = a.dados
        quando = linha.converte(d["inicio"])
        if quando is None:
            continue
        resultado["roteiro"].append(
            f"{quando:6.2f}s  TRANSICAO {d['nome']} "
            f"({d['duracao']:.1f}s) — {a.motivo}")
    if linha.duracao_saida():
        resultado["roteiro"].append(
            f"DURACAO: {duracao_original:.1f}s viraram "
            f"{linha.duracao_saida():.1f}s")


def _remarcados(plano, tipo: str, linha, resultado: dict,
                rotulo: str | None) -> list:
    """Converte os tempos das acoes de um tipo para o video final.

    Devolve pares (dados remarcados, acao original) — a acao anda junto porque
    o motivo dela ainda precisa ir para o roteiro, e uma acao descartada no
    meio desalinharia duas listas paralelas.
    """
    saida = []
    for a in plano.por_tipo(tipo):
        d = a.dados
        quando = linha.converte(d["inicio"])
        if quando is None:
            alvo = d.get("nome") or d.get("texto", "")
            resultado["avisos"].append(
                f"{tipo} '{alvo}' caiu num trecho cortado; deixei de fora")
            continue
        dados = dict(d, inicio=quando)
        if "duracao" in d:
            dados["duracao"] = linha.converte_duracao(d["inicio"], d["duracao"])
        saida.append((dados, a))
        if rotulo:
            resultado["roteiro"].append(
                f"{quando:6.2f}s  {rotulo} {d['nome']} "
                f"({dados.get('duracao', 0):.1f}s) — {a.motivo}")
    return saida


def _aplica_audio(plano, entrada, pasta_saida, nome, linha, duracao_final,
                  info, trilha, resultado, log) -> None:
    """Trilha e efeitos sonoros. So roda se houver o que fazer."""
    sons = []
    for a in plano.por_tipo("som"):
        d = a.dados
        quando = linha.converte(d["inicio"])
        if quando is None:
            resultado["avisos"].append(
                f"som '{d['nome']}' caiu num trecho cortado; deixei de fora")
            continue
        sons.append({"nome": d["nome"], "inicio": quando,
                     "volume": d.get("volume", 0.8)})
        resultado["roteiro"].append(
            f"{quando:6.2f}s  SOM {d['nome']} — {a.motivo}")

    acoes_audio = plano.por_tipo("audio")
    conf = acoes_audio[0].dados if acoes_audio else {}
    if len(acoes_audio) > 1:
        resultado["avisos"].append(
            "mais de um ajuste de audio pedido; apliquei o primeiro")

    if acoes_audio and not trilha:
        resultado["avisos"].append(
            "voce pediu trilha mas nenhuma musica foi escolhida no app; "
            "aplique os ajustes de volume mesmo assim")

    volume_original = float(conf.get("volume_original", 1.0))
    if not mod_audio.precisa(trilha, sons, volume_original):
        return

    base = resultado["previa"] or entrada
    saida = os.path.join(pasta_saida, f"{nome}_com_audio.mp4")
    log(f"montando o audio ({len(sons)} som(ns)"
        + (" + trilha" if trilha else "") + ")...")
    try:
        mod_audio.aplica(
            base, saida, duracao_final, tem_audio=info.tem_audio,
            trilha=trilha,
            volume_trilha=float(conf.get("volume_trilha",
                                         mod_audio.VOLUME_TRILHA_PADRAO)),
            abaixar_na_fala=bool(conf.get("abaixar_na_fala", True)),
            volume_original=volume_original, sons=sons)
        resultado["previa"] = saida
        if trilha:
            resultado["roteiro"].append(
                f"TRILHA: {os.path.basename(trilha)}"
                + (", abaixando sozinha na fala"
                   if conf.get("abaixar_na_fala", True) else "")
                + (f" — {acoes_audio[0].motivo}" if acoes_audio else ""))
    except Exception as erro:
        resultado["avisos"].append(f"falhou ao montar o audio: {erro}")


def _ordem_roteiro(linha: str) -> tuple:
    """Ajustes globais primeiro; depois o que tem hora, em ordem de tempo."""
    cabeca = linha.strip().split()[0]
    try:
        return (1, float(cabeca.rstrip("s")))
    except ValueError:
        return (0, 0.0)


def _tamanho_camada(info: media.InfoMidia) -> tuple:
    lado = max(360, min(info.largura or 1080, info.altura or 1080))
    return (lado, lado)


def _grava_roteiro(caminho: str, plano: acoes.Plano, resultado: dict) -> None:
    linhas = ["ROTEIRO DE MONTAGEM", "=" * 60, ""]
    if plano.resumo:
        linhas += ["O que foi entendido:", f"  {plano.resumo}", ""]
    linhas += ["Passos:", ""]
    linhas += [f"  {l}" for l in resultado["roteiro"]] or ["  (nada a fazer)"]
    if resultado["previa"]:
        linhas += ["", f"Video editado: "
                       f"{os.path.basename(resultado['previa'])}"]
    if resultado["avisos"]:
        linhas += ["", "Nao consegui fazer:", ""]
        linhas += [f"  - {a}" for a in resultado["avisos"]]
    with open(caminho, "w", encoding="utf-8") as fh:
        fh.write("\n".join(linhas) + "\n")


def _movimento_e_efeitos(entrada: str, saida: str, movs: list,
                         efs: list) -> str:
    """Uma passada de -vf com o movimento de camera e os efeitos juntos."""
    info = media.sonda(entrada)
    fps = int(round(info.fps)) or 30
    partes = []
    if movs:
        partes.append(movimento.filtro(movs, info.largura, info.altura, fps))
    if efs:
        partes.append(mod_efeitos.cadeia(efs))

    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-i", entrada,
           "-vf", ",".join(partes),
           "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p"]
    cmd += ["-c:a", "copy"] if info.tem_audio else ["-an"]
    cmd += [saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    return saida


def _compoe_animacoes(entrada: str, saida: str, camadas: list) -> str:
    """Tira o verde de cada animacao e sobrepoe no video, no segundo certo.

    O arquivo em fundo verde continua existindo: se voce quiser mexer na
    animacao no CapCut, ela esta la. Mas o video que sai daqui ja vem com ela
    dentro — senao "vídeo editado" seria mentira.
    """
    info = media.sonda(entrada)
    entradas, filtros = [], []
    atual = "[0:v]"

    for i, camada in enumerate(camadas, start=1):
        entradas += ["-i", camada["arquivo"]]
        fim = min(info.duracao, camada["inicio"] + camada["duracao"])
        # a similaridade cobre a borda suavizada das letras; o mistura evita
        # o contorno serrilhado que aparece com recorte duro
        filtros.append(
            f"[{i}:v]colorkey={animacoes.VERDE_HEX}:0.30:0.14,"
            f"format=rgba,setpts=PTS+{camada['inicio']:.3f}/TB[an{i}]")
        filtros.append(
            f"{atual}[an{i}]overlay=(W-w)/2:(H-h)/2:eof_action=pass:"
            f"repeatlast=0:enable='between(t,{camada['inicio']:.3f},"
            f"{fim:.3f})'[ca{i}]")
        atual = f"[ca{i}]"

    filtros.append(f"{atual}format=yuv420p[vo]")
    cmd = ([media.ffmpeg(), "-y", "-hide_banner", "-i", entrada] + entradas
           + ["-filter_complex", ";".join(filtros), "-map", "[vo]"])
    if info.tem_audio:
        cmd += ["-map", "0:a", "-c:a", "copy"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18", saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    return saida


def _renderiza(entrada: str, saida: str, linha, filtro: str | None,
               tem_audio: bool = True, fps: int | None = None):
    """Corta, muda velocidade, transiciona e trata cor num passe so."""
    if not getattr(linha, "trechos", None):
        raise ValueError("nenhum trecho para renderizar")

    grafo = tempo.grafo(linha, filtro_video=filtro, tem_audio=tem_audio,
                        fps=fps)
    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-i", entrada,
           "-filter_complex", grafo, "-map", "[vo]"]
    if tem_audio:
        cmd += ["-map", "[ao]", "-c:a", "aac", "-b:a", "192k"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18", saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
