# HUMANOCRACY — GDD Volume 9 — Arquitetura Técnica e Balanceamento

## 9.1 O protótipo web (este repositório)

```
humanocracy/
  index.html   — telas (título, manhã, turno, fim de dia, final) + modais
  style.css    — temas por regime via CSS custom properties (body.regime-*)
  data.js      — mundo: países, nomes, regras/dia, notícias, encontros, finais
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
6. Localização (EN/ES) — a escrita burocrática é o maior custo de tradução;
7. Modo "arquivista" (sem relógio) **— implementado no protótipo**: alternável no título,
   persiste entre partidas (fora do save); o relógio do turno não avança em tempo real,
   só com o custo-base de cada decisão e o uso de ferramentas — sem pressão de tempo, mas
   a fila continua finita e O Silente ainda pune demora *investigando*, não demora
   *pensando*. Falta: modo "segunda leitura" (nova campanha com a MESMA seed — os mesmos
   cidadãos, agora sabendo o que você sabe. A rejogabilidade como tema: nem revendo tudo
   você terá certeza).
