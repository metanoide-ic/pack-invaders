// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// ActorComponent anexado ao Pawn/Character de cada NPC importante. Guarda o registro
// de decisões do jogador que afetaram este personagem (ver GDD 6.2, campo MemoryLog).
// No protótipo isto é lido por diálogo (ex.: NPC menciona uma decisão anterior),
// mas ainda não alimenta reação autônoma (isso é Fase 3 / CountryAI e BehaviorPolicy).

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "DictocracyCore/DictocracyDataTypes.h"
#include "CharacterMemoryComponent.generated.h"

USTRUCT(BlueprintType)
struct FMemoryLogEntry
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Memory")
	FName DecisionId;

	UPROPERTY(BlueprintReadOnly, Category = "Memory")
	FName ChosenOptionId;

	UPROPERTY(BlueprintReadOnly, Category = "Memory")
	int32 DayOccurred = 0;

	/** Impacto na lealdade real (pode ser negativo). Aplicado a TrueLoyalty no momento do registro. */
	UPROPERTY(BlueprintReadOnly, Category = "Memory")
	int32 LoyaltyImpact = 0;
};

UCLASS(ClassGroup = (Dictocracy), meta = (BlueprintSpawnableComponent))
class CHARACTERMEMORY_API UCharacterMemoryComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UCharacterMemoryComponent();

	/** Inicializa a partir da linha de Data Table correspondente a este NPC. */
	UFUNCTION(BlueprintCallable, Category = "Character Memory")
	void InitializeFromData(const FCharacterData& InData);

	UFUNCTION(BlueprintCallable, Category = "Character Memory")
	void RecordDecisionImpact(FName DecisionId, FName OptionId, int32 CurrentDay, int32 LoyaltyImpact);

	/** Restauração direta de estado salvo (SaveGameSystem) — NÃO recalcula lealdade a partir
	 *  do log, apenas repõe os valores exatamente como estavam. Diferente de RecordDecisionImpact,
	 *  que é para decisões novas acontecendo em tempo real. */
	UFUNCTION(BlueprintCallable, Category = "Character Memory")
	void RestoreSavedState(const TArray<FMemoryLogEntry>& InMemoryLog, int32 InTrueLoyalty, int32 InPublicLoyalty);

	UFUNCTION(BlueprintPure, Category = "Character Memory")
	int32 GetTrueLoyalty() const { return CurrentTraits.TrueLoyalty; }

	UFUNCTION(BlueprintPure, Category = "Character Memory")
	int32 GetPublicLoyalty() const { return CurrentTraits.PublicLoyalty; }

	/** Usado pelo DialogueRuntime para decidir se o NPC menciona uma decisão passada específica. */
	UFUNCTION(BlueprintPure, Category = "Character Memory")
	bool HasMemoryOf(FName DecisionId) const;

	UFUNCTION(BlueprintPure, Category = "Character Memory")
	const TArray<FMemoryLogEntry>& GetMemoryLog() const { return MemoryLog; }

	UPROPERTY(BlueprintReadOnly, Category = "Character Memory")
	FName CharacterId;

protected:
	UPROPERTY(BlueprintReadOnly, Category = "Character Memory")
	FCharacterTraits CurrentTraits;

	UPROPERTY(BlueprintReadOnly, Category = "Character Memory")
	TArray<FMemoryLogEntry> MemoryLog;
};
