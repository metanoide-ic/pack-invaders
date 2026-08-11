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

## 5.3b Os rostos que voltam — o elenco especial (implementado)

Um posto de fronteira não é um desfile de estranhos: é uma **estrada**, e quem
vive de estrada passa de novo. Seis personagens têm **aparência própria** (o
campo `look` sobrescreve o retrato procedural, com semente fixa: o mesmo rosto
volta idêntico), **dias marcados** e um arco que só se lê ao longo dos quatro
regimes. Eles ocupam uma **faixa paralela** à dos `ENCOUNTERS` — um dia pode
ter os dois — e são o principal instrumento da tese do jogo: *o mesmo rosto sob
quatro governos mostra o que cada governo faz com um rosto.*

| Quem | Dias | Sinal visual | Arco |
|---|---|---|---|
| **Nadja Vell**, a mulher da estrada | 12 · 21 · 29 · 37 · 44 | delineador pesado (`kohl`), batom, ruiva, brinco, casaco vinho | trabalha as duas margens; a Lei de Higiene Moral a criminaliza; no d37 a delegacia rapou seu cabelo "por higiene"; no d44 não tem mais papel nenhum e sabe o que há atrás dela |
| **Anselmo "Ferro" Krast**, o que fala verdade | 16 · 23 · 31 · 38 · 46 | suor na testa, olheiras, feridas de quem se coça, magro | cabo da Guerra dos Doze Dias, viciado no éter que o próprio exército distribuía. **Cada delírio dele é uma verdade do jogo dita antes da hora** — o não-piscar, a mão sem temperatura, o atentado da estação. Ninguém anota. No d46 está sóbrio, e é pior |
| **Padre Emil Ostrov**, o homem sem prédio | 20 · 28 · 40 | colarinho clerical branco, cabelo branco, óculos, casaco preto | a igreja fecha em três etapas — o sino, o telhado, o nome. No fim ele carrega os livros de batismo, porque são nomes com data e alguém vai precisar |
| **Sibila Marek**, a voz proibida | 25 · 33 · 42 | chapéu, batom, casaco roxo; depois nada disso | irmã do barbeiro Joss Marek. Três canções entram numa lista; o cartório sugere que ela troque uma letra do nome e ela aceita, porque uma letra pela vida inteira é barato |
| **Aurel Vantz**, o censor | 17 · 26 · 35 · 43 | uniforme do Ministério, óculos redondos, impecável | o único da fila que já **leu tudo o que você escreveu**. Educado, exato, e ele cita a sua média de segundos por decisão. No d43 atravessa com a permissão vencida — que ele mesmo redigiu |
| **Ruven Sath, O Contador** | *convocado* | rosto **perfeitamente simétrico**, não pisca, pele fria, chapéu-coco | ver abaixo |

### O Contador — o personagem que o jogador convoca

Não está na agenda de ninguém. Ele aparece quando **dois Alternados atravessam
o guichê num mesmo turno**: três dias depois, `S.flags.contadorDay` o coloca na
fila, com prioridade sobre qualquer aparição agendada. Ele não puxa arma nem
cinturão — **espera**. Aprovar *ou* rejeitar é responder à pergunta dele
("descuido ou escolha?"), e a conta fecha: final `contador`. Só **DETER**
resolve. Depois disso o gatilho é rearmado — dois de novo, ele volta.

A caracterização é o único lugar do jogo em que a "cara de IA" é o efeito
**pretendido**: `f.simetrico` zera toda a assimetria que `faceLayout` distribui
por todo rosto humano. O jogador sente que algo está errado sem saber dizer o
quê, porque o que está errado é a **ausência do erro**.

Implementação: `SPECIALS` / `specialsForDay(day)` em `data.js`;
`specialForToday()` e o despacho em `nextCitizen()`; traços em
`paintTraits()` (faces.js); QA em `tools/qa/specials.js`.

## 5.4 O elenco expandido (18 novos, proporcional ao Papers, Please)

Papers, Please tem ~21 personagens fixos (família + equipe + entrantes nomeados) em 31
dias — 0,68/dia. Aplicando a mesma proporção aos 48 dias de Humanocracy dá ~33; o
protótipo tinha 15 (4 família + 8 encontros + 3 com título só — O Silente, o amigo do
Dario, o barbeiro). Faltavam 18, adicionados como novos `ENCOUNTERS` nos dias livres,
sem tocar o motor (é dado puro — mesmo mecanismo que já sustentava os 8 originais):

- **Bruno Almedra** (Dias 3, 10): alívio cômico recorrente — contrabandista desengonçado,
  nunca ameaçador, no papel que o Jorji Costava cumpre em Papers, Please.
- **Talvo Okim** (Dias 34, 36): o informante — insinua que sabe os nomes da sua família,
  "currículo, não ameaça"; detê-lo sobe o risco de auditoria (`bumpAuditRisk`), ecoando
  "você também é inspecionado" sem precisar de um mecanismo novo.
- **Mirena Dvorak** (Dia 17) → **Miron Dvorak** (Dia 40): irmã e irmão. Ela procura o
  marido detido na Operação "Sangue Limpo" (dia 17, mesmo dia da manchete que a nomeia);
  ele volta 23 dias depois oferecendo uma rota alternativa pelo norte — um segundo
  caminho pra ending da resistência (`resistencia_norte`, aceito por `pickEnding()` junto
  do `resistencia_contato` do barbeiro), coincidindo com a manchete "fronteiras do norte
  caíram, ninguém governa lá" do mesmo dia.
- **Ivona Duran** (Dia 4), **Pavo Krantic** (Dia 13), **Irena Corvac** (Dia 14): três
  retratos de custo humano direto — viúva, jovem viajando sozinho pela primeira vez,
  contadora pega no exato dia em que o novo Édito de Pureza passa a exigir um certificado
  que ainda não existe pra ela.
- **Sabina Borzek** (Dia 20), **Yasmin Kavehpur** (Dia 22): desertora da coletiva
  taranstan e refugiada bahari sob a Convenção de Alcorte — ambas dentro das janelas de
  regra já existentes (refúgio taranstan dias 20–26; cartão ALCORTE-9).
- **Nils Aksun** (Dia 23), **Casimiro Ferro** (Dia 25): o ex-técnico da LumenCorp que
  admite o scanner K-7 só detecta ansiedade (pressagia a manchete do Dia 37 — "o scanner
  oficial era defeituoso"), e o pesquisador fugindo dois dias depois de catorze colegas
  serem presos por contestar a fenotipia (viajando com o passaporte de um colega morto —
  `nameMismatch`, a categoria "documento real, pessoa errada" do Volume 4.4).
- **Halvar Nordal** (Dia 26), **Clarice Malden** (Dia 28): um banqueiro linestanês
  oferecendo um suborno enorme porque o banco dele quebrou, e uma musicista procurando o
  nome do irmão numa lista após a explosão da Estação Central (manchete do Dia 27).
- **Ossip Hraben** (Dia 31): o pai da "família de trabalhadores realocados" que já mora
  na metade do seu apartamento desde o evento de casa do mesmo dia — dá rosto a algo que
  já existia só como texto em `HOME_EVENTS`.
- **Edvin Solmak** (Dia 32), **Leontin Corvac** (Dia 43): um burocrata convicto do
  Conselho, satisfeito com a própria mentira honesta, e um ex-inspetor de outro posto
  fechado, fugindo do mesmo sistema que ele operava.
- **Talia Malden** (Dia 46): da "comunidade do Vale" que declara conviver com Alternados
  (manchete do Dia 45) — a única voz do jogo genuinamente em paz com a pergunta central,
  o que é mais perturbador do que qualquer resposta de pânico.

Nenhum caso novo precisou de mecânica nova além de `bumpAuditRisk()` (já existia) e um OR
a mais em `pickEnding()`. Verificado: determinismo de RNG em todos os 35 dias de
`ENCOUNTERS` (seed fixa, gerado duas vezes, bit a bit idêntico); toda combinação
país/etnia/motivo/`forcedDisc` validada contra as listas reais do jogo; fluxo completo de
`okim1`→nota guardada→`okim2` detido→risco de auditoria subindo; fluxo completo de
`mirena1` aprovada→eco no jornal→`miron1`→nota guardada→`resistencia_norte`→
`pickEnding()` retornando o final da resistência; suíte `smoke.js`–`smoke6.js` sem
regressão. **Ainda só em português** — tradução EN/ES é a próxima rodada natural, seguindo
o mesmo padrão incremental usado no resto da localização deste projeto.
  Lascada na borda.

**Nunca confirmar** se é manipulação dos Alternados, falha de memória por estresse,
propaganda — ou algo pior. A partir daqui o jogador desconfia dos documentos, dos
governos, dos cidadãos **e da própria memória**. É o momento em que o thriller político
vira horror.

## 5.4 A família — e a casa explorável (implementada)

Vessa (esposa, arquivista), Tomi (8 anos), **Dario (15 anos, filho do primeiro casamento
do protagonista, mestiço)** e sua mãe, Odila. Não são uma tela de despesas: têm rotina,
emprego, opiniões e cenas próprias.

### A casa às 20:30 (house.js — primeira pessoa, raycast)

O expediente termina às 18h; às 20h30 o jogador anda pelo apartamento **em primeira
pessoa** (WASD + mouse-look). A planta: você entra pela porta no **corredor central**;
à **esquerda**, na ordem: quarto do Tomi (1º), quarto de hóspedes 1, quarto de hóspedes 2
e a cozinha (Vessa); à **direita**: quarto da sua mãe (1º), quarto do Dario (ao lado do
dela) e o seu quarto (dormir encerra o dia). No **fim do corredor**, a sala — onde a mãe
está sempre, no sofá, diante da TV. **Todos os cômodos têm gameplay:**

- **Quarto da mãe** (ela nunca está nele): as ₴2 de "emergência" sob o travesseiro
  (pegar ou não — ela vai perceber e não vai dizer nada), o formulário rasgado e colado
  com fita na gaveta (D17+), e no colapso a cama feita demais — *"ela dorme aqui? Dormiu
  alguma vez?"*;
- **Hóspedes 1**: vazio até o Dia 30; do 31 em diante, **os realocados** — dois de pé,
  de costas, imóveis, que às vezes estendem ₴2 "pelo incômodo" sem se virar;
- **Hóspedes 2**: vasculhável uma vez por noite — moedas esquecidas, um frasco de
  remédio lacrado (cura um doente de graça!), nada… ou, no fim da campanha, o
  travesseiro quente do quarto onde ninguém nunca dormiu.

**Cada conversa é uma fonte de informação com confiabilidade própria:**

| Personagem | Fonte | Valor de jogo | Confiabilidade |
|---|---|---|---|
| Vessa | fofocas das amigas | diz se o boato físico de AMANHÃ é real ou lenda | 75% |
| Mãe | a TV que não desliga | adianta a manchete de amanhã, embaralhada com propaganda | ~50% |
| Tomi | "visões" (sonhos) | prenuncia a visita noturna do dia seguinte, cifrado | alta, mas cifrada |
| Dario | o "amigo" | avisos impossíveis: o procurado de amanhã, o Dia 46, quando não abrir a porta | perfeita — e é isso que assusta |

**Dario é o custo humano do Édito em casa:** mestiço, barrado no portão da escola no
Dia 15, chamado de "mistura" no pátio com aval do professor sob Mehrvolk, e "camarada"
no dia seguinte ao golpe — *"quem decide o que eu sou?"*. O "amigo" dele nunca é visto,
nunca é explicado, não sai em foto ("a foto sai sem o canto do quarto") e uma vez errou
o nome de Dario — chamou-o pelo nome do pai, "como quem tinha visto uma coisa que ainda
não aconteceu".

**Batidas na porta (na casa):** eventos scriptados das onze noites + fiscalizações
aleatórias. Se for o governo e o jogador não atender (ou dormir ignorando), a
advertência entra no prontuário — o Estado também inspeciona quem inspeciona, inclusive
em casa. Vizinhos pedem fósforos. Estranhos deixam um botão do SEU casaco no capacho —
sem que falte nenhum na manga.

Sistemas de sobrevivência:

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
