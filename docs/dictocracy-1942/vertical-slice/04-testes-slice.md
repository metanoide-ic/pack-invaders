# Testes — Vertical Slice

Complementa `../prototype/Testing/guia-de-execucao-e-testes.md` (não repete os itens já cobertos lá — `DecisionSystem`, `CharacterMemory`, `AgendaScheduler`, `SaveGameSystem`, `ADamageStateManager` continuam valendo como estão, o slice só reusa esses sistemas com dados novos).

## Checklist específico do slice

- [ ] **Continuidade de participantes entre cenas** (ver `03-especificacao-blueprints-slice.md`): completar a Cena 2 (Duisburg) até o fim, depois ir à Cena 5 (decisão de Alamein) e escolher `decide_delegate`. Confirmar, via debugger/log, que o `CharacterMemoryComponent` de **Brooke** recebe o impacto de `-2`, mesmo ele não estando fisicamente presente na Cena 5 — se isso falhar silenciosamente (nenhum log de erro, só o impacto não acontece), o registro de participantes foi resetado entre cenas em algum ponto da implementação, e isso precisa ser corrigido antes de aceitar o slice.
- [ ] **Bifurcação de perguntas na Cena 4 não perde estado**: entrar em `briefing_intro` → `aldous_disagreement` → escolher **as duas** perguntas em sessões de teste separadas (`ask_menzies_source` e depois, em outra sessão, `ask_aldous_coverage`) e confirmar que ambas convergem corretamente em `alamein_decision` sem pular ou duplicar falas.
- [ ] **Cobertura de gate dos dois finais**: resolver `alamein_orders` com cada uma das 4 opções, em 4 sessões separadas, avançar 2 dias (`AdvanceToNextDay` duas vezes) e confirmar contra `Data/Endings_VerticalSlice.json`:
  - `approve_as_planned` → `ElAlameinReadiness = -4` → `ending_shadows_of_doubt`
  - `delay_48h` → `ElAlameinReadiness = -2` → `ending_shadows_of_doubt`
  - `reconnaissance_in_force` → `ElAlameinReadiness = 0` (+1 imediato, -1 atrasado) → `ending_war_continues`
  - `delegate_to_montgomery` → `ElAlameinReadiness = -1` → `ending_shadows_of_doubt`
  - Confirmar que os dois gates (`>= 0` e `< 0`) são de fato complementares e mutuamente exclusivos para todo valor inteiro possível — nenhuma das 4 opções deveria conseguir cair em uma lacuna entre os dois gates (matematicamente não há lacuna aqui, mas qualquer edição futura nos deltas precisa reconfirmar isso manualmente, não há avaliador automático de cobertura).
- [ ] **WarRoomsWearLevel muda o ambiente visualmente**: confirmar que o segundo `ADamageStateManager` (observando `WarRoomsWearLevel`) transita para o estado "Sob pressão" imediatamente após `alamein_orders` resolver, independente de qual opção foi escolhida (todas somam +2).
- [ ] **Tom do pronunciamento não afeta o gate do final, só o texto**: resolver `radio_pronouncement` com `comforting` e depois com `resolute` em duas sessões com o **mesmo** resultado de `alamein_orders` — confirmar que ambas chegam ao mesmo `EndingId`, e que a única diferença esperada é de leitura/tom (não testável automaticamente por Automation Framework — é checagem de conteúdo/escrita, feita por leitura humana do texto final exibido).
- [ ] **Tempo total de sessão dentro da janela**: cronometrar uma sessão completa (Cena 2 até o encerramento) executada por alguém que não seja da equipe de desenvolvimento — deve cair entre 30 e 45 minutos (ver `../03-vertical-slice-e-loop.md`). Se estourar consistentemente, é sinal de ritmo, não de bug — revisar no roteiro, não no código.

## O que este slice deliberadamente não valida
Qualidade de arte, animação facial, VO — nada disso existe ainda como asset real (ver `02-especificacao-ambientes.md` e `../06-sistemas-e-visual.md`). O gate de "vertical slice aprovado" definido em `../07-producao-e-riscos.md` (Fase 3, sprint 8: "validação externa... antes de abrir Fase 4") só pode ser aplicado depois que a produção de arte/áudio real cobrir esse roteiro — este pacote de documentação prepara o terreno de sistema e conteúdo, não substitui a produção visual.
