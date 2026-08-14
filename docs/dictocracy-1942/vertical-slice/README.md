# Fase 3 — Vertical Slice: "A Véspera de Alamein"

## O que é isto
Desenvolvimento do roteiro e dos dados de conteúdo para o vertical slice definido em `../03-vertical-slice-e-loop.md`: 30–45 minutos jogáveis, líder Churchill, outubro de 1942, qualidade próxima da final. Este pacote **não substitui** o protótipo (`../prototype/`) — a primeira reunião do slice **reaproveita diretamente** a cena "A Decisão de Duisburg" já construída lá (mesmos dados, mesmo sistema), porque o vertical slice é sobre elevar produção e adicionar as peças que faltavam, não recomeçar do zero.

## Mesmo aviso do resto do projeto
Nada aqui foi produzido em engine — não há UE5 neste ambiente. Este é o roteiro completo, os dados de conteúdo estruturados, e a especificação de ambiente/produção — o material que a Fase 3 (`../07-producao-e-riscos.md`, Fase 3, sprints 1–8) precisa para ir a produção de arte/áudio/animação em qualidade final.

## O que falta do slice, em relação ao que o protótipo já cobre

| Requisito do slice (`../03-vertical-slice-e-loop.md`) | Status |
|---|---|
| Exploração 3D de 2 ambientes interligados | Especificado em `02-especificacao-ambientes.md` (Downing Street + Cabinet War Rooms) — produção de arte é Fase 3 |
| Duas reuniões, elencos distintos | Reunião 1 = Duisburg (protótipo, 3 NPCs). **Reunião 2 = nova**, briefing de inteligência (2 NPCs novos) — `01-roteiro-completo.md` |
| Pronunciamento com escolha de tom | **Novo** — transmissão de rádio BBC, `01-roteiro-completo.md` |
| Crise militar em tempo real narrativo | **Novo** — decisão sobre Alamein com informação contraditória, `01-roteiro-completo.md` + `Data/Decisions_VerticalSlice.json` |
| Decisão moral pesada | Reaproveitada do protótipo (`raid_duisburg`) |
| Mapa estratégico simplificado, navegável | Já especificado no protótipo (`WBP_StrategicMapSimplified`) — sem mudança de escopo necessária para o slice |
| 5 NPCs importantes | Ismay, Brooke, Eden (protótipo) + **Menzies, Aldous** (novos, `Data/NPCs_VerticalSlice.csv`) |
| Consequências visíveis | `ADamageStateManager` (protótipo) + novo indicador `ElAlameinReadiness` reagindo à crise |
| Dois encerramentos do slice | **Novo** — `Data/Endings_VerticalSlice.json` |
| Gráficos/áudio/UI próximos da qualidade final | Fora do escopo deste pacote de documentação — é produção de arte real, não algo que se escreve |

## Arquivos
- `01-roteiro-completo.md` — roteiro em prosa das cenas novas (briefing de inteligência, pronunciamento, crise de Alamein, os dois encerramentos), com a mesma marcação de proveniência histórica do resto do projeto.
- `02-especificacao-ambientes.md` — Downing Street + Cabinet War Rooms, progressão de dano, transição entre os dois.
- `03-especificacao-blueprints-slice.md` — incremento sobre a especificação de Blueprint do protótipo: níveis novos, continuidade de registro de participantes entre cenas, encadeamento de agenda, segundo `ADamageStateManager`, avaliação do gate de encerramento.
- `04-testes-slice.md` — checklist específico do slice (bifurcações de diálogo, cobertura dos dois gates de final, continuidade de estado entre cenas).
- `Data/NPCs_VerticalSlice.csv` — os 2 NPCs novos (Menzies, Aldous), no mesmo formato `FCharacterData` do protótipo.
- `Data/Decisions_VerticalSlice.json` — decisão da crise de Alamein + "decisão" do tom do pronunciamento (mecanicamente é uma decisão como qualquer outra, mesmo sistema).
- `Data/DialogueNodes_VerticalSlice.json` — grafo de diálogo das 3 cenas novas (pronunciamento, briefing de inteligência com bifurcação de perguntas, decisão de Alamein).
- `Data/Endings_VerticalSlice.json` — os dois encerramentos do slice, no formato reduzido descrito (não são os 20 finais globais do jogo completo — são encerramentos **locais do slice**, usados para demonstrar o sistema de finais em escala mínima, com gate por indicador único em vez do avaliador genérico de `FEndingData.GlobalConditions`, que é escopo de Fase 4).
