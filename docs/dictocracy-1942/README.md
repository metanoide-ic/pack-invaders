# DICTOCRACY: 1942 — Documentação de Design (Fase 1)

Entrega solicitada pelo diretor do projeto: documento de design completo, **antes** de qualquer implementação. Nenhum código de produção é entregue nesta fase. A implementação só começa após aprovação explícita, e sempre pelo protótipo (Fase 2) — nunca pelo jogo completo.

## Índice

1. [`00-resumo-executivo.md`](./00-resumo-executivo.md) — Resumo executivo do jogo.
2. [`01-gdd.md`](./01-gdd.md) — Game Design Document: visão, público-alvo, pilares, comparação com concorrentes, mecânicas centrais, estrutura narrativa.
3. [`02-campanhas.md`](./02-campanhas.md) — Sistemas exclusivos das 4 campanhas do jogo-base (Hitler, Churchill, Roosevelt, Stalin) e nota sobre campanhas de expansão.
4. [`03-vertical-slice-e-loop.md`](./03-vertical-slice-e-loop.md) — Definição do vertical slice e loop principal.
5. [`04-arquitetura-tecnica.md`](./04-arquitetura-tecnica.md) — Arquitetura técnica para Unreal Engine 5, módulos, estrutura de pastas.
6. [`05-modelo-de-dados.md`](./05-modelo-de-dados.md) — Modelo de dados para líderes, NPCs, decisões, eventos, países, finais.
7. [`06-sistemas-e-visual.md`](./06-sistemas-e-visual.md) — Lista de sistemas necessários e plano visual para realismo.
8. [`07-producao-e-riscos.md`](./07-producao-e-riscos.md) — Plano de produção por sprints, estimativa de equipe/tempo/orçamento, riscos, critérios de diversão do protótipo, escopo fora da v1.
9. [`08-finais-e-conformidade.md`](./08-finais-e-conformidade.md) — Tela inicial obrigatória, lista dos 20 finais globais, conformidade internacional.
10. [`bibliografia.md`](./bibliografia.md) — Fontes históricas por tópico para todo o conteúdo já escrito (protótipo + vertical slice), ponto de partida para a revisão por historiador consultor — não inventa citações, sinaliza onde a confiança é baixa.

## Posicionamento inegociável (resumo)

- O jogo **não glorifica** nazismo, fascismo, comunismo autoritário, imperialismo, racismo, antissemitismo, genocídio ou crimes de guerra.
- Dominação mundial, genocídio e uso de armas nucleares **nunca** são apresentados como final feliz.
- Crimes cometidos por um líder jogável **nunca são apagados** por comportamento posterior — o `HistoricalLedger` é permanente.
- Todo conteúdo histórico, especulativo e ficcional é **identificado explicitamente** por proveniência.

## Veja funcionando

[`demo/index.html`](./demo/index.html) — demonstração jogável no navegador (sem build, sem dependências) do loop de decisão com o conteúdo real do projeto: a cena de Duisburg, o encadeamento com Eden, o pronunciamento de rádio e a crise de Alamein, com os dois encerramentos do vertical slice. **Não é o jogo em Unreal Engine 5** — é a lógica dos sistemas (`DecisionSystem`, `CharacterMemory`, `AgendaScheduler`, diálogo não-binário) reimplementada em JavaScript puro para ser sentida sem esperar produção em engine. Ver `demo/README.md` para o que isso é e não é, e como manter sincronizado com os dados oficiais.

## Status

**Fase 1 aprovada. Fase 2 (Protótipo) e Fase 3 (Vertical Slice) com material de engenharia completo — ver `prototype/` e `vertical-slice/`.**

O material de engenharia da Fase 2 está em [`prototype/`](./prototype/README.md): módulos C++ (`DecisionSystem`, `CharacterMemory`, `DialogueRuntime`, `AgendaScheduler`, `SaveGameSystem`, `Environment`), testes de Automation Framework, dados de conteúdo (5 NPCs, 2 decisões encadeadas, cenas de diálogo não-binárias completas), especificação de Blueprints/nível, plano de assets licenciados, pipeline de CI e protocolo de playtest.

O material da Fase 3 está em [`vertical-slice/`](./vertical-slice/README.md): roteiro completo das 30–45 minutos (Churchill, outubro de 1942), 2 NPCs novos, 2 decisões novas, 2 encerramentos locais, especificação de ambiente e de Blueprint incremental.

**Importante:** este ambiente de desenvolvimento não tem o Unreal Engine 5 instalado — todo o código C++ foi escrito seguindo as convenções da UE5 5.4+ mas **não foi compilado nem testado em runtime**. Isso está marcado em cada arquivo (`// STATUS: escrito, não compilado neste ambiente`) e detalhado em `prototype/README.md`. O "protótipo funcional" exigido pelo GDD só existe de fato após alguém com o Editor instalado seguir `prototype/00-setup-guia.md`, compilar, e validar contra `prototype/Testing/guia-de-execucao-e-testes.md`. A lógica em si, porém, já foi validada fora da engine — ver `demo/` acima.
