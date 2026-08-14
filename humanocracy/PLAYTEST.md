# Roteiro de playtest humano — dias 30–48 e celular

Este roteiro cobre as duas lacunas que a auditoria de QA automatizado não fecha
sozinha: **como o final da campanha realmente é jogado por uma pessoa** (dias
30–48: Conselho Popular, Colapso e Autoridade Desconhecida) e **como o jogo se
comporta num aparelho de toque de verdade**. Os scripts em `tools/qa/` provam
que o jogo não quebra; este roteiro é sobre se ele **funciona bem**.

## Como abrir

Basta o arquivo `humanocracy-standalone.html` (ou `index.html` + os `.js`/`.css`
ao lado) num navegador — duplo clique, sem instalação, sem internet. Funciona
offline.

Para reportar bugs de verdade, jogue com o **console do navegador aberto**
(F12 → aba Console) e deixe aberto o tempo todo: qualquer erro vermelho que
aparecer ali é relevante mesmo que a tela pareça normal.

## Pular direto para o trecho em teste

Jogar 29 dias antes de chegar em Conselho Popular não é razoável para um
playtest focado. Em vez disso: comece um jogo normal pelo título (ISTO É
IMPORTANTE — o console só tem acesso às funções do jogo depois que ele
carrega), deixe a tela de manhã do Dia 1 aparecer, abra o console e cole **uma**
das linhas abaixo, Enter:

```js
S.day = 30; showMorning();   // Dia 30 — início do Conselho Popular ("Desespero")
S.day = 37; showMorning();   // Dia 37 — mesmo regime, vira "Apatia" (o Estado admite o defeito do scanner)
S.day = 43; showMorning();   // Dia 43 — regime muda pra Autoridade Desconhecida (Colapso)
S.day = 47; showMorning();   // Dia 47 — REJEITAR começa a sumir
```

(As fronteiras reais dos regimes estão em `regimeOfDay()`, `data.js`: República
1–11, Mehrvolk 12–29, Conselho Popular 30–42, Autoridade Desconhecida/Colapso
43–48. Os dias 30–42 são um único regime mecanicamente, mas cruzam duas fases
emocionais diferentes do GDD — por isso o corte em 37 abaixo.)

Isso é exatamente o mesmo mecanismo que os scripts de QA automatizados usam
(`tools/qa/unlocks.js`, `campaign_audit.js`) — é seguro, não corrompe o save.
O jogo continua dali normalmente: manhã → trabalho → casa → noite → manhã
seguinte, do jeito que jogaria de qualquer forma.

Se quiser testar com **família ferida/morta** ou **dinheiro apertado** (afeta
o final), dá pra ajustar antes de `showMorning()`:

```js
S.family.tomi.alive = false;        // testar o luto parcial
S.money = 5;                        // testar aperto financeiro
S.counters.bribes = 3;              // testar reputação "corrupto"
```

## O que observar — checklist por fase

### Dia 30–36 · Conselho Popular ("Desespero")
- [ ] A paleta, o cabeçalho do jornal e o tom dos comunicados mudaram de
      verdade em relação à Mehrvolk (não é só o nome do regime no rodapé)
- [ ] O aluguel/apartamento requisitado (evento da casa do dia 31) aparece e
      o efeito (`aluguel_maior`) realmente pesa no orçamento
- [ ] Regras novas do Conselho não contradizem silenciosamente regras antigas
      que ainda estejam ativas
- [ ] A cota do dia bate com o que o comunicado anuncia
- [ ] Dia 35: Sela Kroft (gravadora, selo incorreto) é a segunda chance da
      campanha de ganhar `resHelped` — aprová-la deve incrementar o contador
      e disparar o eco de notícia ("cartões extraviados"); detê-la marca
      `S.flags.resTraida`

### Dia 37–42 · ainda Conselho Popular, virando "Apatia"
- [ ] Mesmo regime visual da fase anterior — o que muda é o TOM: o Estado
      passa a admitir publicamente que o scanner era defeituoso. Isso deve
      estar palpável no jornal/comunicados, não só implícito
- [ ] Os eventos da casa (família realocada, o envelope sem remetente) chegam
      na ordem certa e não se repetem/pulam
- [ ] Nenhuma regra de fases anteriores trava uma decisão que deveria ser óbvia

### Dia 43–46 · Autoridade Desconhecida (Colapso)
- [ ] A troca de regime (Conselho → Autoridade Desconhecida) é perceptível de
      cara — paleta, cabeçalho do jornal, cota
- [ ] `regras: 1`, cota `Infinity` — confirmar que isso não quebra a UI da
      cota (deve ler como "sem cota", não como um número quebrado)
- [ ] A noite sem rosto (olho mágico vazio) continua causando o desconforto
      certo, não parece bug de sprite faltando

### Dia 47 — o botão que some
- [ ] `REJEITAR` e o carimbo REJ **desaparecem de verdade** da interface
      (não só ficam desabilitados) — se sobrar um jeito de rejeitar mesmo
      assim, é um bug de escape importante
- [ ] A regra `approveAll` está ativa e o jogo não deixa passar nenhuma
      forma alternativa de recusar alguém

### Dia 48 — O Espelho
O dia inteiro é uma cena só, em três partes — **jogue pelo menos uma vez do
jeito real**, sem atalho de console, pra confirmar que o caminho completo
funciona:

1. "IR AO TRABALHO" não leva ao guichê: leva a um corredor (a casa em 3D).
   Ande até o fim (seta pra cima / W) e interaja (E) com a porta do banheiro.
2. Isso abre uma **cutscene de ~25 segundos** (a porta, a luz que pisca, o
   espelho) com um botão **PULAR** no canto — confirme que pular funciona e
   que ela também termina sozinha se ninguém pular.
3. A cena troca pro guichê de novo: do outro lado do vidro está o seu
   próprio reflexo. **A decisão é o carimbo de sempre** — arraste o carimbo
   físico (APROVADO ou REJEITADO) até o documento na mesa, ou use as teclas
   `A`/`R`. REJEITAR está visível aqui mesmo tendo sumido no Dia 47.

Checklist:
- [ ] O corredor, a cutscene e a volta ao guichê acontecem sem erro no
      console
- [ ] O carimbo REJEITADO está visível e arrastável na cena do espelho
      (ele sumiu no Dia 47 — se continuar sumido aqui, é regressão)
- [ ] **Jogue os dois finais do espelho** (aprovar e rejeitar) em runs
      separadas — REJEITAR sempre deve cair em **O Espelho**; APROVAR deve
      variar conforme o histórico da run (ver seção de finais abaixo)
- [ ] O relatório do Estado Verdadeiro no final bate com o que a run
      realmente fez (contagem de aprovados/rejeitados/detidos, família viva)

## Os 20 finais — como direcionar uma run pra um final específico

Não é preciso ver os 20 na mesma sessão, nem andar o corredor 20 vezes — para
testar rapidamente qual final cada combinação produz, pule direto pra decisão
do espelho (pula o corredor e a cutscene, vai direto pro guichê com o
reflexo):

```js
// exemplo: forçar o final "A Mira Certa" (caçador limpo)
S.counters.alternadosCaught = 8; S.counters.innocentsDetained = 0;
S.day = 48; showScreen('screen-shift'); presentMirror();
// no guichê: arraste o carimbo até o documento, ou tecle A (aprovar) / R (rejeitar)
```

(Isso é o mesmo atalho que a suíte de QA usa para testar os 20 finais
programaticamente — sem ele, teria que repetir a cutscene do corredor a cada
combinação, o que não é razoável.)

| Quer ver… | Ajuste antes do Dia 48 |
|---|---|
| O Espelho | REJEITAR no espelho, sempre — não precisa de ajuste |
| O Carimbo Conhecido | APROVAR sem nenhum extremo abaixo |
| O Carimbo Não Hesitou | `innocentsDetained >= 3`, aprovar |
| O Preço do Próprio Carimbo | `bribes >= 2`, aprovar |
| O Portão de Ferro | `rejected > approved` e `rejected >= 8`, aprovar |
| A Mão Que Não Tremeu do Jeito Errado | `resHelped >= 1`, `innocentsDetained = 0`, aprovar |
| A Máquina Perfeita | `wrong = 0`, `correct >= 35`, aprovar |
| A Mesa Com Um Lugar a Menos | 1–3 (não os 4) membros da família mortos |
| O Corredor Vazio | `S.flags.denunciouVizinho = true` (evento noturno "Mencionar o 7") |
| O Envelope Virou Rotina | `bribes >= 6` |
| A Pontaria Errada | `alternadosBlocked = 0`, `alternadosIn >= 3`, `innocentsDetained >= 3` |
| A Mira Certa | `alternadosCaught >= 8`, `innocentsDetained = 0` |
| A Rota do Barbeiro | `resHelped >= 1` + contato da resistência + `citTotal < 12` (dois jeitos de ganhar `resHelped`: o dia 9, Nadia Baruk, ou o dia 35, a gravadora Sela Kroft) |
| A Cidade Silenciosa | `alternadosIn >= 6` |
| A Medalha | `citTotal <= 4`, `bribes = 0` |
| A Casa Vazia | os 4 da família mortos |
| O Formulário 77-B | prisão (auditoria/citações altas) |
| O Que Olha de Volta, A Conta Fechada, O Guichê Ficou Aberto | falha nos eventos O Silente / O Contador / ameaça armada — jogados normalmente, não forçados |

Depois de qualquer final, a tela **CONQUISTAS** (menu de pausa) mostra quais
das 17 já foram vistas nesse navegador — útil pra saber o que ainda falta
tentar sem ter que lembrar de cabeça.

## Checklist de celular / toque

Teste num aparelho de verdade (não só o modo de emulação do navegador, que
não pega tudo). iOS e Android, se possível.

- [ ] A interface cabe na tela sem cortar botões nem exigir zoom manual
- [ ] **Guichê:** os dois toques do MODO INSPEÇÃO registram normalmente
      (tocar em dois campos deve comparar, igual ao clique no desktop)
- [ ] **Casa 3D — controles de toque:** o D-pad (`◀ ▲ ▼ ▶`) e o botão `E`
      no canto respondem sem atraso perceptível
- [ ] **Casa 3D — olhar ao redor:** arrastar o dedo na tela olha ao redor
      suavemente (esse é um sistema de toque separado do "clique para travar
      o mouse" do desktop — **não deve exigir tentar travar o ponteiro**)
- [ ] Abrir o teclado virtual (se algum campo pedir digitação) não empurra a
      interface pra fora da tela nem trava o jogo
- [ ] Girar o aparelho (retrato ↔ paisagem) não quebra o layout nem perde o
      estado da run
- [ ] Nenhum elemento preso "hover" (efeitos de `:hover` do desktop que ficam
      visualmente acesos depois de um toque, sem motivo)

## Como reportar um problema

Pra cada bug encontrado, anote:

1. **Dia e tela** (ex.: "Dia 43, tela do turno, cidadão nº 3")
2. **O que você fez** — passo a passo, o mais específico possível
3. **O que esperava** vs. **o que aconteceu**
4. **Qualquer linha vermelha no console** (F12) — copie o texto inteiro
5. Print de tela, se der

Sem os passos 2–3 um bug relatado é quase impossível de reproduzir depois.
