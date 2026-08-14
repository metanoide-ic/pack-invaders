# 4. Arquitetura técnica (Unreal Engine 5)

> **Nota de escopo**: este documento define a arquitetura pretendida e os
> esquemas de dados como especificação de design, para orientar a Fase 2
> (protótipo). Nada aqui é código testado ou implementação final — nenhum
> projeto Unreal foi aberto ainda. Estruturas em formato de código são
> **esquemas**, não implementação, e serão validadas/ajustadas no
> protótipo antes de virarem sistemas centrais.

## 4.1 Princípios de arquitetura

1. **Separação total entre dados, regras e apresentação.** Conteúdo
   histórico (eventos, decisões, personagens) vive em ativos de dados
   editáveis por designers/historiadores sem tocar em C++. Regras de
   simulação (como um indicador afeta outro) vivem em sistemas C++
   determinísticos. Apresentação (a cena 3D, o diálogo renderizado) lê os
   dados, não os contém.
2. **C++ para o que precisa ser rápido, determinístico ou crítico para
   salvar/carregar**: simulação de mundo, IA de nação, resolução de
   decisões, sistema de save. **Blueprint para o que precisa iterar
   rápido e é sobretudo apresentação**: sequências de câmera, interações
   ambientais, ajustes finos de UI, protótipos de eventos antes de
   promovê-los a sistema central se necessário.
3. **Tudo que um historiador ou narrative designer precisa editar deve
   ser editável sem recompilar** — Data Tables / Primary Data Assets como
   interface entre conteúdo e sistema.
4. **A simulação de mundo deve ser determinística por seed** sempre que
   viável, para permitir replays de QA, testes automatizados de
   balanceamento e depuração de bugs de simulação de longo prazo.
5. **Localização desde a primeira string.** Nenhum texto embutido em
   Blueprint ou C++; tudo referenciado por chave de texto localizável
   desde o protótipo.

## 4.2 Estrutura de pastas e módulos (proposta)

```
Dictocracy1942/
├── Source/
│   ├── DictocracyCore/            (módulo C++ primário)
│   │   ├── Simulation/            simulação de mundo, indicadores, tempo
│   │   │   ├── DTCWorldState.*        estado agregado por país/região
│   │   │   ├── DTCIndicatorSystem.*   cálculo/propagação de indicadores
│   │   │   ├── DTCTimeManager.*       avanço de dias/semanas, agenda
│   │   │   └── DTCFrontResolver.*     resolução de ordens militares
│   │   ├── Characters/             personagens simulados (não os pawns 3D)
│   │   │   ├── DTCCharacterState.*
│   │   │   ├── DTCCharacterMemory.*   memória de decisões do jogador
│   │   │   └── DTCCharacterAI.*       comportamento autônomo (ver 4.6)
│   │   ├── Decisions/              motor de decisões/eventos
│   │   │   ├── DTCDecisionAsset.*     (Primary Data Asset, ver 4.4)
│   │   │   ├── DTCDecisionRuntime.*   avaliação de condições, resolução
│   │   │   └── DTCConsequenceQueue.*  consequências atrasadas agendadas
│   │   ├── Diplomacy/
│   │   │   └── DTCNationAI.*          IA de política externa por nação
│   │   ├── SaveSystem/
│   │   │   ├── DTCSaveGame.*          versionado, ver 4.7
│   │   │   └── DTCSaveMigration.*     migração entre versões de save
│   │   └── Endings/
│   │       └── DTCEndingEvaluator.*   avaliação dos 20 finais + variações
│   ├── DictocracyPresentation/      (módulo C++ fino, ganchos p/ BP)
│   │   ├── Pawns/                   pawn de exploração 3P
│   │   ├── Dialogue/                runtime de diálogo (dados em BP/DT)
│   │   └── UI/                      infraestrutura de UMG, sem lógica de jogo
│   └── DictocracyEditorTools/       (módulo apenas de editor)
│       ├── DecisionGraphEditor/      ferramenta interna de autoria de decisões
│       └── HistoricalTagValidator/   valida se todo evento tem fonte/tag (ver 00)
├── Content/
│   ├── Data/
│   │   ├── Leaders/                 DA_Leader_* (Primary Data Assets)
│   │   ├── Characters/              DA_Character_*
│   │   ├── Decisions/               DA_Decision_* organizados por campanha/data
│   │   ├── Endings/                 DA_Ending_*
│   │   └── Localization/            tabelas de string por idioma
│   ├── Environments/
│   │   ├── Germany/, UK/, USA/, USSR/   por campanha, ver docs/05
│   ├── Characters3D/                MetaHumans customizados + variações de uniforme
│   ├── UI/                          UMG widgets, estilos
│   └── Audio/                       ver docs/05
├── Config/
└── Plugins/
    └── (avaliar third-party só após protótipo — ver 4.8)
```

Convenção de prefixo `DTC` para classes C++ do projeto, para evitar
colisão e facilitar busca.

## 4.3 Módulos e responsabilidades

| Módulo | Responsabilidade | Não deve conter |
|---|---|---|
| `DictocracyCore` | Regras de simulação, estado de mundo, IA, save, avaliação de decisões e finais | Nenhuma referência a Actor/Pawn/nível — deve ser testável sem abrir um mapa |
| `DictocracyPresentation` | Pawns, câmera, runtime de diálogo, UI | Nenhuma regra de negócio — apenas lê `DictocracyCore` e dispara eventos de volta |
| `DictocracyEditorTools` | Ferramentas de autoria para designers/historiadores | Nunca compilado em builds de shipping |

Essa separação é o que permite escrever **testes automatizados de
simulação** (ex.: "esta sequência de 50 decisões produz este estado de
mundo, sempre") sem depender de abrir o jogo — crítico para um projeto
onde o conteúdo (centenas de decisões históricas) é o maior risco de
regressão.

## 4.4 Modelo de dados (esquema de design)

Representado abaixo em pseudocódigo de struct/enum para comunicar campos
e tipos — a ser traduzido para `UPRIMARYDATAASSET`/`USTRUCT` reais na
Fase 2, com ajustes que só aparecem ao implementar de verdade.

### 4.4.1 Líder (`DA_Leader_*`)

```
LeaderDefinition
  Id                     : NomeÚnico
  DisplayName            : TextoLocalizável
  Country                : Ref<CountryDefinition>
  StartDate / EndDateMax : Data
  ExclusiveSystems       : [Ref<SystemModifierAsset>]   // Índice de Facção, Paranoia, etc.
  StartingStats          : Map<IndicatorTag, Valor>
  StartingRelationships  : [ { CharacterId, Valor } ]
  HomeEnvironments       : [Ref<LevelStreamingAsset>]   // ambientes jogáveis
  SuccessionRule         : Opcional<Ref<SuccessionAsset>>  // caso Roosevelt
  ExitConditions         : [Ref<ExitConditionAsset>]    // golpe, captura, etc.
  ContentRatingTags      : [HistoricalSensitivityTag]
```

### 4.4.2 Personagem (`DA_Character_*`)

```
CharacterDefinition
  Id, DisplayName, Role, Country
  Ideology, Ambition, Courage, Competence      : Float 0–1 (base, não exposto ao jogador)
  PublicLoyalty, RealLoyalty                    : Float 0–1, podem divergir
  Relationships       : Map<CharacterId, RelationshipValue>
  Fears, Secrets      : [TagAsset]               // gatilhos narrativos, não flavor text solto
  KnowledgeState      : Map<WorldFactTag, ConfidenceLevel>
  VoiceAndPerformance : Ref<MetaHumanProfile>
  AIBehaviorProfile   : Ref<DTCCharacterAI-Config>
```

`RealLoyalty` nunca é exposto diretamente ao jogador — só inferível por
comportamento, consistente com `docs/02`, §2.6.

`CharacterMemory` (estado de runtime, não definição estática):

```
CharacterMemoryEntry
  DecisionId, Date, PlayerChoice
  EmotionalImpact      : Float (-1..1)
  RelationshipDelta     : Float
  Expires               : Opcional<Data>          // algumas memórias decaem, outras não
```

### 4.4.3 Decisão / Evento (`DA_Decision_*`)

```
DecisionDefinition
  Id, Title
  DateWindow                 : { Min, Max }
  EligibleLeaders            : [LeaderId]
  ActivationConditions        : ConditionExpression   // ver 4.4.4
  InvolvedCharacters          : [CharacterId]
  PresentedText                : TextoLocalizável (por personagem/linha)
  AvailableEvidence           : [Ref<EvidenceAsset>]
  HiddenInformation           : [WorldFactTag]         // não mostrado, pode contradizer o exibido
  Options                      : [DecisionOption]      // ver abaixo
  HistoricalClassification     : enum { Documented, Plausible, Alternate, Fictional }
  SourceReference               : Opcional<TextoLocalizável>  // obrigatório se Documented

DecisionOption
  Kind            : enum { Approve, Refuse, Postpone, RequestInfo,
                            Amend, Consult, ExecuteSecretly,
                            Delegate, LiePublicly, Contradict }
  Costs           : Map<IndicatorTag, Valor>
  ImmediateEffects: [EffectExpression]
  DelayedEffects  : [ { DelayDays, EffectExpression } ]
  RelationshipDeltas : [ { CharacterId, Valor } ]
  MapEffects       : [MapEffectExpression]
  UnlocksDecisions : [DecisionId]
  EndingWeights    : Map<EndingId, Peso>
```

### 4.4.4 Expressão de condição

Condições e efeitos usam uma **linguagem de expressão de dados**, não
código C++ direto, para que designers componham novas decisões sem
recompilar:

```
ConditionExpression := Comparacao | And(...) | Or(...) | Not(...)
Comparacao := IndicatorTag Operador Valor
            | RelationshipTag Operador Valor
            | GameplayTag Presente/Ausente
            | DecisionResolvedAs(DecisionId, OptionKind)
```

Implementação técnica candidata: Gameplay Tags para estados
booleanos/categóricos ("Alemanha.Facção.SS.EmAlta"), Data Tables para
limiares numéricos, e um pequeno interpretador de expressão em C++
(não Blueprint puro, por desempenho e testabilidade) lendo essas
estruturas de dados.

### 4.4.5 Final (`DA_Ending_*`)

```
EndingDefinition
  Id, DisplayName
  GlobalTriggerExpression   : ConditionExpression   // combinação de indicadores + decisões-âncora
  PersonalEpilogueVariants  : Map<LeaderId, Ref<EpilogueTextAsset>>
  RequiredNonGlorification  : Checklist          // validado por HistoricalTagValidator, ver 4.2
```

`RequiredNonGlorification` é uma checklist obrigatória de autoria (não
apenas convenção): todo `DA_Ending_*` precisa referenciar pelo menos um
bloco de epílogo classificado como "custo humano" antes de poder ser
marcado como pronto para revisão — enforced pela ferramenta de editor
`HistoricalTagValidator` (ver 4.2), não apenas por processo humano.

## 4.5 Lista de sistemas necessários

Simulação central: tempo/agenda · indicadores por país · resolução de
frentes militares · produção/logística · pesquisa científica · comércio e
empréstimos entre nações · opinião pública/moral · repressão e resistência
interna · registro append-only de crimes de guerra · motor de decisões ·
fila de consequências atrasadas · avaliação de finais.

Personagens e IA: estado e memória de personagem · IA de comportamento de
personagem (ver 4.6) · IA de política externa de nação · sistema de
diálogo ramificado · sistema de informação imperfeita/confiabilidade de
fonte.

Apresentação: pawn de exploração 3P · câmera cinematográfica em cena de
diálogo · sistema de interação com objetos (documentos, telefones,
rádios) · streaming de nível/mapa · UI de agenda, reunião, mapa
estratégico, documento, Codex Histórico · localização · acessibilidade.

Infraestrutura: save/load versionado · telemetria de QA (anonimizada,
apenas para balanceamento) · replay determinístico para debug · sistema
de configuração de qualidade gráfica escalável.

## 4.6 Inteligência artificial

Duas camadas distintas, deliberadamente separadas:

1. **IA de Personagem** (Behavior Tree ou State Tree — a decidir no
   protótipo por qual lida melhor com estados de longa duração como
   "planejando um golpe há 3 semanas") — decide reações individuais
   dentro de uma cena e comportamentos de médio prazo (vazar informação,
   pedir demissão) com base no perfil de `CharacterDefinition` + memória
   acumulada. Roda por personagem relevante, não por soldado individual.
2. **IA de Nação** (sistema C++ dedicado, sem árvore de comportamento
   visual — decisões de política externa são poucas e de alto peso, mais
   adequadas a avaliação de utilidade programática) — avalia ameaças,
   preserva interesses, forma/rompe alianças, reage à reputação
   acumulada do jogador (histórico de acordos cumpridos/quebrados) e
   nunca aceita proposta manifestamente ruim para si sem uma causa
   política modelada (derrota iminente, colapso econômico).

Regra explícita de design técnico: **nenhuma das duas camadas de IA
recebe acesso aos dados "verdadeiros" de simulação que o jogador não
teria** — a IA avalia o mundo através do mesmo sistema de confiabilidade
de informação descrito em `docs/02`, §2.6, com sua própria qualidade de
inteligência (não onisciência), para que o jogador nunca sinta que está
jogando contra um oponente que trapaceia.

## 4.7 Save game

- **Versionado desde o primeiro protótipo** — todo `DTCSaveGame` carrega
  um número de versão de schema; `DTCSaveMigration` aplica transformações
  incrementais ao carregar saves antigos, nunca falha silenciosamente.
- Serializa: estado de mundo completo, memória de todos os personagens
  relevantes, fila de consequências atrasadas, registro append-only de
  crimes/decisões de âncora (nunca truncado), semente de simulação
  determinística.
- Suporte a múltiplos slots + autosave em transições de dia/semana.

## 4.8 Plugins e dependências de terceiros

Nenhuma dependência de terceiros é assumida na Fase 1. Candidatos a
avaliar somente durante o protótipo, com critério de "resolve um problema
real que a UE5 nativa não resolve bem" — não adicionados por padrão:
ferramenta de diálogo ramificado de terceiros (avaliar vs. sistema
próprio, dado que o modelo de dados de decisão já é bastante específico
deste jogo), middleware de localização, e middleware de voz/lip-sync se
o pipeline nativo do MetaHuman Animator não for suficiente para o volume
de diálogo do jogo completo.

## 4.9 Requisitos técnicos que a arquitetura precisa suportar desde já

- Transição mapa-múndi ↔ ambiente 3D sem tela de carregamento perceptível
  (World Partition + level streaming assíncrono) — item explícito da meta
  de desempenho do projeto.
- Simulação de mundo deve poder rodar **sem** o nível 3D carregado (para
  telas de resumo semanal e para testes automatizados de balanceamento).
- Todo texto, incluindo nomes de personagens gerados dinamicamente em
  eventos ramificados, passa pelo sistema de localização — nada
  hard-coded mesmo em conteúdo "só em português" no protótipo.
