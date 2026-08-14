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

## Posicionamento inegociável (resumo)

- O jogo **não glorifica** nazismo, fascismo, comunismo autoritário, imperialismo, racismo, antissemitismo, genocídio ou crimes de guerra.
- Dominação mundial, genocídio e uso de armas nucleares **nunca** são apresentados como final feliz.
- Crimes cometidos por um líder jogável **nunca são apagados** por comportamento posterior — o `HistoricalLedger` é permanente.
- Todo conteúdo histórico, especulativo e ficcional é **identificado explicitamente** por proveniência.

## Status

**Fase 1 concluída — aguardando aprovação para iniciar Fase 2 (Protótipo).**

Nenhuma linha de código de produção, nenhum asset final e nenhuma implementação de sistema foram criados nesta entrega, conforme solicitado. Próximo passo, mediante aprovação: abrir a Fase 2 em etapas pequenas, testáveis e documentadas, começando por locomoção em terceira pessoa + um ambiente + um assistente + uma reunião com três NPCs, conforme especificado em `03-vertical-slice-e-loop.md` e `07-producao-e-riscos.md`.
