# HUMANOCRACY — GDD Volume 5 — Pessoas (NPCs, recorrentes, família)

**Nunca criar NPCs. Criar pessoas.** O jogador não atende "um refugiado": atende um pai,
uma médica, um músico, uma criminosa. Mesmo quem aparece uma única vez possui uma vida
completa registrada internamente. O jogador talvez nunca descubra. **Mas o jogo sabe.**

---

## 5.1 Ficha interna de todo cidadão (Estado Verdadeiro)

```
Pessoa {
  identidade: nome, apelidos, nascimento, cidade, bairro, etnia, idioma, religião
  vida: escolaridade, profissão, empresa, estado civil, filhos, pais, irmãos, amigos
  históricos: escolar, profissional, financeiro, criminal, médico
  psicologia: empatia, coragem, ansiedade, impulsividade, religiosidade,
              ganância, altruísmo, propensão à mentira, esperança   (0–100 cada)
  opiniões: governo, Alternados, Mehrvolk, comunismo, imigração
  segredos: o que esconde e POR QUÊ (nem toda mentira é criminosa)
  verdade: humano | Alternado (com AlternadoProfile — Volume 2)
  destino: o que acontecerá com ela SE nunca cruzar com o jogador
  memória: como foi tratada pelo jogador, quanto esperou, o que perdeu
}
```

No protótipo, a fatia implementada: nome/etnia/país/profissão/motivo/nervosismo/segredo
de arquétipo (limpo, falsário desesperado, Alternado com missão), memória de encontros
scriptados via flags. Na produção, a ficha completa alimenta diálogo, bagagem e destino.

### Personalidade governa a cena, não o veredito

Dois inocentes com o mesmo problema: um reage calmo, outro entra em pânico, outro fica
agressivo, outro chora, outro emudece. **Todos inocentes.** Linguagem corporal (evitar
o olhar, olhar demais, tremer, sorrir, calma excessiva) nunca prova nada — e o jogo
distribui esses sinais igualmente entre humanos e Alternados, com vieses leves e
contraditórios entre si (Volume 9, tabelas).

## 5.2 Memória e Rede Social Invisível

- Todo NPC lembra do jogador: humilhação, ajuda, um filho perdido por sua causa.
  Alguns agradecem; alguns voltam com advogado, jornalista, faca.
- NPCs se conhecem: prender um homem faz a esposa aparecer no Dia+5, o filho depois,
  o advogado depois, um jornalista depois. **O caso cresce sozinho.**
- Quando alguém desaparece, os amigos comentam na fila. Quando alguém morre, a notícia
  circula. O mundo lembra — e espalha boatos sobre o inspetor ("ele odeia estrangeiros",
  "ele protege refugiados", "ele vende carimbos"), que alteram o comportamento de quem
  chega ao guichê.

## 5.3 O elenco recorrente do protótipo

### Elara Venn — a professora (o coração da campanha)
| Dia | Estado | Dilema |
|---|---|---|
| 2 | viaja para cuidar da mãe; papéis perfeitos | nenhum — o jogo planta o rosto |
| 9 | demitida ("perfil não serve mais"); permissão vencida há 2 dias | a lei manda rejeitar; a decência, não |
| 18 | grávida; sem carteira sanitária — o posto médico da cidade dela FECHOU | como apresentar papel de um lugar que não existe? |
| 24 | documentos falsificados (nome divergente sutil); não sorri mais | você a ensinou que a lei não a protege |
| 41 | papéis válidos; scanner biológico: INCONCLUSIVO, duas vezes | talvez Alternada. Talvez apenas destruída. O jogo sabe. Você não. |

### Outros recorrentes
- **Sgt. Radek Dmarov** (Dias 5, 6, 33): a escada da corrupção — oferta, cobrança e,
  sob o Conselho, ele mesmo do outro lado do vidro, expurgado, implorando.
- **Joss Marek, o barbeiro** (Dias 8, 15, 16): contato da resistência; troca favores por
  remédio real para seu filho; a resistência dele também mente e também explode coisas.
- **Vela Odim, jornalista** (Dia 21): pergunta a única coisa proibida: *"o senhor já teve
  certeza de alguma coisa aqui dentro?"* — detê-la ou deixá-la passar reescreve o Dia 24.
- **Sorenn Ledger** (Dia 38): mercado negro vendendo a calibração que o Estado não fornece.
- **Volkan Zubrek** (Dia 6): o primo do sargento — o primeiro suborno com nome e rosto.

### Os dois golpes de memória (horror psicológico)
- **Dia 44 — sua esposa na fila:** "Você me disse ONTEM para atravessar hoje." Você não
  disse. Você tem certeza. Tem?
- **Dia 47 — Havel Krantic:** "Nós já conversamos há duas semanas. O senhor usava uma
  caneca azul lascada na borda." Você nunca o viu. A caneca azul está na sua mesa.
  Lascada na borda.

**Nunca confirmar** se é manipulação dos Alternados, falha de memória por estresse,
propaganda — ou algo pior. A partir daqui o jogador desconfia dos documentos, dos
governos, dos cidadãos **e da própria memória**. É o momento em que o thriller político
vira horror.

## 5.4 A família

Vessa (esposa, arquivista), Tomi (filho, 8 anos) e sua mãe, Odila. Não são uma tela de
despesas: têm rotina, emprego, opiniões e cenas próprias (jantar, luto, desenhos de
escola). Sistemas:

- **Sobrevivência:** comida, aquecimento e remédio comprados de manhã; fome adoece;
  doença sem remédio por 4 dias mata. O remédio de Tomi (Dia 7+) é a alavanca que o
  barbeiro e o sargento conhecem — a corrupção chega exatamente quando dói.
- **Arco scriptado:** rebaixamento de Vessa por "critério de confiabilidade" (Dia 10),
  a mãe rasgando o formulário de ancestralidade (Dia 17), o desenho de Tomi — "papai com
  dois rostos" (Dia 20), os realocados silenciosos na metade do apartamento (Dia 31),
  a mãe que "foi só andar" e ela odeia andar (Dia 36), a pergunta do jantar (Dia 42):
  *"Pai, se trocarem você, eu vou perceber?"*
- **O maior medo:** o jogador nunca sabe se a própria família continua humana.
  **O jogo nunca responde.** (Internamente há resposta — Estado Verdadeiro — mas nenhum
  canal do jogo a exibe. Nem o relatório final.)

## 5.5 O protagonista também muda

O inspetor não é uma câmera: tem nome (que o jogador nunca digita — os outros o chamam
de "inspetor"), história, e **envelhece visivelmente**: olheiras, postura, cansaço
(produção: retrato do jogador degradando no espelho do vestiário). Saúde mental é um
sistema **sem barra e sem indicador**: insônia, pesadelos, esquecimentos e — raríssimas,
sutis — alucinações: um documento que muda enquanto você olha para outro. Erro seu?
Bug? Um Alternado? *Nunca responder.* (Ver sussurros no protótipo: frases fantasma
posicionadas aleatoriamente a partir do Dia 18.)
