# 5. Arquitetura Técnica (Unreal Engine 5)

## 5.1 Princípios
- **Separação total** entre dados históricos/narrativos, regras de simulação e apresentação visual. Nenhuma decisão individual é codificada em C++ ou Blueprint hardcoded — tudo passa por Data Assets/Data Tables lidos por um runtime genérico.
- **C++** para: simulação de mundo (WorldSim), IA de facção/país, save/load, performance-critical (streaming, pathing, avaliação de milhares de modificadores por tick), rede de dados históricos.
- **Blueprint** para: eventos de cena, staging de câmera, interações ambientais, protótipos de UI, ajustes de designer sem recompilar.
- **Determinismo:** a simulação estratégica (WorldSim) roda em passo fixo determinístico (mesmo seed + mesmas decisões = mesmo resultado), permitindo replay de depuração e testes automatizados de balanceamento. A camada de apresentação (animação, câmera, diálogo) não precisa ser determinística.

## 5.2 Camadas do sistema

```
┌───────────────────────────────────────────────────────────┐
│  APRESENTAÇÃO (UE5 — Blueprint-heavy)                       │
│  Nível 3D, MetaHuman-based characters, câmera, UI, áudio    │
└───────────────────────────┬─────────────────────────────────┘
                            │ eventos / consultas de estado
┌───────────────────────────▼─────────────────────────────────┐
│  CAMADA NARRATIVA (C++/BP híbrido)                           │
│  Dialogue Runtime · Decision Runtime · Character Memory       │
│  Agenda/Scheduler · Document System                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ leitura/escrita de estado de mundo
┌───────────────────────────▼─────────────────────────────────┐
│  CAMADA DE SIMULAÇÃO (C++ puro, determinística)               │
│  WorldSim: economia, produção, frentes, moral, inteligência,  │
│  diplomacia, ciência · Country AI · Fog-of-War/Info Quality   │
└───────────────────────────┬─────────────────────────────────┘
                            │ serialização
┌───────────────────────────▼─────────────────────────────────┐
│  CAMADA DE DADOS (Data Tables / Primary Data Assets)          │
│  Líderes · NPCs · Eventos · Decisões · Países · Bibliografia  │
└───────────────────────────────────────────────────────────────┘
```

## 5.3 Módulos C++ propostos

| Módulo | Responsabilidade |
|---|---|
| `DictocracyCore` | Tipos base, Gameplay Tags, interfaces compartilhadas |
| `WorldSim` | Simulação determinística de indicadores por país/região/frente, avanço de tempo |
| `CountryAI` | Avaliação de ameaça, objetivos, negociação, memória de acordos por país (jogador e IA) |
| `InfoFidelity` | Modelo de informação imperfeita: gera a "versão percebida" dos dados reais conforme inteligência/lealdade/canal |
| `DecisionSystem` | Runtime de avaliação de condições de ativação, custos, consequências imediatas/atrasadas de Decision Data Assets |
| `CharacterMemory` | Estado por NPC: lealdade pública/real, medo, segredos, histórico de decisões do jogador que o afetaram |
| `DialogueRuntime` | Execução de árvores de diálogo não-binárias, interface com Decision System |
| `AgendaScheduler` | Geração da agenda diária/semanal a partir de eventos agendados + condicionais + rotina |
| `SaveGameSystem` | Serialização versionada, migração entre versões de save |
| `HistoricalLedger` | Registro permanente e imutável de eventos "documentados" e decisões do jogador, com flag de proveniência (ver 5.5) |
| `LocalizationCore` | Integração com sistema de localização da UE5 desde o primeiro protótipo |

## 5.4 Módulos Blueprint / Data-Driven
- **Eventos de cena** (staging de câmera, blocking de NPCs, gatilhos ambientais).
- **Ferramenta interna de autoria de eventos e decisões** (editor customizado no UE5, sobre Primary Data Assets) para que designers/roteiristas criem conteúdo sem tocar em C++.
- **State Trees** para comportamento de NPCs de fundo (funcionários circulando, guardas, secretárias) e para comandantes/generais em resposta a ordens.

## 5.5 Proveniência histórica como dado de primeira classe
Todo `FDecisionData` e `FHistoricalEventData` carrega um campo `EHistoricalProvenance { Documented, PlausibleSpeculation, AlternateHistory, DramaticFiction }`. O `HistoricalLedger` é consultado pela UI para exibir a etiqueta de proveniência sempre que o jogador revisita um evento (diário, epílogo, modo bibliografia).

## 5.6 Estrutura de pastas (proposta)

```
/Source
  /DictocracyCore
  /WorldSim
  /CountryAI
  /InfoFidelity
  /DecisionSystem
  /CharacterMemory
  /DialogueRuntime
  /AgendaScheduler
  /SaveGameSystem
  /HistoricalLedger
  /LocalizationCore
/Content
  /Characters
    /MetaHumans
    /Animations
    /Voices
  /Environments
    /Germany
    /UnitedKingdom
    /UnitedStates
    /SovietUnion
    /Shared_Props
  /UI
    /HUD
    /Documents
    /StrategicMap
    /Accessibility
  /Audio
    /Music
    /Ambience
    /VO
  /Data
    /Leaders
    /Characters
    /Decisions
    /Events
    /Countries
    /Bibliography
  /Cinematics
  /VFX
/Tools
  /EventEditor        (ferramenta interna de autoria)
  /BalanceSim          (execução headless do WorldSim para testes de balanceamento)
/Docs                  (espelha esta documentação dentro do projeto UE5, versionado junto)
```

## 5.7 Save/Load
Saves versionados por `SaveSchemaVersion`; migração incremental por patch (função `UpgradeFromVersion(N)` por sistema). A simulação determinística do WorldSim permite salvar apenas estado (não histórico de inputs), mantendo saves compactos.

## 5.8 Testes
- **Testes unitários C++** (Automation Framework da UE5) para `WorldSim`, `DecisionSystem`, `InfoFidelity`.
- **BalanceSim headless**: execução do WorldSim sem renderização, para simular milhares de "playthroughs" de IA-vs-IA e validar que nenhuma campanha tem caminho estritamente dominante ou softlock.
- **Testes de integração de save/load** a cada schema change.
