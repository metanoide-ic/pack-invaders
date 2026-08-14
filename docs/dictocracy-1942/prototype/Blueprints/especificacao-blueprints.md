# Especificação de Blueprints — Protótipo

Não é possível gerar arquivos `.uasset` binários fora do Editor. Esta especificação substitui os arquivos: descreve cada Blueprint necessário, sua classe pai C++, variáveis e o grafo de eventos em texto, suficiente para reconstrução direta no Editor.

## BP_PrototypeOffice (Nível)
- Base: template Third Person do UE5, ambiente único representando um escritório/sala de mapas simplificado (geometria de bloco cinza aceitável no protótipo — acabamento fica para a Fase 3).
- Contém: `BP_PlayerCharacter` posicionado no ponto de spawn; `BP_NPC_Ismay`, `BP_NPC_Brooke`, `BP_NPC_Eden` posicionados na "sala de mapas"; um `BP_DocumentProp` (mesa com documento); um `BP_StrategicMapTerminal` (objeto interativo que abre o widget de mapa); um `BP_DamageStateManager`, que **herda de `ADamageStateManager`** (C++, `Source/Dictocracy/Environment/`) — no Editor, definir `ObservedIndicatorName = "GermanIndustrialOutput"` e `Thresholds = [-5, -10]` (3 estados: intacto / danificado / crítico), e implementar o evento `OnDamageStateChanged(NewStateIndex, PreviousStateIndex)` trocando o material de uma parede/mapa de parede. A regra de "quando muda de estado" já vem pronta do C++; o Blueprint só cuida da troca visual em si.
- **Level Blueprint:** no `BeginPlay`, obter `UDecisionSystemSubsystem` via `Get Game Instance -> Get Subsystem`, atribuir a `DecisionTable` (referência ao Data Table importado de `Decisions_Prototype.json`); obter `UAgendaSchedulerSubsystem` e chamar `SetTodayAgenda` com um item ("Reunião sobre Duisburg"); registrar os 3 NPCs no `UDialogueRuntimeComponent` do jogador via `RegisterParticipant`.
- **Encadeamento de evento condicional** (fecha o gancho da opção `consult_eden`, ver `../Narrative/roteiro-reuniao-prototipo.md`): no Level Blueprint, bind ao evento `OnDelayedEffectManifested` do `UDecisionSystemSubsystem`. No handler, checar `SourceDecisionId == "raid_duisburg"` **e** `SourceOptionId == "consult_eden"`; se ambos baterem, chamar `UAgendaSchedulerSubsystem::AddAgendaItem` com um `FAgendaItem` de `ItemId = "eden_assessment"`, `Title = "Avaliação de Eden"`. Ao atender esse item, iniciar o diálogo em `StartDialogue(DialogueTable, "eden_assessment_intro")` — a decisão final (`eden_assessment`) é resolvida dentro desse fluxo, exatamente como a primeira reunião.

## BP_PlayerCharacter
- Base: `ACharacter` (herda do Pawn do template Third Person).
- Componentes adicionados: `UDialogueRuntimeComponent`, `UCharacterMemoryComponent` (não usado para o próprio jogador nesta versão, mas mantido por paridade de dados — pode ser removido se não fizer sentido para o líder).
- Input (Enhanced Input): `IA_Interact` (tecla E) — quando sobrepondo um NPC ou prop interativo, chama `Interact` no objeto focado.
- Grafo: `Interact` com um NPC chama `StartDialogue` no `DialogueRuntimeComponent`, passando a `DialogueTable` (Data Table de `DialogueNodes_Prototype.json`) e o `NodeId` inicial correspondente (`meeting_intro` para o primeiro NPC abordado; os NPCs subsequentes na mesma reunião não reiniciam o diálogo — a cena é conduzida por um único fluxo, ver nota abaixo).

> Nota de design: nesta cena específica os 3 NPCs falam dentro do **mesmo** grafo de diálogo (cada nó define `SpeakerCharacterId`), então a interação do jogador é com a "reunião" como uma unidade (iniciada ao interagir com a mesa/Ismay), não com cada NPC isoladamente. Cenas futuras com NPCs em conversas paralelas e independentes (Fase 3) usarão uma instância de diálogo por NPC.

## WBP_AgendaHUD (Widget)
- Exibido ao pressionar `IA_OpenAgenda` (tecla Tab).
- Bind: lista os itens de `UAgendaSchedulerSubsystem::GetTodayAgenda()`; cada item mostra `Title` e um indicador visual se `bAttended`.
- Botão "Avançar o dia": chama `AdvanceToNextDay`; desabilitado (ou com confirmação) se houver itens não atendidos, para tornar a escolha de ignorar a agenda deliberada, não acidental.

## WBP_DialogueHUD (Widget)
- Escuta `OnDialogueNodeEntered` do `DialogueRuntimeComponent`: atualiza texto do nome do falante (busca `DisplayName` na `NPCs_Prototype` Data Table pelo `SpeakerCharacterId`) e a fala (`SpeakerLine`).
- Gera um botão por `FDialogueResponse` do nó atual; `OnClicked` de cada botão chama `SelectResponse(ResponseId)`.
- Escuta `OnDialogueEnded`: fecha o widget.

## WBP_DocumentSheet (Widget)
- Aberto ao interagir com `BP_DocumentProp`.
- Mostra um texto estático representando o "documento" (pode reaproveiar `DescriptionText` da decisão `raid_duisburg` para o protótipo, já que a decisão em si já cobre a "assinatura").
- Três botões: **Assinar** (equivalente a `Approve` — chama `ResolveDecision` diretamente, caminho alternativo ao diálogo, demonstrando que o mesmo `DecisionSystemSubsystem` serve tanto a diálogo quanto a documento), **Recusar**, **Adiar assinatura** (fecha o widget sem resolver).

## WBP_StrategicMapSimplified (Widget)
- Aberto via `BP_StrategicMapTerminal`.
- Conteúdo mínimo: uma imagem estática do mapa do teatro europeu com 2–3 marcadores de texto sobrepostos, cada um lendo um indicador via `GetIndicatorValue` do `DecisionSystemSubsystem` (ex.: "Produção Industrial Alemã: valor atual"). Sem interação de ordens neste protótipo (mapa real de comando é Fase 3) — existe para provar a transição de nível/UI sem hitch perceptível, e para dar ao jogador visibilidade do efeito sistêmico da decisão que acabou de tomar.

## WBP_SaveLoadMenu (Widget)
- Dois botões: **Salvar** (chama `SavePrototype("PrototypeSlot")`) e **Carregar** (chama `LoadPrototype("PrototypeSlot")`, só habilitado se `DoesSlotExist` retornar true).
