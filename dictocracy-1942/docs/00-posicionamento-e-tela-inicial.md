# Posicionamento narrativo e tela inicial

Este documento é a **constituição** do projeto: toda mecânica, todo texto
de decisão e todo final descritos nos outros documentos precisam obedecer
às regras daqui. Em caso de conflito entre "isso seria divertido" e "isso
está aqui", vence este documento.

## 1. Postura do jogo

Dictocracy: 1942 é uma obra de **história crítica e adulta**, não uma
fantasia de poder. O jogador interpreta figuras históricas reais,
incluindo responsáveis diretos por crimes contra a humanidade, para
entender **como** o poder autoritário e a máquina de guerra funcionavam
por dentro — não para revivê-los como conquista.

Regras inegociáveis de design, válidas para toda a produção:

1. **Nenhum regime autoritário, fascista, nazista ou comunista-autoritário
   é apresentado como aspiracional.** Uniformes, símbolos e retórica são
   reconstituídos com precisão histórica, nunca com glamour.
2. **Perseguição, extermínio e sofrimento civil nunca são recompensa.**
   Não existe conquista, marco ou troféu de jogo vinculado a esses atos.
   Eles só aparecem como decisões que o jogador pode tentar deter, ou como
   consequências que o jogo mostra sem eufemismo.
3. **Domínio mundial, genocídio e uso de armas nucleares nunca são
   "finais felizes".** Podem ser vitórias militares ou políticas dentro da
   ficção, mas o epílogo sempre expõe o custo: repressão, resistência
   armada, fome, colapso econômico, instabilidade geracional.
4. **Interromper um crime em andamento salva vidas na simulação e muda o
   rumo da história — mas não apaga a responsabilidade por crimes já
   cometidos antes daquele ponto.** Um Hitler que desmonta a Gestapo em
   1943 ainda é julgado, na narrativa e nos textos de epílogo, pelo que
   aconteceu até ali.
5. **Vítimas não são estatística de barra de progresso.** Todo indicador
   numérico de mortes civis, deslocamento populacional ou repressão é
   acompanhado, em algum ponto da campanha, por um relato humano
   individual — um relatório, uma carta, um testemunho — nunca apenas um
   número que sobe ou desce.
6. **A IA e os personagens nunca elogiam o jogador por crueldade.**
   Personagens leais podem obedecer por medo ou ambição; isso é mostrado
   como corrosivo, não como aprovação moral do jogo.
7. **Toda alegação de fato histórico é rastreável** a uma classificação
   interna (ver §4) e, sempre que aplicável, a uma fonte. Nenhuma citação
   é inventada e atribuída a uma pessoa real.

## 2. Texto da tela inicial (conteúdo final para implementação futura)

Exibido obrigatoriamente antes do primeiro carregamento de qualquer
campanha, sem opção de pular na primeira execução; disponível depois em
Opções → Sobre este jogo.

> **DICTOCRACY: 1942**
> **Antes de começar**
>
> Este jogo retrata líderes, regimes, ideologias e eventos reais da
> Segunda Guerra Mundial, incluindo o Holocausto, crimes de guerra e
> regimes totalitários.
>
> A equipe de desenvolvimento **não apoia, endossa ou promove** nenhuma
> das ideologias, regimes ou atos representados — nazismo, fascismo,
> imperialismo, comunismo autoritário, racismo, antissemitismo ou
> genocídio incluídos.
>
> Para permitir a exploração de decisões de poder, algumas situações,
> personagens secundários e diálogos foram **dramatizados** para fins de
> jogo. Eventos, datas e resultados historicamente documentados estão
> claramente identificados dentro do jogo (Codex → Fontes).
>
> Este jogo permite ao jogador interpretar responsáveis históricos por
> crimes contra a humanidade. **Nenhuma decisão tomada durante o jogo
> reescreve ou apaga crimes já cometidos antes dela.** Interromper uma
> política de perseguição impede mortes futuras na simulação; não
> absolve o personagem do que já foi feito.
>
> Se este tema for sensível para você, ou se você é sobrevivente ou
> descendente de sobreviventes de perseguição, temos uma versão com
> conteúdo reduzido em Opções → Conteúdo → Modo Documentário Leve, que
> mantém o sistema político e militar sem exibir renderizações gráficas
> de violência contra civis.
>
> [ Li e compreendo ] [ Modo Documentário Leve ] [ Sair ]

Este texto reaparece, resumido em uma linha, em telas de carregamento de
campanhas com conteúdo especialmente sensível (ex.: eventos ligados ao
Holocausto na campanha de Hitler; expurgos e gulags na de Stalin).

## 3. Avisos de conteúdo por campanha

Cada campanha carrega um selo de conteúdo, visível na tela de seleção de
líder, além da classificação etária oficial:

| Campanha | Selo de conteúdo |
|---|---|
| Hitler | Perseguição política e étnica, violência de estado, ideologia extremista representada criticamente |
| Stalin | Repressão política, deportações forçadas, violência de estado |
| Churchill | Violência de guerra, decisões de bombardeio com baixas civis |
| Roosevelt | Segregação racial, internamento de civis, violência de guerra |

## 4. Classificação interna de conteúdo histórico

Todo evento, decisão, diálogo e estatística no banco de dados do jogo
carrega uma das quatro tags abaixo (ver também
`docs/04-arquitetura-tecnica.md`, modelo de dados de Evento/Decisão).
Essa tag é visível ao jogador no **Codex Histórico** dentro do jogo, para
que fatos e ficção nunca fiquem indistinguíveis:

- **Histórico documentado** — ocorreu, com data e fonte primária ou
  historiográfica confiável indicada.
- **Historicamente plausível** — não documentado ponto a ponto, mas
  consistente com o consenso historiográfico sobre a época, o local e as
  pessoas envolvidas (ex.: o teor provável de uma reunião de gabinete sem
  ata sobrevivente).
- **História alternativa** — consequência direta de uma decisão do
  jogador que diverge do que aconteceu; o jogo marca claramente o ponto
  de divergência ("A partir daqui, esta linha do tempo é hipotética").
- **Ficção dramática** — elementos criados para servir à jogabilidade
  (nomes de NPCs secundários, diálogos de preenchimento, ambientação),
  sem pretensão de registro histórico.

Nenhum evento da categoria "Histórico documentado" pode ser alterado por
edição de conteúdo pós-lançamento sem revisão da consultoria histórica —
ver processo em `docs/06-plano-producao.md`, §Riscos históricos e
jurídicos.

## 5. O que isso implica para o design (resumo operacional)

- Finais de "vitória total" sempre têm epílogo mostrando o preço pago
  (ver lista completa em `docs/02-game-design-document.md`, §Finais).
- Não existe conquista/troféu com nome como "Solução Final" ou equivalente
  tratado como objetivo de jogo — esses eventos existem como decisões que
  o jogador pode tentar impedir, atrasar ou (se assumir o papel) confrontar
  depois, nunca como meta a cumprir.
- Toda mecânica de "reduzir resistência interna" ou "aumentar repressão"
  tem custo visível em opinião pública, lealdade e, em algum momento da
  campanha, um evento narrativo que mostra o rosto humano do custo — nunca
  é uma escolha estrategicamente "grátis".
- A dublagem e a trilha nunca usam gravações de discursos históricos reais
  sem confirmação de domínio público ou licença (ver
  `docs/05-plano-visual.md`, §Áudio, e `docs/06-plano-producao.md`,
  §Riscos jurídicos).
