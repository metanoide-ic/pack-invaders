# 6. Modelo de Dados

Todos os tipos abaixo são `Primary Data Assets` (ou linhas de `Data Table` para coleções grandes/homogêneas), lidos pelo runtime — nunca hardcoded.

## 6.1 Líder (`FLeaderData`)
```
Id, DisplayName, Country, PortraitAsset, MetaHumanAssetRef
StartDate, StartHealth, StartSanity
BaseStats: { PoliticalCapital, PublicTrust, EliteTrust }
ExclusiveSystems: [GameplayTag]      // ex: "System.Paranoia", "System.PurgeFear"
AvailableEndingsMask: [FEndingId]
EnvironmentSet: [FEnvironmentId]
VoiceProfileRef
LegalReviewStatus: enum { Pending, Approved, Restricted }
```

## 6.2 Personagem / NPC (`FCharacterData`)
```
Id, DisplayName, Role, Country, Ideology
Traits: { Ambition, Courage, Competence, PublicLoyalty(0-100),
          TrueLoyalty(0-100) }             // públicas vs reais, podem divergir
Relationships: [ { TargetCharacterId, RelationType, Strength } ]
Fears: [string]
Secrets: [ { SecretId, Severity, KnownBy: [CharacterId] } ]
EmotionalState: enum (dinâmico, runtime)
KnowledgeState: [FInfoFidelityTag]        // o que este NPC sabe/acredita saber
MemoryLog: [ { DecisionId, PlayerChoiceId, Timestamp, ImpactOnLoyalty } ]  // runtime
BehaviorPolicy: StateTreeRef              // como reage autonomamente
VoiceActorLicenseRef, PortraitLicenseRef, HistoricalSourceRefs: [string]
```

## 6.3 Decisão (`FDecisionData`)
```
Id, Title, DescriptionText
MinDate, MaxDate
EligibleLeaders: [FLeaderId]
ActivationConditions: [FConditionExpr]
InvolvedCharacters: [FCharacterId]
PresentedEvidence: [FEvidenceRef]         // o que é mostrado ao jogador
HiddenInformation: [FHiddenInfoRef]       // o que existe mas não é revelado
Options: [
  {
    OptionId, Label, Type: enum(Approve, Refuse, Delay, RequestInfo,
                                  Modify, Consult, ExecuteSecretly,
                                  Delegate, LiePublicly, Contradict),
    Costs: [FResourceCost],
    ImmediateEffects: [FWorldSimMutation],
    DelayedEffects: [ { Delay: FTimeSpan, Effects: [FWorldSimMutation] } ],
    RelationshipDeltas: [ { CharacterId, Attribute, Delta } ],
    MapChanges: [FMapMutation],
    UnlockedEvents: [FEventId],
    InfluencedEndings: [FEndingId]
  }
]
HistoricalProvenance: enum (Documented, PlausibleSpeculation,
                             AlternateHistory, DramaticFiction)
SourceRefs: [FBibliographyRef]
```

## 6.4 Evento (`FHistoricalEventData`)
```
Id, Title, TriggerConditions: [FConditionExpr]
Scope: enum (Personal, National, Global)
LinkedDecisionId (opcional — nem todo evento gera decisão explícita)
Provenance: enum (Documented, PlausibleSpeculation, AlternateHistory, DramaticFiction)
SourceRefs: [FBibliographyRef]
```

## 6.5 País (`FCountryData`) — indicadores simulados
```
Id, DisplayName, GovernmentType, Leadership: FLeaderId (se jogável) | FAILeaderProfile
Resources: { MilitaryPower, ManpowerReserves, IndustrialOutput, Fuel,
             Food, RawMaterials, Infrastructure, LogisticsCapacity }
Politics: { PoliticalStability, PublicSupport, CivilianMorale, MilitaryMorale,
            DiplomaticInfluence, IntelligenceEfficiency, ScientificDevelopment,
            RepressionLevel, InternalResistance }
HumanCost: { MilitaryDeaths, CivilianDeaths, WarCrimesLog: [FWarCrimeRecord],
             DisplacedPopulation }
TerritoryControl: [FRegionId]
TrueValues vs PerceivedByPlayerValues     // par de estruturas — ver InfoFidelity
```

## 6.6 Registro histórico imutável (`FHistoricalLedgerEntry`)
```
Id, Timestamp, RelatedDecisionId, RelatedEventId
Description, Provenance
Immutable: true                            // nunca editado após escrita, só anexado
```
Usado por: dossiê de crimes, diário do jogador, telas de epílogo, modo bibliografia.

## 6.7 Final (`FEndingData`)
```
Id, Title  // ex: "Direto dos Livros", "Fortaleza Europa"...
GlobalConditions: [FConditionExpr]
PersonalVariants: [
  { LeaderId, ConditionOverrides, EpilogueTextRef, EpilogueCinematicRef }
]
FactorsConsidered: [ SurvivingCountries, Borders, DominantIdeologies,
                      CivilianDeaths, MilitaryDeaths, NuclearWeaponsUsed,
                      WarCrimesCommitted, AlliancesFormed, EconomicSituation,
                      LeaderPersonalFate, SocialConditions1945to1960 ]
```

## 6.8 Recurso de bibliografia (`FBibliographyRef`)
```
Id, Citation, SourceType: enum(PrimarySource, AcademicSecondary, Archival, Consultant)
LicenseStatus, ReviewedBy: [string]
```
