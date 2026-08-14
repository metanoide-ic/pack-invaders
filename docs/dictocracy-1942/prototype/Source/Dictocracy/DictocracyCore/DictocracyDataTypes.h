// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Subconjunto de tipos de dados do GDD (ver docs/dictocracy-1942/05-modelo-de-dados.md)
// necessário para o protótipo: um NPC de reunião, uma decisão com consequência atrasada,
// um líder. Os demais campos do modelo completo (Secrets, KnowledgeState, InfoFidelity,
// MapChanges, etc.) foram deliberadamente omitidos aqui — entram na Fase 3.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "GameplayTagContainer.h"
#include "DictocracyDataTypes.generated.h"

/** Proveniência histórica de um evento ou decisão — ver GDD seção 5.5. */
UENUM(BlueprintType)
enum class EHistoricalProvenance : uint8
{
	Documented UMETA(DisplayName = "Histórico Documentado"),
	PlausibleSpeculation UMETA(DisplayName = "Historicamente Plausível"),
	AlternateHistory UMETA(DisplayName = "História Alternativa"),
	DramaticFiction UMETA(DisplayName = "Ficção Dramática")
};

/** Traços de personalidade de um NPC — usados por DialogueRuntime para variar tom de fala (Fase 3). No protótipo, apenas lidos e exibidos. */
USTRUCT(BlueprintType)
struct FCharacterTraits
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Traits", meta = (ClampMin = 0, ClampMax = 100))
	int32 Ambition = 50;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Traits", meta = (ClampMin = 0, ClampMax = 100))
	int32 Courage = 50;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Traits", meta = (ClampMin = 0, ClampMax = 100))
	int32 Competence = 50;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Traits", meta = (ClampMin = 0, ClampMax = 100))
	int32 PublicLoyalty = 50;

	/** Pode divergir de PublicLoyalty — a lealdade "real" nem sempre é revelada ao jogador. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Traits", meta = (ClampMin = 0, ClampMax = 100))
	int32 TrueLoyalty = 50;
};

/** Linha de Data Table para um NPC (ver GDD 6.2, recortado para o protótipo). */
USTRUCT(BlueprintType)
struct FCharacterData : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FName CharacterId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FText Role;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FText Ideology;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Traits")
	FCharacterTraits Traits;

	/** Referência ao Blueprint/Pawn deste NPC no nível de protótipo. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Presentation")
	TSoftClassPtr<AActor> ActorClass;

	/** Fonte histórica usada para construir este personagem — obrigatório mesmo em protótipo (rastreabilidade desde o início). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Provenance")
	FText SourceNote;
};

/** Tipo de resposta do jogador — nunca reduzir para sim/não por padrão (regra do GDD). */
UENUM(BlueprintType)
enum class EDecisionOptionType : uint8
{
	Approve,
	Refuse,
	Delay,
	RequestInfo,
	Modify,
	Consult,
	ExecuteSecretly,
	Delegate,
	LiePublicly,
	Contradict
};

/** Um efeito de mundo simples: nome de indicador + delta. WorldSim completo (Fase 3) troca isto por mutações tipadas por país/região. */
USTRUCT(BlueprintType)
struct FWorldSimMutation
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Effect")
	FName IndicatorName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Effect")
	int32 Delta = 0;
};

/** Efeito agendado para o futuro — é isto que dá corpo à "decisão com consequência atrasada" exigida na Fase 2. */
USTRUCT(BlueprintType)
struct FDelayedEffect
{
	GENERATED_BODY()

	/** Dias de jogo até o efeito se manifestar. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Timing", meta = (ClampMin = 1))
	int32 DelayInDays = 7;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Effect")
	TArray<FWorldSimMutation> Effects;

	/** Texto mostrado ao jogador quando o efeito se manifesta (relatório, jornal, NPC comentando). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Presentation")
	FText ManifestationText;
};

/** Uma opção dentro de uma decisão. */
USTRUCT(BlueprintType)
struct FDecisionOption
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FName OptionId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FText Label;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	EDecisionOptionType Type = EDecisionOptionType::Approve;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Effect")
	TArray<FWorldSimMutation> ImmediateEffects;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Effect")
	TArray<FDelayedEffect> DelayedEffects;
};

/** Linha de Data Table para uma decisão (ver GDD 6.3, recortado para o protótipo). */
USTRUCT(BlueprintType)
struct FDecisionData : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FName DecisionId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FText Title;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity", meta = (MultiLine = true))
	FText DescriptionText;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Options")
	TArray<FDecisionOption> Options;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Provenance")
	EHistoricalProvenance Provenance = EHistoricalProvenance::PlausibleSpeculation;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Provenance")
	FText SourceNote;
};

/** Linha de Data Table para o líder jogável do protótipo. */
USTRUCT(BlueprintType)
struct FLeaderData : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FName LeaderId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Identity")
	FText Country;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Start State")
	int32 StartHealth = 100;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Start State")
	int32 StartSanity = 100;
};
