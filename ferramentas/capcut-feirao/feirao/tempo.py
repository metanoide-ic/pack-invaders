"""A linha do tempo: corte, velocidade e transicao num modelo so.

Ate agora so existia corte, e a conversao "tempo original -> tempo final" era
uma subtracao simples. Velocidade quebra isso: um trecho em camera lenta ocupa
MAIS tempo na saida do que ocupava na entrada, e tudo que vem depois anda para
frente em vez de para tras. Transicao quebra de novo, porque sobrepoe o fim de
um trecho com o comeco do seguinte e encurta o total.

Entao os tres viram a mesma coisa — uma lista de trechos, cada um com o seu
fator de velocidade e a transicao pela qual ele entra — e existe um lugar unico
que sabe converter tempos. Todo efeito, animacao e legenda passa por aqui.
"""

from __future__ import annotations

from dataclasses import dataclass

from . import transicoes as _tr

VELOCIDADE_MIN = 0.25         # 4x mais lento
VELOCIDADE_MAX = 4.0          # 4x mais rapido

# a que distancia uma transicao pedida ainda "gruda" numa junta que ja existe
TOLERANCIA_JUNTA = 0.4

# quanto um instante pedido dentro de um corte pode andar para achar o trecho
# vivo mais proximo, em vez de simplesmente sumir
TOLERANCIA_BORDA = 0.08


@dataclass
class Trecho:
    inicio: float             # no video original
    fim: float
    fator: float = 1.0        # 2.0 = duas vezes mais rapido
    transicao: str = ""       # transicao POR ONDE ESTE trecho entra
    transicao_dur: float = 0.0

    @property
    def duracao_origem(self) -> float:
        return max(0.0, self.fim - self.inicio)

    @property
    def duracao_saida(self) -> float:
        return self.duracao_origem / self.fator


class LinhaDoTempo:
    """Sabe o que sobrou do video e onde cada instante foi parar."""

    def __init__(self, trechos: list, perdidas: list | None = None):
        self.trechos = [t for t in trechos if t.duracao_origem > 0.01]
        # transicoes que nao acharam junta nenhuma — o executor vira aviso
        self.perdidas = list(perdidas or [])
        if self.trechos:
            # o primeiro trecho nao entra por transicao nenhuma: nao ha nada
            # antes dele para sobrepor
            self.trechos[0].transicao = ""
            self.trechos[0].transicao_dur = 0.0
        self._ajusta_sobreposicoes()

    def _ajusta_sobreposicoes(self) -> None:
        """Nenhuma transicao pode comer mais do que os trechos tem para dar."""
        for i, tr in enumerate(self.trechos):
            if not tr.transicao or tr.transicao_dur <= 0:
                tr.transicao, tr.transicao_dur = "", 0.0
                continue
            teto = 0.9 * min(self.trechos[i - 1].duracao_saida,
                             tr.duracao_saida)
            tr.transicao_dur = round(min(tr.transicao_dur, teto), 3)
            if tr.transicao_dur < _tr.DURACAO_MIN:
                # os dois trechos vizinhos sao curtos demais para se cruzar
                self.perdidas.append((tr.inicio, tr.transicao))
                tr.transicao, tr.transicao_dur = "", 0.0

    # ------------------------------------------------------- construcao

    @classmethod
    def de(cls, duracao: float, cortes: list = (), velocidades: list = (),
           transicoes: list = ()) -> "LinhaDoTempo":
        """Monta a linha a partir de cortes, velocidades e transicoes.

        `cortes` sao pares (inicio, fim) a remover.
        `velocidades` sao triplas (inicio, fim, fator).
        `transicoes` sao triplas (instante, nome, duracao).
        """
        cortes = [(float(a), float(b)) for a, b in cortes]

        # 1. o que sobra depois dos cortes
        restos, cursor = [], 0.0
        for ini, fim in sorted(cortes):
            if ini - cursor > 0.05:
                restos.append((cursor, min(ini, duracao)))
            cursor = max(cursor, fim)
        if duracao - cursor > 0.05:
            restos.append((cursor, duracao))
        if not cortes:
            restos = [(0.0, duracao)]

        # 2. marcos: onde a linha precisa ser fatiada
        marcos = set()
        for ini, fim, _ in velocidades:
            marcos.update((float(ini), float(fim)))

        # uma transicao longe de qualquer junta existente abre uma junta nova:
        # o clipe e partido ali e as duas metades se cruzam, que e exatamente o
        # que o CapCut faz ao soltar uma transicao no meio de um clipe
        bordas = {0.0, duracao}
        for a, b in cortes:
            bordas.update((a, b))
        for t, _nome, _d in transicoes:
            t = float(t)
            if min(abs(t - b) for b in bordas) > TOLERANCIA_JUNTA:
                marcos.add(t)

        trechos = []
        for r_ini, r_fim in restos:
            pontos = sorted({r_ini, r_fim} |
                            {m for m in marcos if r_ini < m < r_fim})
            for a, b in zip(pontos, pontos[1:]):
                trechos.append(Trecho(round(a, 4), round(b, 4),
                                      cls._fator_em(a, velocidades)))

        perdidas = cls._encaixa_transicoes(trechos, transicoes)
        return cls(trechos, perdidas)

    @staticmethod
    def _fator_em(t: float, velocidades: list) -> float:
        """A ultima velocidade declarada vence, se houver sobreposicao."""
        fator = 1.0
        for ini, fim, f in velocidades:
            if float(ini) <= t < float(fim):
                fator = max(VELOCIDADE_MIN, min(VELOCIDADE_MAX, float(f)))
        return fator

    @staticmethod
    def _encaixa_transicoes(trechos: list, transicoes: list) -> list:
        """Cada transicao pedida vai para a junta mais proxima que existe.

        Devolve as que nao couberam em lugar nenhum — tipicamente pedidas
        colada no comeco ou no fim do video, onde nao ha um segundo trecho
        para cruzar.
        """
        perdidas = []
        for t, nome, dur in transicoes:
            t = float(t)
            melhor, dist = None, TOLERANCIA_JUNTA
            for i in range(1, len(trechos)):
                # a junta tem dois lados: o fim do anterior e o inicio deste,
                # e um corte no meio faz os dois numeros serem diferentes
                d = min(abs(t - trechos[i].inicio), abs(t - trechos[i - 1].fim))
                if d <= dist:
                    melhor, dist = i, d
            if melhor is None:
                perdidas.append((t, nome))
                continue
            trechos[melhor].transicao = nome
            trechos[melhor].transicao_dur = _tr.limita(dur)
        return perdidas

    # ---------------------------------------------------------- consulta

    def inicio_saida(self, indice: int) -> float:
        """Em que segundo do video final o trecho `indice` comeca."""
        pos = 0.0
        for i, tr in enumerate(self.trechos):
            if i == indice:
                return round(pos, 3)
            pos += tr.duracao_saida
            prox = self.trechos[i + 1] if i + 1 < len(self.trechos) else None
            if prox is not None:
                pos -= prox.transicao_dur
        return round(pos, 3)

    def duracao_saida(self) -> float:
        if not self.trechos:
            return 0.0
        total = sum(t.duracao_saida for t in self.trechos)
        total -= sum(t.transicao_dur for t in self.trechos)
        return round(max(0.0, total), 3)

    def duracao_origem(self) -> float:
        return round(sum(t.duracao_origem for t in self.trechos), 3)

    def converte(self, t: float):
        """Instante do video original -> instante no video final.

        Devolve None se aquele instante foi cortado fora.

        Um pedido marcado EXATAMENTE no segundo em que o corte comeca (que e o
        jeito natural de dizer "um whoosh no corte") cairia no vazio, porque
        aquele instante e o primeiro que deixou de existir. Entao um valor
        colado numa borda gruda nela em vez de sumir.
        """
        for i, tr in enumerate(self.trechos):
            if tr.inicio <= t < tr.fim:
                return round(self.inicio_saida(i) + (t - tr.inicio) / tr.fator,
                             3)

        melhor, dist = None, TOLERANCIA_BORDA
        for i, tr in enumerate(self.trechos):
            for borda, saida in ((tr.inicio, 0.0), (tr.fim, tr.duracao_saida)):
                if abs(t - borda) <= dist:
                    melhor = round(self.inicio_saida(i) + saida, 3)
                    dist = abs(t - borda)
        return melhor

    def escala_em(self, t: float) -> float:
        """Quanto uma duracao naquele ponto estica ou encolhe."""
        for tr in self.trechos:
            if tr.inicio <= t < tr.fim:
                return tr.fator
        return 1.0

    def converte_duracao(self, inicio: float, duracao: float) -> float:
        """Duracao no original -> duracao no final, respeitando a velocidade.

        Um efeito de 1s dentro de um trecho em camera lenta dura 2s na saida.
        """
        return round(max(0.05, duracao / self.escala_em(inicio)), 3)

    def mexeu(self) -> bool:
        """True se corte, velocidade ou transicao alteram alguma coisa."""
        if len(self.trechos) != 1:
            return bool(self.trechos)
        unico = self.trechos[0]
        return unico.fator != 1.0 or unico.inicio > 0.01

    def tem_velocidade(self) -> bool:
        return any(t.fator != 1.0 for t in self.trechos)

    def tem_transicao(self) -> bool:
        return any(t.transicao and t.transicao_dur > 0 for t in self.trechos)

    def pares_de_corte(self) -> list:
        """Os trechos como pares (inicio, fim), para quem so entende corte."""
        return [(t.inicio, t.fim) for t in self.trechos]

    def grupos(self) -> list:
        """Indices agrupados: cada grupo emenda seco, entre grupos ha xfade."""
        grupos, atual = [], []
        for i, tr in enumerate(self.trechos):
            if atual and tr.transicao and tr.transicao_dur > 0:
                grupos.append(atual)
                atual = []
            atual.append(i)
        if atual:
            grupos.append(atual)
        return grupos


# ---------------------------------------------------- filtros do ffmpeg


def _atempo(fator: float) -> str:
    """atempo so aceita 0.5 a 2.0 por instancia — fora disso, encadeia."""
    partes, restante = [], float(fator)
    while restante > 2.0:
        partes.append("atempo=2.0")
        restante /= 2.0
    while restante < 0.5:
        partes.append("atempo=0.5")
        restante /= 0.5
    partes.append(f"atempo={restante:.4f}")
    return ",".join(partes)


def _normaliza(fps: int | None) -> tuple:
    """Deixa todo fluxo com os mesmos parametros.

    O concat e principalmente o xfade recusam entradas com base de tempo,
    proporcao de pixel ou formato de amostra diferentes — e trim + atempo
    produzem exatamente essa diferenca. Padronizar aqui e o que faz o grafo
    inteiro montar.
    """
    v = "format=yuv420p,setsar=1"
    if fps:
        # camera lenta sem isto so estica os carimbos de tempo e o player
        # entrega um video travado; aqui os quadros sao realmente criados
        v += f",fps={fps}"
    return (v + ",settb=AVTB",
            "aformat=sample_fmts=fltp:sample_rates=44100:"
            "channel_layouts=stereo,asettb=AVTB")


def grafo(linha: LinhaDoTempo, filtro_video: str | None = None,
          tem_audio: bool = True, fps: int | None = None) -> str:
    """filter_complex que corta, muda velocidade, emenda e transiciona."""
    if not linha.trechos:
        raise ValueError("linha do tempo vazia")

    norm_v, norm_a = _normaliza(fps)
    partes = []
    for i, tr in enumerate(linha.trechos):
        v = f"[0:v]trim=start={tr.inicio}:end={tr.fim},setpts=PTS-STARTPTS"
        if tr.fator != 1.0:
            v += f",setpts=PTS/{tr.fator:.6f}"
        if filtro_video:
            v += "," + filtro_video
        partes.append(v + "," + norm_v + f"[v{i}]")

        if tem_audio:
            a = (f"[0:a]atrim=start={tr.inicio}:end={tr.fim},"
                 f"asetpts=PTS-STARTPTS")
            if tr.fator != 1.0:
                a += "," + _atempo(tr.fator)
            partes.append(a + "," + norm_a + f"[a{i}]")

    # dentro do grupo e emenda seca; entre grupos entra a transicao
    grupos = linha.grupos()
    rot_v, rot_a = [], []
    for g, indices in enumerate(grupos):
        if len(indices) == 1:
            rot_v.append(f"[v{indices[0]}]")
            rot_a.append(f"[a{indices[0]}]")
            continue
        entradas = "".join(f"[v{i}][a{i}]" if tem_audio else f"[v{i}]"
                           for i in indices)
        if tem_audio:
            partes.append(f"{entradas}concat=n={len(indices)}:v=1:a=1"
                          f"[cv{g}][ca{g}]")
            # o concat devolve base de tempo propria; renormalizar antes do
            # xfade evita o "Failed to configure output pad"
            partes.append(f"[ca{g}]{norm_a}[ga{g}]")
            rot_a.append(f"[ga{g}]")
        else:
            partes.append(f"{entradas}concat=n={len(indices)}:v=1:a=0[cv{g}]")
        partes.append(f"[cv{g}]{norm_v}[gv{g}]")
        rot_v.append(f"[gv{g}]")

    atual_v, atual_a = rot_v[0], rot_a[0] if tem_audio else ""
    for g in range(1, len(grupos)):
        tr = linha.trechos[grupos[g][0]]
        nome = _tr.xfade(tr.transicao) or "fade"
        # o xfade comeca exatamente onde o proximo trecho entra na saida
        offset = linha.inicio_saida(grupos[g][0])
        partes.append(f"{atual_v}{rot_v[g]}xfade=transition={nome}"
                      f":duration={tr.transicao_dur}:offset={offset}[xv{g}]")
        atual_v = f"[xv{g}]"
        if tem_audio:
            # acrossfade ja cruza o fim de um com o comeco do outro; nao
            # precisa de offset, e por isso bate com a conta do video
            partes.append(f"{atual_a}{rot_a[g]}"
                          f"acrossfade=d={tr.transicao_dur}:c1=tri:c2=tri"
                          f"[xa{g}]")
            atual_a = f"[xa{g}]"

    partes.append(f"{atual_v}null[vo]")
    if tem_audio:
        partes.append(f"{atual_a}anull[ao]")
    return ";".join(partes)
