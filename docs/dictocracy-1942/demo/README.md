# Demonstração Jogável — "Véspera de Alamein"

`index.html` é uma página HTML/CSS/JS autocontida (sem build, sem dependências externas — abre direto no navegador) que implementa em JavaScript puro a mesma lógica especificada para os módulos C++ do protótipo/vertical slice:

- `resolveDecision` / `advanceDay` → espelha `UDecisionSystemSubsystem` (efeito imediato aplicado na hora, efeito atrasado agendado e disparado só no dia certo).
- `applyLoyaltyImpact` → espelha `UCharacterMemoryComponent` (lealdade por NPC, clamp 0–100).
- `addAgendaItem` (idempotente por `id`) → espelha `UAgendaSchedulerSubsystem::AddAgendaItem`.
- Grafo de diálogo (`DIALOGUE`) → espelha `FDialogueNode`/`FDialogueResponse`, não-binário, com `loyaltyTarget` desacoplado do falante do nó (mesma correção aplicada em `DialogueRuntimeComponent.cpp`).
- Gate de final por indicador único → espelha `Data/Endings_VerticalSlice.json`.

## O que isto é
Uma forma de **sentir o loop** (agenda → reunião → decisão → consequência atrasada → final) com o conteúdo real já escrito para o projeto, sem esperar a Fase 2/3 serem produzidas de verdade em Unreal Engine 5. Os dados embutidos (`NPCS`, `DECISIONS`, `DIALOGUE`, `ENDINGS`) são a mesma informação de `../prototype/Data/` e `../vertical-slice/Data/` — qualquer edição de conteúdo feita lá **não se propaga automaticamente para cá**; ver "Como manter sincronizado" abaixo.

## O que isto não é
Não é o jogo em Unreal Engine 5. Sem terceira pessoa, sem MetaHuman, sem ambiente 3D, sem `WorldSim`/`CountryAI`/`InfoFidelity`. É uma demonstração de sistema, não um substituto para a produção real especificada em `../04-arquitetura-tecnica.md`.

## Como abrir
Abrir `index.html` diretamente em qualquer navegador moderno — não precisa de servidor, não faz nenhuma chamada de rede (fontes embutidas como `data:` URI, licença OFL — Special Elite, Spectral, JetBrains Mono, via Google Fonts).

## Como manter sincronizado
Se `Data/Decisions_Prototype.json`, `Data/DialogueNodes_Prototype.json`, `Data/Decisions_VerticalSlice.json`, `Data/DialogueNodes_VerticalSlice.json` ou `Data/Endings_VerticalSlice.json` mudarem, os objetos `DECISIONS`/`DIALOGUE`/`ENDINGS`/`NPCS` no `<script>` de `index.html` precisam ser atualizados manualmente para continuar refletindo o conteúdo oficial — não há passo de build automatizado entre os dois. Marcar essa sincronização como item de checklist sempre que o conteúdo de `raid_duisburg`, `eden_assessment`, `radio_pronouncement` ou `alamein_orders` for editado.

## Painel "Sala de Situação"
Oculto por padrão, ativável no topo da página — mostra os indicadores brutos, a lealdade de cada NPC e a fila de efeitos atrasados pendentes. Existe para uso de desenvolvimento/design, não para o jogador: reforça deliberadamente, ao ficar escondido por padrão, a mesma regra de informação imperfeita do GDD (`../01-gdd.md`, pilar 2).
