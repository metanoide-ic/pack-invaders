"""Aplica um plano de edicao. Nada aqui e decidido por modelo.

Divide o plano em duas pilhas:

  - o que da para aplicar sozinho (cortes, cor, legendas) vira um MP4 de
    previa, para voce ver se o plano ficou bom antes de abrir o CapCut;
  - o que e camada (animacoes, textos) vira arquivo + um roteiro dizendo em
    que segundo entra cada coisa.

Quando o formato de projeto do CapCut estiver mapeado, o roteiro deixa de ser
lista para conferir e passa a ser a timeline montada.
"""

from __future__ import annotations

import os
import subprocess

from . import acoes, animacoes, media

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


def _mapa_de_tempo(trechos: list):
    """Devolve uma funcao que converte tempo original -> tempo apos os cortes.

    Uma animacao marcada no segundo 12 do video original tem de continuar em
    cima da mesma fala depois que 3s foram removidos antes dela.
    """
    def converte(t: float):
        decorrido = 0.0
        for ini, fim in trechos:
            if ini <= t < fim:
                return round(decorrido + (t - ini), 3)
            decorrido += fim - ini
        return None                     # caiu dentro de um trecho cortado
    return converte


def aplica(plano: acoes.Plano, entrada: str, pasta_saida: str,
           progresso=None) -> dict:
    """Executa o plano. Devolve o que foi gerado e o roteiro de montagem."""
    def log(msg):
        if progresso:
            progresso(msg)

    os.makedirs(pasta_saida, exist_ok=True)
    info = media.sonda(entrada)
    nome = os.path.splitext(os.path.basename(entrada))[0]
    resultado = {"previa": None, "camadas": [], "roteiro": [],
                 "avisos": list(plano.avisos)}

    # ---- 1. cortes e cor: viram um MP4 de previa ------------------------
    cortes = plano.por_tipo("cortar")
    trechos = trechos_apos_cortes(info.duracao, cortes) if cortes \
        else [(0.0, info.duracao)]
    converte = _mapa_de_tempo(trechos)

    if cortes and not trechos:
        resultado["avisos"].append(
            "os cortes pedidos removeriam o video inteiro; ignorei os cortes")
        cortes = []
        trechos = [(0.0, info.duracao)]
        converte = _mapa_de_tempo(trechos)

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

    if cortes or filtro:
        saida = os.path.join(pasta_saida, f"{nome}_previa.mp4")
        log(f"aplicando {len(cortes)} corte(s)"
            + (" e tratamento de cor" if filtro else "") + "...")
        _renderiza(entrada, saida, trechos, filtro, tem_audio=info.tem_audio)
        resultado["previa"] = saida
        removido = round(info.duracao - sum(f - i for i, f in trechos), 1)
        if cortes:
            resultado["roteiro"].append(
                f"CORTES: {len(cortes)} trecho(s), {removido}s a menos")

    # ---- 2. legendas ----------------------------------------------------
    for a in plano.por_tipo("legendas_fonte"):
        d = a.dados
        detalhe = f"fonte {d['fonte']}"
        if d.get("tamanho"):
            detalhe += f", corpo {d['tamanho']}"
        if d.get("cor"):
            detalhe += f", cor {d['cor']}"
        resultado["roteiro"].append(f"LEGENDAS: {detalhe} — {a.motivo}")

    # ---- 3. animacoes: cada uma vira um arquivo ------------------------
    for i, a in enumerate(plano.por_tipo("animacao"), start=1):
        d = a.dados
        quando = converte(d["inicio"])
        if quando is None:
            resultado["avisos"].append(
                f"animacao '{d['nome']}' caiu dentro de um trecho cortado; "
                f"deixei de fora")
            continue
        arq = os.path.join(pasta_saida,
                           f"{nome}_anim{i}_{d['nome']}.mp4")
        log(f"gerando {d['nome']}...")
        try:
            animacoes.gera(d["nome"], d.get("texto", ""), arq,
                           duracao=d.get("duracao"),
                           tamanho=_tamanho_camada(info))
        except Exception as erro:
            resultado["avisos"].append(f"falhou ao gerar {d['nome']}: {erro}")
            continue
        resultado["camadas"].append(arq)
        resultado["roteiro"].append(
            f"{quando:6.2f}s  ANIMACAO {d['nome']}"
            + (f' "{d["texto"]}"' if d.get("texto") else "")
            + f" ({d['duracao']:.1f}s) — {a.motivo}\n"
            f"          arquivo: {os.path.basename(arq)} "
            f"(fundo verde: chaveie no CapCut)")

    # ---- 4. textos ------------------------------------------------------
    for a in plano.por_tipo("texto"):
        d = a.dados
        quando = converte(d["inicio"])
        if quando is None:
            resultado["avisos"].append(
                f'texto "{d["texto"]}" caiu num trecho cortado; deixei de fora')
            continue
        atras = d.get("atras_da_pessoa")
        linha = (f"{quando:6.2f}s  TEXTO \"{d['texto']}\" "
                 f"({d['duracao']:.1f}s, {d.get('posicao', 'centro')}, "
                 f"estilo {d.get('estilo', 'impacto')})")
        if atras:
            linha += ("\n          ATRAS DA PESSOA: no CapCut, duplique o "
                      "clipe, use Remover fundo na copia de cima e ponha o "
                      "texto entre as duas camadas")
            resultado["avisos"].append(
                "texto atras da pessoa ainda e passo manual no CapCut — "
                "recorte automatico nao esta pronto")
        resultado["roteiro"].append(linha + f" — {a.motivo}")

    resultado["roteiro"].sort(key=_ordem_roteiro)
    caminho_roteiro = os.path.join(pasta_saida, f"{nome}_roteiro.txt")
    _grava_roteiro(caminho_roteiro, plano, resultado)
    resultado["arquivo_roteiro"] = caminho_roteiro
    return resultado


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
        linhas += ["", f"Previa com cortes e cor: "
                       f"{os.path.basename(resultado['previa'])}"]
    if resultado["avisos"]:
        linhas += ["", "Nao consegui fazer:", ""]
        linhas += [f"  - {a}" for a in resultado["avisos"]]
    with open(caminho, "w", encoding="utf-8") as fh:
        fh.write("\n".join(linhas) + "\n")


def _renderiza(entrada: str, saida: str, trechos: list, filtro: str | None,
               tem_audio: bool = True):
    """Corta e trata cor num passe so. Aguenta video sem trilha de audio."""
    if not trechos:
        raise ValueError("nenhum trecho para renderizar")

    partes, rotulos = [], ""
    for i, (ini, fim) in enumerate(trechos):
        cadeia = f"[0:v]trim=start={ini}:end={fim},setpts=PTS-STARTPTS"
        if filtro:
            cadeia += "," + filtro
        partes.append(cadeia + f"[v{i}]")
        if tem_audio:
            partes.append(f"[0:a]atrim=start={ini}:end={fim},"
                          f"asetpts=PTS-STARTPTS[a{i}]")
            rotulos += f"[v{i}][a{i}]"
        else:
            rotulos += f"[v{i}]"

    n_saidas = ":v=1:a=1[vo][ao]" if tem_audio else ":v=1:a=0[vo]"
    grafo = ";".join(partes) + ";" + rotulos + \
        f"concat=n={len(trechos)}" + n_saidas

    cmd = [media.ffmpeg(), "-y", "-hide_banner", "-i", entrada,
           "-filter_complex", grafo, "-map", "[vo]"]
    if tem_audio:
        cmd += ["-map", "[ao]", "-c:a", "aac", "-b:a", "192k"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18", saida]

    r = subprocess.run(cmd, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
