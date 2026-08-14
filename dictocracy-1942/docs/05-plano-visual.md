# 5. Plano visual, áudio e interface

## 5.1 Direção visual — princípios

Realismo cinematográfico, historicamente fundamentado, nunca
"showreel de efeitos". A régua de qualidade é um drama de época bem
produzido (referências de tom, não de conteúdo: fotografia de produção
de filmes históricos sóbrios), não um jogo de ação. Nenhum ambiente deve
parecer um asset pack combinado às pressas — cada sala tem uma razão
histórica e narrativa para existir do jeito que existe.

## 5.2 Pipeline técnico (UE5)

- **Nanite** para geometria arquitetônica de alta densidade (talha de
  madeira, alvenaria, ornamentos de época) sem orçamento manual de
  polígonos por objeto.
- **Lumen** para iluminação global e reflexos — crítico porque grande
  parte do jogo acontece em interiores com luz natural variável (manhã
  em Downing Street, luz artificial num bunker) e Lumen permite que a
  luz mude de forma crível ao longo do dia/semana simulados.
- **Virtual Shadow Maps** para sombras de alta resolução consistentes
  entre a escala de um documento na mesa e a escala de um edifício
  inteiro visível pela janela.
- **Materiais PBR** com biblioteca própria de superfícies de época
  (madeira envernizada, lã de uniforme, vidro de janela cego por
  blackout, metal de rádio/telefone).
- **Texturas de alta resolução** com um padrão mínimo definido por
  categoria (herói/mão × ambiente distante) para controlar orçamento de
  memória.
- **Iluminação volumétrica** usada com moderação — poeira em feixe de
  luz num bunker, fumaça distante pela janela — nunca como "efeito
  bonito" sem motivo diegético.
- **Decals** para desgaste, umidade, poeira, marcas de bota, dano — a
  ferramenta principal para o requisito "ambientes não excessivamente
  limpos" (ver 5.4).
- **Chaos Physics** para interação física pontual (objetos derrubados,
  portas, papéis) — não para destruição em larga escala, fora do escopo
  deste jogo.
- **Niagara** para efeitos ambientais discretos (poeira, fumaça distante,
  chuva) — regra explícita: nenhum efeito de partícula é usado para
  tornar violência contra civis visualmente espetacular (linha vermelha
  #2/#5, ver `00-posicionamento`); cenas desse tipo, quando existem,
  usam elipse, som e reação de personagem, não renderização direta.
- **World Partition / level streaming** para transição contínua entre
  ambiente de comando e mapa estratégico.
- **DLSS / FSR / XeSS** suportados desde a Fase 2 como parte do sistema
  de escalabilidade, não adicionados no fim do projeto.

## 5.3 Escalabilidade gráfica

Perfis de qualidade (Baixo/Médio/Alto/Cinematográfico) controlando
independentemente: densidade de Nanite, qualidade de Lumen (incluindo
fallback para Lumen por software em hardware sem ray tracing de
hardware), resolução de sombra, densidade de multidão/figuração ambiente
nos corredores, e distância de streaming de nível. Meta de desempenho
completa em `docs/06-plano-producao.md`, §Meta de desempenho.

## 5.4 Ambientes

Cada ambiente segue um checklist de "vivido, não vazio":

- Arquitetura fundamentada em referência histórica real (planta,
  fotografia de época, ou reconstrução documentada).
- Mobiliário e objetos coerentes com o período e a função da sala.
- Mapas físicos de operação nas paredes, atualizados visualmente
  conforme a guerra avança (uma frente que recua no jogo recua também no
  mapa físico da parede, quando essa sala for revisitada).
- Telefones, rádios e máquinas de escrever com interação funcional
  (affordance real, não só decoração).
- Documentos manipuláveis fisicamente pelo jogador.
- Materiais realistas de vidro, madeira, tecido e metal.
- Iluminação natural crível por hora do dia simulada.
- Marcas de uso e desgaste (decals, ver 5.2).
- Som ambiente detalhado e específico do espaço (ver 5.6).
- Funcionários circulando e trabalhando ao fundo — figuração com
  animação de ciclo de trabalho, não estátuas.
- Mudança visual progressiva conforme a guerra avança (dano de
  bombardeio, blackout, racionamento visível em objetos de cena).

Lista de ambientes principais do jogo-base — ver `docs/02`, §2.4, para o
motivo narrativo de cada um:

**Alemanha**: Chancelaria do Reich · quartel-general militar · residência
oficial · trem de comando · Führerbunker (com dano progressivo).

**Reino Unido**: Gabinetes de Guerra (subterrâneo) · Downing Street ·
Parlamento · salas subterrâneas de comando · centro de inteligência
(Bletchley Park).

**Estados Unidos**: Casa Branca · Salão Oval · sala de mapas · Congresso
· centro militar · instalações do programa nuclear.

**União Soviética**: Kremlin · sala de comando · escritório de Stalin ·
centro militar · instalações industriais e ferroviárias (relocadas).

## 5.5 Personagens

- Anatomia e proporções humanas realistas; sem estilização caricatural.
- Pele com subsurface scattering e detalhe de poro/textura natural.
- Olhos com posicionamento e brilho corretos — crítico para cenas de
  diálogo em primeiro plano, onde o pilar "você está lá" depende de
  contato visual crível.
- Cabelo com fidelidade adequada ao plano de câmera mais próximo em que
  aparece.
- Uniformes e vestuário historicamente coerentes, com simulação de
  tecido fisicamente convincente (peso, caimento, amassado).
- Expressões faciais sutis e sincronização labial de qualidade —
  **MetaHuman Animator** como base técnica candidata para captura de
  performance, com todos os modelos finais customizados e otimizados
  (não MetaHumans genéricos "de fábrica" em personagens principais).
- Animação corporal variando por idade, saúde e personalidade — a
  deterioração de saúde de Roosevelt, por exemplo, precisa ser visível
  no corpo, não só num indicador de UI.
- Sistema de olhar/atenção durante diálogo (personagens olham para o
  jogador, entre si, para documentos — não têm olhar fixo genérico).
- Reações físicas e emocionais a decisões do jogador, coerentes com o
  perfil de `CharacterDefinition` (`docs/04`, §4.4.2).

**Restrições legais de produção, obrigatórias, não opcionais:**

- Não usar aparência protegida de atores de cinema vivos ou ligados a
  produções específicas.
- Personagens históricos reais devem ser construídos a partir de
  referência fotográfica em domínio público ou devidamente licenciada,
  com **revisão jurídica formal antes do lançamento** — não apenas antes
  do anúncio (ver `docs/06-plano-producao.md`, §Riscos jurídicos).
- Personagens fictícios de preenchimento (NPCs secundários sem base
  histórica direta) não podem ser modelados visualmente a partir de uma
  pessoa real identificável, viva ou falecida recentemente, sem liberação.

## 5.6 Áudio

- Trilha orquestral dinâmica, sóbria, com tema distinto por país/
  campanha, reagindo à tensão política e militar corrente — nunca
  triunfal para atos vedados pela regra de linha vermelha #1.
- Som realista de espaço: reverberação de bunker vs. sala revestida de
  madeira vs. corredor de pedra; rádio com filtragem de época; telefone
  com ruído de linha period-correct.
- Vozes de dublagem de alta qualidade, com direção de atuação histórica
  informada (não imitação caricatural de sotaque).
- Áudio espacial 3D para ambientes com múltiplos focos de conversa
  simultânea (sala de reunião cheia).
- Mudança musical dinâmica por estado de tensão (calmo → crise → decisão
  de âncora), com sistema de camadas (stems) em vez de faixas fixas, para
  transição sem corte perceptível.
- **Silêncio deliberado** nas decisões mais graves do jogo — regra de
  design explícita, não ausência de conteúdo: a trilha se cala antes de
  uma decisão de peso máximo (uso de arma nuclear, ordem ligada a crime
  de guerra, uma execução), deixando só ambiente e a própria cena.
- **Nenhum discurso, gravação ou música histórica real é usado sem
  confirmação prévia de licença ou domínio público** — toda locução em
  cena que reconstitui um discurso histórico é regravada por ator sob
  direção, nunca um sample de arquivo original, salvo confirmação
  jurídica explícita por título específico.

## 5.7 Interface

Ver também `docs/02`, §2.12, para a filosofia de UI diegética. Aqui, os
requisitos técnicos e de acessibilidade:

- Toda a UI de decisão/reunião construída como objetos físicos
  manipuláveis em UMG 3D-anchored quando possível (documento na mesa) e
  como painel 2D tradicional quando a informação for inerentemente
  abstrata (mapa estratégico, Codex).
- **Acessibilidade obrigatória desde o protótipo**, não retrofit:
  - Escala de fonte ajustável sem quebra de layout.
  - Modo de alto contraste.
  - Legendas completas, incluindo indicação de quem fala e tom
    (ex.: "[sussurrando]").
  - Paletas alternativas para as três formas mais comuns de daltonismo,
    validadas nos indicadores de UI que hoje dependem só de cor
    (barras de moral, mapa de território).
  - Redução de movimento (câmera, tremular de tela, partículas) como
    opção global.
  - Modo de interface simplificada: converte a manipulação física de
    documentos numa lista de decisão clara, para jogadores com
    limitação motora ou cognitiva, sem remover o conteúdo da decisão em
    si.
- Usabilidade nunca sacrificada por estética de época — todo elemento
  "vintage" da UI passa por teste de legibilidade antes de aprovação.

## 5.8 Meta de arte por fase

- **Protótipo (Fase 2)**: greybox funcional + um espaço "hero"
  (Gabinete de Guerra britânico) em qualidade representativa, para
  validar pipeline antes de escalar produção de arte.
- **Vertical Slice (Fase 3)**: qualidade de arte final ou muito próxima
  em 100% do conteúdo do slice (ver `docs/03`, §3.1).
- **Produção (Fase 4)**: produção em escala dos ambientes e personagens
  restantes reaproveitando pipeline e biblioteca de materiais validados
  no slice — não reinventando processo por campanha.
