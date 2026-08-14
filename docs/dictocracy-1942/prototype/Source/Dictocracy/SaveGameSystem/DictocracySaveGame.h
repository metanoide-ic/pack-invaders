// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Save versionado desde o protótipo (regra do GDD arquitetura 5.7). SaveSchemaVersion
// permite migração incremental em patches futuros sem quebrar saves antigos.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "CharacterMemory/CharacterMemoryComponent.h"
#include "DictocracySaveGame.generated.h"

/** Snapshot de um NPC salvo — espelha CharacterMemoryComponent sem depender de ponteiro de ator. */
USTRUCT()
struct FSavedCharacterMemory
{
	GENERATED_BODY()

	UPROPERTY()
	FName CharacterId;

	UPROPERTY()
	int32 TrueLoyalty = 50;

	UPROPERTY()
	int32 PublicLoyalty = 50;

	UPROPERTY()
	TArray<FMemoryLogEntry> MemoryLog;
};

UCLASS()
class SAVEGAMESYSTEM_API UDictocracySaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	/** Incrementar a cada mudança de schema que quebre compatibilidade. UpgradeFromVersion trata a migração. */
	UPROPERTY()
	int32 SaveSchemaVersion = 1;

	UPROPERTY()
	FString SlotName = TEXT("PrototypeSlot");

	UPROPERTY()
	int32 CurrentDay = 0;

	UPROPERTY()
	TMap<FName, int32> WorldIndicators;

	UPROPERTY()
	TArray<FSavedCharacterMemory> CharacterMemories;

	/** Decisões já resolvidas nesta sessão (evita reoferecer a mesma decisão duas vezes). */
	UPROPERTY()
	TArray<FName> ResolvedDecisionIds;
};
