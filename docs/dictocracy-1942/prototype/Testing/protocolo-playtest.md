# Protocolo de Playtest Interno — Gate de Fase 2 → Fase 3

Opera diretamente sobre os **critérios objetivos** já definidos em `../../07-producao-e-riscos.md` (seção 12). Este documento não redefine os critérios — define como coletar os dados para julgá-los sem ambiguidade. Só faz sentido rodar depois que o checklist técnico de `guia-de-execucao-e-testes.md` (Automation Framework + testes manuais por sistema) já estiver 100% verde: playtest com jogador externo não é o lugar para achar crash de sistema, é o lugar para achar problema de experiência.

## Participantes
- **12 pessoas**, público-alvo do GDD (seção 2.2): 25–45 anos, familiaridade prévia com estratégia histórica ou RPG narrativo — **nenhum membro da equipe de desenvolvimento**, nem playtesters que já viram este protótipo antes.
- Sessões individuais (não em grupo) — decisão moral sob observação de terceiros muda comportamento; queremos a escolha real da pessoa sozinha com o jogo.

## Papel do moderador
Observa e cronometra, mas **não guia**. Intervém apenas se o participante ficar travado por mais de 90 segundos sem progresso (registrar a intervenção — conta contra o critério 1). Nunca sugere qual opção de decisão escolher, nunca explica o que uma opção "significa" além do texto já visível na tela.

## Roteiro de sessão

### 1. Abertura (2 min, falado pelo moderador)
> "Você vai jogar uma cena de um protótipo. Não existe forma certa de jogar — quero que você tome as decisões que faria de verdade nessa posição. Vou ficar observando e anotando, mas não posso te ajudar durante o jogo. No fim, vou fazer algumas perguntas."

### 2. Tutorial mínimo (30–60s, apenas controles, nunca conteúdo)
Mostrar apenas: mover, interagir (tecla E), abrir agenda (Tab). Não mencionar a existência da decisão, do mapa, ou do sistema de consequência atrasada — isso precisa ser descoberto pelo jogador dentro do loop, senão o critério 1 (completar sem instrução externa) fica invalidado por definição.

### 3. Sessão livre
Cronometrar do primeiro input até o participante parar espontaneamente (não até um limite artificial) — isso alimenta o critério 4 (tempo médio de sessão voluntária). Se o participante perguntar "o que eu faço agora?", responder apenas "o que fizer sentido para você" — não é uma instrução de conteúdo, é permissão, registrar a pergunta mas não contar como intervenção guiada.

### 4. Questionário pós-sessão (Likert 1–5, aplicado sem o moderador reformular as perguntas)
1. "Senti que minha decisão teve peso." (1 = discordo totalmente, 5 = concordo totalmente) — alimenta critério 2.
2. "Entendi por que as coisas aconteceram do jeito que aconteceram." (contexto geral, não gate por si só)
3. "Fiquei confuso sobre o que fazer em algum momento." (sinal de usabilidade, não gate)

### 5. Verificação de causalidade (sem reler a tela)
Perguntar: **"O que você acha que vai acontecer por causa da decisão sobre o bombardeio, daqui a alguns dias?"** — resposta correta = menciona corretamente a direção do efeito tardio da opção que o participante escolheu (não precisa acertar o número exato do indicador, precisa acertar a direção/natureza do efeito). Alimenta critério 3.

### 6. Entrevista aberta (não estruturada, 3–5 min)
Perguntas de partida (não roteiro fechado — seguir o que o participante trouxer):
- "O que você lembra da cena?"
- "Teria feito diferente se pudesse jogar de novo?"
- "Tem alguma coisa que você queria saber e não conseguiu?"

Registrar, sem induzir: o participante menciona espontaneamente querer saber "o que teria acontecido se" tivesse decidido diferente? (critério 6 — **nunca perguntar isso diretamente**, só registrar se surgir sem indução; perguntar diretamente invalida o dado.)

## Planilha de coleta (uma linha por participante)

| Campo | Tipo | Alimenta o critério |
|---|---|---|
| `participant_id` | texto anônimo (P01–P12) | — |
| `completed_loop_without_help` | booleano | 1 |
| `moderator_interventions_count` | inteiro | 1 (>0 conta contra) |
| `q1_decision_weight_likert` | 1–5 | 2 |
| `causality_check_correct` | booleano | 3 |
| `session_duration_minutes` | decimal | 4 |
| `crash_or_softlock_occurred` | booleano | 5 |
| `spontaneous_what_if_mention` | booleano | 6 |
| `open_interview_notes` | texto livre | qualitativo, não gate |

## Cálculo do resultado (aplicar exatamente como está em `07-producao-e-riscos.md` §12)

```
completion_rate      = count(completed_loop_without_help = true) / 12        # gate: >= 75%
decision_weight_rate  = count(q1_decision_weight_likert >= 4) / 12            # gate: >= 70%
causality_rate        = count(causality_check_correct = true) / 12           # gate: >= 60%
avg_session_minutes   = mean(session_duration_minutes)                        # gate: >= 20
crash_count            = count(crash_or_softlock_occurred = true)             # gate: == 0
what_if_rate           = count(spontaneous_what_if_mention = true) / 12       # gate: >= 2/3 (66,7%)
```

**Decisão de gate:** todos os seis critérios precisam passar para liberar a Fase 3. Se 1–2 critérios falharem por margem pequena (até 10 pontos percentuais), tratar como iteração de design antes de repetir o playtest — não como reprovação automática do conceito. Se 3+ falharem, ou qualquer crash ocorrer, o loop precisa de revisão antes de qualquer nova rodada de playtest.

## O que este protocolo não substitui
Não substitui o QA técnico (`guia-de-execucao-e-testes.md`) nem a revisão histórica/jurídica do conteúdo (`../../08-finais-e-conformidade.md`) — mede exclusivamente se o loop funciona como experiência, assumindo que o sistema por trás já está correto.
