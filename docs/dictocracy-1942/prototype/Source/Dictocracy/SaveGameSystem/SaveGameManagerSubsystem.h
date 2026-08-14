// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SaveGameManagerSubsystem.generated.h"

UCLASS()
class SAVEGAMESYSTEM_API USaveGameManagerSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	/** Coleta estado do DecisionSystemSubsystem e de todos os CharacterMemoryComponent
	 *  presentes no mundo atual, e grava no slot indicado. */
	UFUNCTION(BlueprintCallable, Category = "Save Game")
	bool SavePrototype(const FString& SlotName);

	/** Carrega o slot indicado e reaplica o estado ao DecisionSystemSubsystem e aos
	 *  CharacterMemoryComponent correspondentes (casados por CharacterId). */
	UFUNCTION(BlueprintCallable, Category = "Save Game")
	bool LoadPrototype(const FString& SlotName);

	UFUNCTION(BlueprintPure, Category = "Save Game")
	bool DoesSlotExist(const FString& SlotName) const;
};
