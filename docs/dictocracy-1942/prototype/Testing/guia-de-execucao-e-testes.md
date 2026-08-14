# Guia de Execução e Testes — Protótipo

Este guia assume que os passos 1–4 de `../00-setup-guia.md` já foram concluídos (projeto compilado com sucesso no Editor).

## Checklist de aceite por sistema

### DecisionSystemSubsystem
- [ ] `ResolveDecision("raid_duisburg", "approve")` aplica `GermanIndustrialOutput -8` e `MilitaryMoraleUK +3` imediatamente (verificar via `GetIndicatorValue` num Print String de teste).
- [ ] Chamar `AdvanceDay()` 10 vezes seguidas dispara `OnDelayedEffectManifested` exatamente uma vez, com o texto de manifestação da opção escolhida, e aplica `PublicSupportUK -4` / `DiplomaticInfluenceUK -6` **somente** nesse momento — nunca antes.
- [ ] Escolher uma opção diferente (`refuse`) e repetir: confirmar que o efeito atrasado correto (impacto em `BrookeTrueLoyalty`) dispara no dia certo (+7) e não o efeito de `approve`.

### CharacterMemoryComponent
- [ ] Após `RecordDecisionImpact` com impacto negativo, `GetTrueLoyalty()` cai e fica clampado em [0,100] (testar com impacto extremo, ex. -999, para confirmar o clamp).
- [ ] `HasMemoryOf("raid_duisburg")` retorna false antes da decisão e true depois.

### DialogueRuntimeComponent
- [ ] `StartDialogue` no nó `meeting_intro` dispara `OnDialogueNodeEntered` com a fala de Ismay.
- [ ] Selecionar as três rotas alternativas em `brooke_brief` (civis / clima / pular) e confirmar que todas convergem em `eden_warning` sem duplicar ou pular falas.
- [ ] Selecionar cada uma das 5 opções finais e confirmar, via log, que a `LinkedDecisionId`/`LinkedDecisionOptionId` corretas chegam ao `DecisionSystemSubsystem`.
- [ ] Confirmar que o `LoyaltyImpact` da resposta escolhida é aplicado ao NPC correto via `LoyaltyTargetCharacterId` — mesmo quando esse NPC não é quem fala o nó atual (`eden_warning` é falado por Eden, mas `decide_approve`/`decide_refuse`/`decide_delay` têm `LoyaltyTargetCharacterId = "brooke"`, refletindo a reação de Brooke à decisão, não de Eden). Este desacoplamento entre `SpeakerCharacterId` (quem fala) e `LoyaltyTargetCharacterId` (quem reage) foi resolvido em `DialogueRuntimeTypes.h`/`DialogueRuntimeComponent.cpp` — verificar no debugger que o `CharacterMemoryComponent` de Brooke, e não o de Eden, recebe o impacto nesses três casos.
- [ ] `OnDialogueEnded` dispara ao entrar em `meeting_close` (nó sem respostas) — confirmar que `SelectResponse` posterior não gera crash mesmo sem diálogo ativo (chamar propositalmente para testar robustez).

### AgendaSchedulerSubsystem
- [ ] Item de agenda "Reunião sobre Duisburg" aparece em `GetTodayAgenda()` antes de ser atendido.
- [ ] `MarkAttended` reflete corretamente em `bAttended`.
- [ ] `AdvanceToNextDay` chama `DecisionSystem->AdvanceDay()` (confirmar via breakpoint ou log que o dia do `DecisionSystemSubsystem` avança em paralelo).

### SaveGameSystem
- [ ] Salvar após resolver a decisão `raid_duisburg` (opção `approve`), fechar e reabrir o nível, carregar o slot: `CurrentDay` e os indicadores voltam ao valor salvo.
- [ ] **Limitação conhecida e aceita no protótipo**: efeitos atrasados pendentes (`PendingEffects` do `DecisionSystemSubsystem`) não são serializados — se o jogador salvar antes do dia 10 (manifestação do efeito de `approve`) e carregar depois, o efeito tardio **não** dispara. Marcado explicitamente no código-fonte (`DecisionSystemSubsystem::RestoreState`) e aqui para não ser esquecido; correção obrigatória antes da Fase 3, onde consequência atrasada sobrevivendo a save/load é requisito de produto, não só de protótipo.
- [ ] `CharacterMemories` restaura `TrueLoyalty`, `PublicLoyalty` e `MemoryLog` de cada NPC corretamente (`RestoreSavedState`, não `RecordDecisionImpact` — checar que o valor não é recalculado, apenas reposto).

## Teste de fluxo completo (equivalente ao critério de diversão do GDD)
1. Iniciar o nível → HUD de agenda mostra 1 item.
2. Abrir a reunião, navegar por ao menos uma pergunta extra (civis ou clima) antes de decidir.
3. Escolher qualquer opção que não seja `approve` nem `refuse` puro (para confirmar que o sistema não degenera em binário).
4. Verificar a pequena alteração visual do ambiente (parede/mapa reagindo a `GermanIndustrialOutput`) — deve mudar de estado assim que o efeito imediato é aplicado, não apenas o tardio.
5. Avançar o dia até o gatilho do efeito atrasado e confirmar que o texto de manifestação aparece (mesmo que via Print String nesta fase — UI final de "jornal"/notificação é polimento de Sprint 6).
6. Salvar, fechar o Editor (Play in Editor → Stop → reiniciar sessão), carregar, e confirmar que o estado é coerente com a limitação conhecida documentada acima.

Nenhum destes itens deve ser marcado como concluído sem execução real no Editor. Este arquivo é o critério objetivo de fechamento do Sprint correspondente em `../07-producao-e-riscos.md`.
