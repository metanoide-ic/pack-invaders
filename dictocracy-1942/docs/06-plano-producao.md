# 6. Plano de produção

## 6.1 Fases e sprints

Sprints de 2 semanas. Datas são relativas ao início do projeto (S1 = 
Sprint 1), não datas de calendário — a calibrar na aprovação deste
documento.

### Fase 1 — Documento de Design (concluída nesta entrega)

Este diretório. Sem sprints — entrega única, sujeita a revisão e
aprovação antes de destravar a Fase 2.

### Fase 2 — Protótipo (estimativa: 6 sprints / 12 semanas)

| Sprint | Foco | Entregável verificável |
|---|---|---|
| S1 | Setup de projeto UE5, módulos `DictocracyCore`/`Presentation`/`EditorTools` vazios mas compilando, pipeline de build/CI | Projeto compila em CI a cada commit |
| S2 | Pawn de exploração 3P + 1 ambiente greybox (Gabinete de Guerra) + câmera de cena de diálogo básica | Jogador anda, entra em modo de diálogo, sai |
| S3 | `DTCDecisionAsset` funcionando fim-a-fim: 1 decisão real carregada de Data Asset, avaliada, com efeito mensurável no `DTCWorldState` | Uma decisão de teste altera um indicador salvo |
| S4 | Reunião com 3 NPCs (IA de personagem mínima: escuta gatilho, dispara linha, registra memória) + 1 documento assinável | Reunião dos 3 NPCs do slice de Churchill jogável em greybox |
| S5 | Mapa estratégico simplificado (3 regiões) + consequência atrasada (`DTCConsequenceQueue`) + `DTCSaveGame` v1 funcional | Save/load preserva estado de mundo + fila de consequência pendente |
| S6 | Alteração visual de ambiente reagindo a evento + polimento de integração + teste de playtest interno | Protótipo completo (itens 1–9 do pedido original) jogável sem crash em sessão de 20 min |

**Critério de saída da Fase 2**: todos os 9 itens do protótipo pedido
(escritório 3D, personagem controlável, assistente, reunião com 3 NPCs,
documento assinável, mapa simplificado, decisão com consequência
atrasada, save funcional, alteração visual) presentes e jogáveis na mesma
sessão, sem depender de atalhos de debug para funcionar.

### Fase 3 — Vertical Slice (estimativa: 8 sprints / 16 semanas)

| Sprint | Foco |
|---|---|
| S7–S8 | Produção de arte final do Gabinete de Guerra + corredor Downing Street; MetaHumans finais de Churchill + 3 NPCs do slice |
| S9 | Sistema de informação imperfeita aplicado ao conteúdo real do slice (relatório desatualizado do General, Ultra) |
| S10 | Diálogo ramificado final com todas as opções descritas em `docs/03`, dublagem placeholder de alta qualidade |
| S11 | Mapa estratégico do slice com produção/frente/rota real; resolução de comboio com Ultra |
| S12 | Áudio final do slice (trilha, ambiente, dublagem final ou quase-final) |
| S13 | Dois encerramentos do slice implementados e testados; UI final do slice |
| S14 | Playtest externo controlado (NDA), correção de achados críticos |

**Critério de saída da Fase 3**: playtest externo atinge os critérios de
diversão da §6.4 com uma amostra mínima de 15 jogadores fora da equipe.

### Fase 4 — Produção do jogo-base (estimativa: 52–60 sprints / ~24–28 meses)

Só inicia após aprovação formal do vertical slice (go/no-go de
publisher/investimento). Macro-blocos, não sprint-a-sprint (detalhamento
fino é trabalho da própria Fase 4, não desta documentação):

1. **Conteúdo de campanha** (~16 meses) — as 4 campanhas completas:
   sistemas exclusivos, elenco completo, decisões, ambientes adicionais,
   mapa mundial completo, os 20 finais com variações.
2. **Sistemas mundiais** (~10 meses, em paralelo parcial ao item 1) —
   IA de nação completa para todas as potências relevantes, diplomacia
   completa, economia/produção em escala mundial.
3. **Localização** (~4 meses, majoritariamente após conteúdo travar) —
   mínimo PT-BR, EN, mais idiomas a definir por análise de mercado.
4. **Otimização e escalabilidade** (~4 meses, contínuo desde o meio da
   Fase 4) — meta de desempenho da §6.5.
5. **Acessibilidade** (contínuo desde a Fase 2, auditoria final aqui).
6. **Classificação etária e testes de compliance** (~2 meses, ao final,
   ver §6.3).

## 6.2 Estimativa de equipe

Faixas por fase, função principal (não headcount exato — depende de
contratação real):

| Função | Fase 2 | Fase 3 | Fase 4 |
|---|---|---|---|
| Direção de jogo / design | 1 | 1–2 | 2 |
| Programação C++ (gameplay/sistemas) | 2 | 3 | 5–6 |
| Programação de ferramentas/editor | 0–1 | 1 | 2 |
| Narrative design / roteiro | 1 | 2 | 4 |
| **Consultoria histórica** (contratada, não interna) | 1 (parcial) | 1–2 | 2–3 |
| Arte de ambiente/level art | 1 | 3 | 6–8 |
| Arte de personagem/MetaHuman | 0–1 | 2 | 4 |
| Animação | 0–1 | 1–2 | 3 |
| Áudio (design + composição) | 0 | 1–2 | 2–3 |
| UI/UX | 1 | 1 | 2 |
| QA | 0–1 | 1–2 | 3–4 |
| Produção/gestão de projeto | 1 | 1 | 2 |
| **Jurídico especializado** (contratado, não interno) | consulta pontual | consulta pontual | revisão formal contínua |

Estimativa de pico de equipe interna na Fase 4: **35–45 pessoas**, mais
consultoria histórica e jurídica externa contínua — consistente com um
projeto de escopo "AA alto/AAA modesto", não um AAA de blockbuster de
grande estúdio.

## 6.3 Estimativa de tempo e orçamento

- **Fase 1**: concluída (esta entrega).
- **Fase 2 (Protótipo)**: 12 semanas, equipe de ~6–8 pessoas.
- **Fase 3 (Vertical Slice)**: 16 semanas, equipe de ~12–16 pessoas.
- **Fase 4 (Produção)**: 24–28 meses, equipe crescendo até 35–45 pessoas
  no pico.
- **Duração total até lançamento em PC**: aproximadamente **3 a 3,5
  anos** a partir da aprovação da Fase 2, dependente de financiamento
  contínuo — este é o maior risco de cronograma (§6.6).
- **Orçamento**: dimensionamento formal exige headcount e localização
  reais de contratação (custo de equipe varia enormemente por região) —
  fora do escopo responsável desta documentação sem esses dados. Como
  ordem de grandeza qualitativa: o perfil de equipe acima (pico de
  35–45 pessoas por ~2,5 anos, mais protótipo e slice) posiciona o
  projeto na faixa de investimento **de um AA ambicioso a um AAA de
  segunda linha**, não de um projeto indie nem de um blockbuster
  "quadruple-A" — uma cifra específica só deve ser comunicada a
  investidores após orçamento formal com RH/finanças.
- **Portas para PlayStation/Xbox**: orçadas separadamente, iniciadas
  somente após o lançamento em PC estar estável — evita que certificação
  de console vire gargalo de um jogo cujo maior risco já é de conteúdo e
  cronograma (§6.6), não técnico multiplataforma.

## 6.4 Critérios objetivos de "o protótipo está divertido"

Testáveis com playtest cego (jogador sem instrução prévia da equipe),
sessão de 20–30 minutos no conteúdo da Fase 2:

1. **Detecção de informação suspeita**: pelo menos 60% dos testadores
   identificam, sem serem avisados, que algum dado recebido em reunião
   está incompleto ou desatualizado (medido por entrevista pós-sessão,
   não por pergunta direta durante o jogo).
2. **Peso percebido da decisão**: ao menos uma decisão do protótipo é
   descrita pelo testador, com as próprias palavras, como "difícil" ou
   equivalente — não "óbvia" ou "só cliquei em aprovar".
3. **Zero saída de imersão evitável**: nenhum testador reporta ter sido
   forçado a um menu genérico quando uma alternativa diegética estava
   planejada para aquele fluxo (ex.: assinar documento via popup em vez
   de interação física).
4. **Compreensão sem repetição**: o assistente não precisa repetir a
   mesma instrução de agenda mais de uma vez para o mesmo testador
   entender o que fazer a seguir.
5. **Ausência de blocker técnico**: sessão completa sem crash, sem
   travamento de estado (decisão que não resolve, reunião que não
   avança).
6. **Retenção de intenção de replay**: pelo menos 50% dos testadores,
   perguntados "você jogaria de novo escolhendo diferente?", respondem
   afirmativamente e citam uma escolha específica que fariam diferente.

Critério de **falha** clara, não ambígua: se menos de 40% dos testadores
passam nos itens 1–2 combinados, o problema é de **design de decisão**
(informação óbvia demais, ou escolha sem peso real), não de
polimento — e bloqueia avanço para Fase 3 até revisão de conteúdo.

## 6.5 Meta de desempenho

- 60 FPS em 1080p, configuração média, hardware intermediário (definição
  de "intermediário" a calibrar com dados de mercado Steam Hardware
  Survey no início da Fase 4, não travada nesta doc).
- 60 FPS em 1440p com upscaling (DLSS/FSR/XeSS) em hardware recomendado.
- 30 FPS opcionais em modo qualidade cinematográfica máxima.
- Escalabilidade independente de sombras, densidade de figuração
  ambiente, reflexos e resolução de textura (ver `docs/05`, §5.3).
- Zero travamento perceptível (hitch > 1 frame a 60fps) na transição
  ambiente 3D ↔ mapa estratégico.
- Tempo de carregamento inicial e de save/load dentro de metas a
  definir tecnicamente na Fase 2 com dados reais de streaming, não
  estimadas sem medição.
- Uso de memória/VRAM dimensionado por perfil de qualidade, validado
  continuamente a partir da Fase 3 (não deixado para o fim da Fase 4).

## 6.6 Riscos principais

### Técnicos

- **Streaming contínuo ambiente↔mapa** é a integração tecnicamente mais
  arriscada do projeto (World Partition não foi desenhado pensando em
  alternância tão frequente entre escalas tão diferentes). Mitigação:
  validar já na Fase 2 (Sprint 5–6), não assumir que "vai funcionar" até
  a Fase 4.
- **Custo de produção de MetaHumans customizados em volume** (dezenas de
  personagens named, não genéricos) pode estourar cronograma de arte.
  Mitigação: pipeline validado no Vertical Slice antes de escalar
  produção de personagens da Fase 4.
- **Determinismo de simulação** em sistemas complexos (IA de nação,
  resolução de frente) é difícil de garantir 100%; falha de determinismo
  quebra replay de QA e potencialmente saves entre sessões. Mitigação:
  arquitetura de simulação isolada de apresentação desde o início (ver
  `docs/04`, §4.3), testada com testes automatizados desde a Fase 2.

### Históricos

- **Risco de imprecisão ou anacronismo** em qualquer dos milhares de
  pontos de conteúdo histórico do jogo completo. Mitigação: consultoria
  histórica contratada desde a Fase 2 (não só na Fase 4), processo formal
  de tag de classificação obrigatório antes de qualquer decisão ser
  considerada "pronta" (ver `docs/04`, `HistoricalTagValidator`).
- **Risco de leitura equivocada como apologia**, mesmo com toda a
  postura crítica documentada — o tema é inerentemente sensível.
  Mitigação: revisão por especialistas em Holocausto e história do
  período especificamente (não apenas historiadores generalistas),
  testes de percepção com playtest externo diverso antes do anúncio
  público, e a tela inicial + Codex como redundância explícita de
  intenção (não substituto de bom design de conteúdo).

### Jurídicos

- **Direitos de imagem/voz** de figuras históricas e possíveis
  herdeiros/espólios, variáveis por jurisdição. Mitigação: advogado
  especializado em mídia e distribuição internacional envolvido desde a
  Fase 2, não contratado às pressas perto do lançamento.
- **Licenciamento de fotografias, documentos, música e gravações**
  usadas como referência ou (quando aplicável e confirmado) como asset
  direto. Mitigação: registro de origem obrigatório de todo asset
  histórico desde o primeiro dia de produção (ver `docs/04`, política de
  `SourceReference` obrigatória).
- **Símbolos proibidos por legislação local** (ex.: restrições vigentes
  em determinados países a símbolos nazistas). Mitigação: sistema de
  substituição de símbolo por região, desenhado na arquitetura desde a
  Fase 2 (ver `docs/04`, tags de sensibilidade), sem alterar fatos
  históricos subjacentes.
- **Questionário IARC / classificação etária** deve ser preenchido com
  uma build representativa do conteúdo mais sensível do jogo completo
  (campanha de Hitler), não com o vertical slice de Churchill, para
  evitar reclassificação tardia perto do lançamento.

### Comerciais

- **Cronograma de 3+ anos com dependência de financiamento contínuo** é
  o maior risco de projeto único. Mitigação: Fase 3 (Vertical Slice)
  desenhada deliberadamente como ponto de decisão go/no-go antes do
  compromisso financeiro da Fase 4.
- **Nicho estreito na interseção de dois públicos** (estratégia
  histórica de alto investimento + narrativa de decisão) — risco real de
  o produto não ser "estratégia o bastante" para um público nem
  "narrativo o bastante" para o outro. Mitigação: o modo de delegação de
  mapa (`docs/02`, §2.9) existe exatamente para dar ao público
  secundário uma porta de entrada sem descaracterizar a profundidade para
  o público primário.
- **Marketing de um jogo sobre Hitler é inerentemente arriscado** em
  qualquer estratégia de visibilidade (lojas, plataformas de vídeo,
  imprensa). Mitigação: liderar a comunicação pública com a campanha de
  Churchill/Roosevelt e o vertical slice (que já usa Churchill),
  apresentando a campanha de Hitler com todo o contexto crítico deste
  documento desde a primeira menção pública, nunca como reveal
  isolado sem contexto.

## 6.7 Fora do escopo da versão 1 (jogo-base)

Explicitamente **não** incluído no lançamento inicial em PC — decisão de
escopo, não esquecimento:

- As quatro campanhas de expansão (Mussolini, Tojo, de Gaulle, Chiang
  Kai-shek) — mencionadas no pedido original como expansões futuras.
- Multiplayer ou qualquer modo competitivo/cooperativo — o design inteiro
  pressupõe uma experiência autoral de decisão individual.
- Editor de cenário/modding oficial suportado — pode ser avaliado pós-
  lançamento, não impacta arquitetura de dados desde que o modelo de
  `docs/04` já seja data-driven (o que facilita, mas não implica suporte
  oficial dia um).
- Versões de PlayStation e Xbox — planejadas na arquitetura, produzidas
  depois da estabilização em PC (ver §6.3).
- Voz totalmente dublada em todos os idiomas de lançamento — mínimo
  viável é EN + PT-BR dublados, demais idiomas em legenda no lançamento,
  com dublagem adicional avaliada por desempenho comercial.
- Ferramentas de criação de conteúdo por terceiros/comunidade.
- Qualquer forma de conteúdo gerado pelo jogador que precise de
  moderação em tempo real (evitado deliberadamente dado o tema sensível
  do jogo — ver política de moderação a definir antes de qualquer
  recurso social futuro).
