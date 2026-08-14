# Dictocracy: 1942 — Documentação de Fase 1

> Simulador político-militar 3D em terceira pessoa, ambientado na Segunda
> Guerra Mundial (1942–1945). O jogador assume fisicamente o papel de um
> líder mundial e governa através de reuniões, decisões, um mapa
> estratégico e as consequências humanas de suas escolhas.

Este diretório contém a **Fase 1 — Documento de Design**, conforme
solicitado: nenhuma linha de código de jogo foi escrita. Tudo aqui é
design, arquitetura e planejamento, para aprovação antes da Fase 2
(protótipo).

## Como navegar

| Documento | Conteúdo |
|---|---|
| [`docs/00-posicionamento-e-tela-inicial.md`](docs/00-posicionamento-e-tela-inicial.md) | Postura crítica do jogo, texto da tela inicial de aviso, regras de linha vermelha que todo o resto do design obedece |
| [`docs/01-resumo-executivo.md`](docs/01-resumo-executivo.md) | Visão de produto, público-alvo, pilares de experiência, concorrência |
| [`docs/02-game-design-document.md`](docs/02-game-design-document.md) | GDD completo: loop, líderes, sistemas exclusivos por campanha, personagens, informação imperfeita, mapa/guerra, diplomacia, os 20 finais, interface, áudio |
| [`docs/03-vertical-slice-e-loop.md`](docs/03-vertical-slice-e-loop.md) | Definição do vertical slice (30–45 min) e o loop principal passo a passo com exemplo jogável |
| [`docs/04-arquitetura-tecnica.md`](docs/04-arquitetura-tecnica.md) | Arquitetura UE5, estrutura de pastas/módulos, modelo de dados (líderes, NPCs, eventos, decisões), lista de sistemas, IA, save |
| [`docs/05-plano-visual.md`](docs/05-plano-visual.md) | Plano visual (Nanite/Lumen/VSM), ambientes, personagens/MetaHuman, áudio, interface, acessibilidade |
| [`docs/06-plano-producao.md`](docs/06-plano-producao.md) | Sprints por fase, estimativa de equipe/tempo/orçamento, riscos, critérios de diversão do protótipo, o que fica fora da v1 |

## Estado do projeto

- ✅ Fase 1 — Documento de Design (este diretório)
- ⏳ Fase 2 — Protótipo (aguardando aprovação)
- ⏳ Fase 3 — Vertical Slice
- ⏳ Fase 4 — Produção do jogo-base

**Nenhum código de gameplay, projeto Unreal ou asset final foi criado
nesta fase.** Por quê: o pedido original pede explicitamente documentação
primeiro, com aprovação antes da implementação; e começar pelo código
antes de travar o modelo de dados, os sistemas e a postura narrativa
crítica do jogo geraria retrabalho caro num projeto deste tamanho.
