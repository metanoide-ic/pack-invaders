# HUMANOCRACY — GDD Volume 9 — Arquitetura Técnica e Balanceamento

## 9.1 O protótipo web (este repositório)

```
humanocracy/
  index.html   — telas (título, manhã, turno, fim de dia, final) + modais
  style.css    — temas por regime via CSS custom properties (body.regime-*)
  data.js      — mundo: países, nomes, regras/dia, notícias, encontros, finais
  i18n.js      — idiomas: T(s) e applyStaticI18n() (PT é a fonte; EN implementado)
  game.js      — motor: RNG, retratos SVG, geração de cidadãos/documentos,
                 inspeção, interrogatório, scanners, IA adaptativa, economia
                 familiar, ecos, salvamento (localStorage), finais
```

Sem build, sem dependências: abre em `file://`. Salvamento automático ao fim de cada dia
(`localStorage`, chave `humanocracy_save_v1`); botão RETOMAR TURNO no título.

### Fluxos principais (game.js)

```
startDay → bulletin → nextCitizen → makeCitizen(seed, dia, IA)
   makeCitizen: país→etnia→nome→retrato→motivo→docs (buildDocs)
                arquétipo {limpo | falsário | Alternado} → applyDisc (ponderada)
   decide(aprovar|rejeitar|deter) → judge (Estado Verdadeiro × regulamento do dia)
       → contadores invisíveis → scheduleEcho → citation/salário → próximo
endShift → goHome → applyNight (aluguel, fome, doença, eventos) → checkArrest
   → showMorning (jornal + ecos + loja) → startDay(dia+1)
Dia 47: rulesForDay → ['approveAll']; REJEITAR/DETER ocultos
Dia 48: presentMirror → finishGame → pickEnding (Memória do Mundo)
```

### A IA adaptativa em 10 linhas (núcleo real)

```js
// cada detecção confirmada ensina a espécie:
S.ai.det[tipo]++                        // em evaluatePair()
// cada Alternado novo evita o que você aprende:
peso[tipo] = 1 / (1 + det[tipo]²)       // alternadoDiscWeights()
pPerfeito  = min(0.15 + dia·0.012 + médiaDet·0.02, 0.8)   // 0.95 no dia 46+
```

## 9.2 Arquitetura Unity (produção)

```
Assembly: World          Assembly: Play           Assembly: Presentation
─────────────────        ─────────────────        ─────────────────
WorldSimulation          ShiftController          DeskView (docs físicos)
  PopulationSystem       DocumentInspector        BoothView / QueueView
  CitySimulation         InterrogationSystem      NewspaperView / RadioPlayer
  EconomySystem          ScannerSystem            HomeView
  FactionSystem          DecisionJudge            ThemeManager (regimes)
  LawManager             BriberySystem
  EventSystem (proc.)    TimelineSystem (Linha
  MediaSystem              da Vida)
  MemorySystem (Memória
    do Mundo + Ecos)
  AlternateAI (espécie)
  NPCManager (Estado
    Verdadeiro + destino)
```

- **Dados:** todo conteúdo autoral em ScriptableObjects/JSON (países, leis, notícias,
  encontros, finais) — o protótipo `data.js` é a especificação de schema;
- **Determinismo:** um seed de campanha; toda geração via PRNG próprio (nunca
  `UnityEngine.Random` em simulação) → replays e depuração de "por que este Alternado
  existiu";
- **Estado Verdadeiro:** imutável após a geração; gravado no save; nenhuma API pública
  de leitura para camadas de apresentação (impossível "vazar" a verdade por bug de UI);
- **Ciclo do Alternado:** nasce → recebe missão → observa leis/sociedade/jogador →
  escolhe identidade → constrói documentos (ponderação adaptativa) → cria rede →
  infiltra → executa → se descoberto, a espécie aprende (banco global) → a próxima
  geração melhora;
- **Save:** JSON versionado; migração por versão; autosave por dia + slot manual.

## 9.3 Balanceamento (números do protótipo — base de tuning)

| Parâmetro | Valor |
|---|---|
| Turno | 08:00–18:00; 1s real = 2 min jogo (~5 min reais/dia) |
| Custo de ações | pergunta 5 min; térmico/pulsação 15 min; biológico 30 min |
| Salário / bônus / multa | ₴5 correto / ₴10 captura / ₴5 a partir da 3ª advertência do dia |
| Despesas | aluguel ₴15→₴25 (D31); comida ₴8; aquecimento ₴6; remédio ₴12; calibração ₴40 |
| P(Alternado) | min(0.10 + dia·0.004, 0.30) |
| P(falsário humano) | 0.22 (não adaptativo — desespero não aprende) |
| Biológico calibrado | TP 80% / FP 10% — descalibrado (D31+): 50% / 30% — morto D43+ |
| Térmico | anomalia: Alternado 35%, humano 8% (nervoso 20%) |
| Pulsação | calma: Alternado 70%, humano 50% (nervoso 10%) |
| Docs perfeitos (Alternado) | 0.15 + dia·0.012 + médiaDet·0.02 (teto 0.8; D46+: 0.95) |
| Ecos | 50% de eco por Alternado aprovado, atraso 2–5 dias |
| Doença | fome 2 dias → 50%; sem aquecimento → 15%/noite; 4 dias sem remédio → morte |
| Prisão | 12 advertências totais ou 3 acúmulos de risco de auditoria |
| Finais | prisão > casa vazia > resistência (ajuda + contato) > cidade silenciosa (6+ Alternados) > medalha (≤4 adv., 0 subornos) > espelho |

**Metas de sensação:** Dias 1–5 com ≥90% de acerto possível; Dias 20–30 ~70%; Dia 46
projetado para derrotar o jogador honesto (é o ponto). A dificuldade nunca vem de esconder
informação que existia — vem de o mundo parar de produzi-la.

## 9.4 Testes

- Smoke test Playwright (executado nesta entrega): título → contrato → jornal → turno →
  6 cidadãos com inspeção → scanners → fim de dia → transição de regime (D12) →
  D47 (REJEITAR ausente) → D48 (espelho) → final — **zero erros de console**;
- Produção: testes de simulação headless (1.000 campanhas/seed batch) validando:
  distribuição de finais, taxa de acerto possível por dia, ausência de soft-locks legais
  (todo cidadão sempre tem pelo menos um veredito "correto" definido).

## 9.4b Caminho Steam (implementado o primeiro passo)

O jogo NÃO é um produto web: o alvo é a **Steam**. O caminho em `humanocracy/steam/`:

1. **Agora:** build desktop Electron (`npm run humanocracy`) — tela cheia, F11/Alt+Enter,
   saves persistidos em userData; empacotável com electron-forge para Windows/Linux/Deck;
2. **Early Access / demo:** Steamworks via `steamworks.js` (AppID, Steam Cloud sobre o
   localStorage, overlay com `--in-process-gpu`), gamepad para o Deck, e as **12
   conquistas** especificadas em `steam/README.md` (todas com contadores já existentes
   no estado do jogo);
3. **1.0:** port Unity completo conforme este volume.

## 9.5 Roadmap pós-protótipo

1. Fila simulada pessoa a pessoa + bagagem/objetos (Volume 4.6);
2. Linha da Vida + Cadeia de Evidências como UI;
3. Rádio diegética e jornal multi-editoria;
4. Rede Social Invisível (casos que crescem sozinhos);
5. Manuais falsificáveis e auditorias reativas;
6. Localização (EN/ES) **— arquitetura + inglês + espanhol implementados no protótipo,
   ampliados em duas rodadas**: `i18n.js` define `T(s)` (procura a chave na tabela do
   idioma ativo, com fallback pro português original — nunca quebra por faltar tradução) e
   `applyStaticI18n()` (varre a interface estática, guarda o PT original em `data-pt` e
   troca pela tradução). `I18N_TABLES = { en: I18N_EN, es: I18N_ES }` — as duas tabelas têm
   exatamente as mesmas 259 chaves (conferido programaticamente a cada rodada). Botão no
   título cicla PT-BR → EN → ES → PT-BR (recarrega a página). Cobertura: toda a interface
   estática (título, HUD, ferramentas, telas de pausa/exame/bagagem/casa), `REGIME_LABEL`,
   `MASTHEAD`, os 8 finais (texto integral), rótulos e tipos de documento, perguntas de
   interrogatório, **e a camada ambiente do mundo**: sussurros (`WHISPERS`), conversa e
   eventos da fila (`QUEUE_CHATTER`/`QUEUE_EVENTS`), rádio das 4 fases do regime (`RADIO`),
   anúncios (`ADS`), notícias de preenchimento (`FILLER_NEWS`), os 8 comunicados
   roteirizados (`SCRIPTED_BULLETIN`, com os fragmentos dinâmicos — procurado, cota,
   reajustes — traduzidos isoladamente e concatenados com os valores não-traduzíveis:
   nomes, números), os boatos do exame físico (`RUMOR_TEXT`) e os 6 sinais físicos com seus
   achados/observações normais (`TELLS`). Um bug real de escopo de variável foi encontrado e
   corrigido: `examZone()`/`genPhysical()` usavam `const T = TELLS[t]`, sombreando a função
   global `T()` — impossível de traduzir ali sem antes renomear. Rodada seguinte: as 259
   chaves subiram para 303 com o **regulamento** (`RULES`, as 15 leis mostradas no
   `REGULAMENTO DO DIA`, incluindo a linha de cota e a de procurado) e as **saudações da
   fila** (`greetingFor` — os ~25 cumprimentos genéricos, por regime, nervosos e de
   retornantes, com os fragmentos dinâmicos de nome/dia isolados do texto traduzível) — a
   primeira frase que cada cidadão diz, em todo turno, agora traduz.

   Quarta rodada: as 303 chaves subiram para 380. Passaram a traduzir os **valores**, não só
   os rótulos: `PURPOSES` (os 6 motivos de viagem, ex. "Trabalho"/"Work"), as 9 durações
   distintas (`PURPOSES.dur`, ex. "6 meses"/"6 months") e as 17 `PROFESSIONS` — tudo isso
   aparece tanto nos documentos (`fld('work','profissao',...)`, `fld('perm','motivo',...)`)
   quanto nas respostas de `answerFor()` (com `cidade` propositalmente NÃO traduzido, por
   ser nome próprio) e nos follow-ups de `followTruth()` (`contato`/`chefe`/`volta`; `rua`
   também traduz, aceitando que a ordem de palavras de rua fica levemente estranha em EN —
   um compromisso deliberado, não um erro). A ferramenta **Linha da Vida** (`buildLifeline`/
   `openLifeline`) traduz por completo, e os **ecos** (`scheduleEcho`) também.

   Quinta rodada: 380 → 454 chaves com **`SCRIPTED_NEWS`** — as 18 manchetes de dias
   específicos (título + corpo + 2–3 breves cada) que marcam a progressão dos regimes
   (o golpe Mehrvolk no dia 12, o Conselho Popular no dia 30, o colapso a partir do dia 40)
   — o fio narrativo que o jornal carrega além do "preenchimento" genérico. `news.h`/
   `news.b` já passavam por `T()` desde a rodada 2 (cobertura automática, só faltava
   preencher as chaves); `news.m` (as breves) e o rótulo "BREVES:" foram passados por
   `T()` nesta rodada.

   Sexta rodada: 454 → 476 chaves com os **`ENCOUNTERS`** — os 15 personagens recorrentes
   scriptados (o arco de 5 partes de Elara Venn, o sargento Dmarov e sua oferta de suborno,
   o barbeiro-contato da resistência, a jornalista Vela Odim etc.). `greetingFor(cz)` passou
   a retornar `T(cz.encounter.fala)` em vez da fala crua; as 3 `nota.texto` (bilhetes na
   bandeja, ex. "AMANHÃ: Volkan Zubrek. Aprove. — R.D.") não precisaram de nenhuma mudança de
   código — já passavam por `modal()`, que traduz `body` automaticamente desde a rodada 1,
   só faltava a chave no dicionário. Também traduzidos nesta rodada: a cena do dia 48 ("O
   Espelho", `presentMirror()`) e os dois ecos tardios de `encounterOutcome()` que tinham
   ficado órfãos da rodada de "ecos" anterior (o hospital clandestino de Delvina e a
   publicação de Vela Odim no exterior). Verificado por Playwright: fala de encontro forçado,
   nota em modal, textos do espelho e os dois ecos — todos traduzidos corretamente em EN;
   paridade de chaves EN/ES confirmada (476 = 476, zero divergência).

   Sétima rodada: 476 → 591 chaves com os **`NIGHT_EVENTS`** (as 11 cenas noturnas de
   horror — quem bate, o texto da cena, os 2 rótulos de escolha e os 2 desfechos de cada
   uma, incluindo os 3 ecos que viram breves no jornal do dia seguinte), os 12
   **`HOME_EVENTS`** (os eventos de drama familiar mostrados na tela da manhã, mais os dois
   eventos inline — o remédio entregue pelo barbeiro e o velório — que estavam soltos em
   `renderHome()`) e as pools de flavor-text da **bagagem** (`BAG_POOLS` nas 7 categorias,
   `BAG_ONEWAY`, `BAG_CONTRABAND`, `BAG_HERRINGS`). `showNight()`/`resolveNight()` passaram a
   traduzir `quem`, `texto`, o rótulo de cada escolha, o texto de desfecho (`after`) e o eco
   (`echo`); o botão "VOLTAR PARA DENTRO →" também. `openBag()` agora traduz `item.txt` e
   `item.desc` de cada objeto da mala. Verificado por Playwright: cena da noite do dia 3
   (pergunta de Bruno, as duas escolhas, o desfecho e o eco no `pendingNews`), evento de casa
   do dia 4, o evento inline do remédio entregue, e um item de bagagem — todos traduzidos
   corretamente em EN; paridade de chaves EN/ES confirmada (591 = 591, zero divergência).

   Oitava rodada — a casa explorável em primeira pessoa (`house.js`), o maior bloco de texto
   dramático que ainda restava: 591 → 805 chaves. Cobre os 9 nomes de cômodo (`ROOMS`), as
   ~52 falas de `H_LINES` (4 membros da família × falas por regime + repetição + doente), as
   5 falas de `H_SPECIAL` (dias com evento único), as 11 visões proféticas de Tomi em
   `H_VISIONS`, os textos dinâmicos de `infoVessa()`/`infoMae()`/`infoTomi()`/`infoDario()`
   (fragmentados ao redor dos valores interpolados — boato do dia seguinte, manchete do
   jornal, nome do familiar curado), as falas de `scheduleKnock()`/`knockExpire()`/
   `answerDoor()` (fiscal do Ministério, vizinho, batida sem resposta) e as de
   `interactWith()` (retrato da família, quarto da mãe, hóspedes 1 e 2, incluindo os dois
   ramos dinâmicos — moedas encontradas e remédio entregue a um familiar nomeado). A
   tradução foi centralizada em `hSay()`/`hAdvance()` (que agora traduzem automaticamente o
   nome do interlocutor, cada linha de fala e cada rótulo de escolha — o mesmo padrão de
   alavancagem usado em `modal()` desde a primeira rodada), então a maior parte de
   `interactWith()`/`talkTo()`/`knockExpire()`/`answerDoor()`/`enterHouse()`/`enterMirror48()`
   não precisou de nenhuma edição de código, só de preencher o dicionário. Só os pontos que
   escrevem texto fora de `hSay()` — nome do cômodo no HUD, o prompt "E — Falar com ...", e
   os dois `S.pendingNews.push()` de fiscalização não atendida — precisaram de `T()`
   explícito. Verificado por Playwright: falas dos 4 familiares (incluindo a variante doente
   e a de dia especial), retrato da família, quarto da mãe com as duas escolhas, os dois
   ramos de `hosp2` (moedas e remédio, forçados via override de `rnd()`), prompts de
   interação e o eco de fiscalização no jornal — todos traduzidos corretamente em EN e ES;
   varredura completa de `H_LINES`/`H_SPECIAL`/`H_VISIONS`/nomes de cômodo/títulos/rótulos
   contra o dicionário real do jogo (carregado do `index.html` de produção, não de um stub)
   confirma zero string faltando; paridade de chaves EN/ES confirmada (805 = 805).

   Nona rodada — o último gap conhecido, o feedback da UI de inspeção e das advertências:
   805 → 843 chaves. Cobre as mensagens da barra `#inspect-bar` (os dois textos de
   `MODO INSPEÇÃO:`, o acerto contra o procurado, a discrepância confirmada, "nenhuma
   discrepância" e o contrabando encontrado) e, mais relevante para a jogabilidade, o texto
   da citação/advertência (`citation()`) que aparece sempre que o jogador erra uma decisão —
   até esta rodada, esse popup nunca tinha sido traduzido, apesar de ser um dos feedbacks
   mais frequentes do jogo. `citation(text)` passou a traduzir `text` automaticamente (mesmo
   padrão de alavancagem de `modal()`/`hSay()`), então as ~6 mensagens literais de `decide()`
   (procurado aprovado por engano, detenção sem evidência, rejeição indevida etc.) e o rótulo
   "ADVERTÊNCIA REGISTRADA."/"MULTA: " não precisaram de nenhuma edição além da chave no
   dicionário. As `desc` de discrepância (`applyDisc()`) e de violação de regra
   (`computeViolations()`) — texto armazenado em objetos de estado, nunca comparado, só
   exibido — passaram a ser traduzidas na CRIAÇÃO (não na exibição), já que não têm papel
   lógico; isso evitou duplicar a tradução nos dois pontos onde aparecem (a barra de
   inspeção e a nota da citação). Verificado por Playwright em EN e ES: os dois textos do
   modo inspeção, quatro `desc` de violação de regra (passaporte, identidade, permissão de
   trabalho, ancestralidade), a citação simples e a citação composta ("Aprovado(a) com
   irregularidade: ..."), e a barra de discrepância confirmada — todos corretos; paridade de
   chaves EN/ES confirmada (843 = 843, zero divergência).

   Com esta rodada, não há mais nenhum gap de texto de jogo conhecido em português — a
   localização EN/ES cobre a interface, a camada ambiente, o regulamento, os documentos e
   interrogatório, a Linha da Vida, o jornal roteirizado, os encontros scriptados, os
   eventos noturnos e familiares, a bagagem, a casa explorável e agora o feedback de
   inspeção/advertência. Adicionar um terceiro idioma é só copiar `I18N_ES`, traduzir os
   valores e registrar em `I18N_TABLES` — a arquitetura já suporta N idiomas, não só dois.

   Décima rodada — revisão de código das nove rodadas de localização (8 buscadores em
   paralelo cobrindo corretude, comportamento removido, rastreamento cross-file, reuso,
   simplificação, eficiência e altitude): encontrou o gap real que a rodada anterior
   deixou passar — dois `S.pendingNews.push()` (o eco de `silenteLeaves()` e o comunicado
   de cota fechada de `endShift()`) nunca tinham passado por `T()`, então esses dois
   breves do jornal ficavam sempre em português mesmo em EN/ES. Corrigido; 843 → 848
   chaves. Também simplificado o rótulo MÚSICA/SONS do menu de pausa, que usava 4 chaves
   de frase inteira (`T('MÚSICA: ' + estado)`) em vez de compor um prefixo traduzido com
   uma palavra ON/OFF traduzida — agora seguindo o mesmo padrão de fragmentação usado em
   todo o resto do código. Outros "achados" da revisão (pré-tradução antes de
   `citation()`/`hSay()` em `decide()`/`talkTo()`) foram investigados e confirmados como
   arquitetura correta, não bugs: essas strings compostas contêm valores interpolados
   dinâmicos e por isso nunca poderiam ser chaves estáveis no dicionário — a
   pré-tradução de fragmentos ali é necessária, não redundante. A checagem de "T"
   sombreando a função global (bug da rodada 2) foi reconfirmada limpa em toda a base.
   Verificado: paridade de chaves EN/ES (848 = 848); suíte `smoke.js`–`smoke6.js`
   completa sem regressão; teste Playwright dirigido confirmando os dois breves
   corrigidos e os rótulos de música/som em EN.
7. Modo "arquivista" (sem relógio) **— implementado no protótipo**: alternável no título,
   persiste entre partidas (fora do save); o relógio do turno não avança em tempo real,
   só com o custo-base de cada decisão e o uso de ferramentas — sem pressão de tempo, mas
   a fila continua finita e O Silente ainda pune demora *investigando*, não demora
   *pensando*.
8. Modo "Segunda Leitura" **— implementado no protótipo**: ao terminar uma campanha
   (qualquer final), a `seedBase` fica guardada; "SEGUNDA LEITURA" no título recomeça os
   48 dias com a MESMA seed. Isto exigiu trocar o RNG de um stream global único por um
   **RNG chaveável** (`withRng(seed, fn)`/`makeRng`/`hashSeed`): cada dia tem sua própria
   seed (`seedBase+dia`), e cada cidadão a sua (`seedBase+dia+posição na fila`), guardada
   em `cz.seed`. Isso é o que garante a promessa central do modo — os MESMOS cidadãos
   aparecem não importa quantas ferramentas você use ou em que ordem, porque a geração de
   cada um não compartilha stream com o resto. Scanners e a decisão em si também usam
   sub-seeds de `cz.seed` (`scan+tipo`, `decide`), então escanear a mesma pessoa duas vezes
   dá sempre o mesmo resultado, e o "mundo reage" (quem volta, o eco) é uma função pura da
   decisão sobre aquele cidadão, não da ordem de chamadas de outros lugares. Fora dessa
   malha (flavor de fila, retrato de visita noturna, notícia de preenchimento) continua
   usando o stream ambiente — não é essencial à identidade dos suspeitos, e generalizar
   ficaria mais frágil que o ganho.
