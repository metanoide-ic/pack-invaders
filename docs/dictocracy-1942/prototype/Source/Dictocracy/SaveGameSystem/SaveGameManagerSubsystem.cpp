// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "SaveGameManagerSubsystem.h"
#include "DictocracySaveGame.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"
#include "DecisionSystem/DecisionSystemSubsystem.h"
#include "CharacterMemory/CharacterMemoryComponent.h"

bool USaveGameManagerSubsystem::SavePrototype(const FString& SlotName)
{
	UDictocracySaveGame* SaveObject = Cast<UDictocracySaveGame>(
		UGameplayStatics::CreateSaveGameObject(UDictocracySaveGame::StaticClass()));
	if (!SaveObject)
	{
		UE_LOG(LogTemp, Error, TEXT("SaveGameManager: falha ao criar UDictocracySaveGame."));
		return false;
	}

	SaveObject->SlotName = SlotName;

	if (UDecisionSystemSubsystem* DecisionSystem = GetGameInstance()->GetSubsystem<UDecisionSystemSubsystem>())
	{
		SaveObject->CurrentDay = DecisionSystem->GetCurrentDay();
		SaveObject->WorldIndicators = DecisionSystem->GetAllIndicators();
	}

	// Percorre todos os CharacterMemoryComponent presentes no mundo atual.
	// Nota: isto assume que o nível de protótipo mantém os NPCs carregados; em um nível
	// maior/streaming isso precisaria consultar um registro central em vez do mundo (Fase 3).
	if (UWorld* World = GetGameInstance()->GetWorld())
	{
		for (TActorIterator<AActor> It(World); It; ++It)
		{
			if (UCharacterMemoryComponent* Memory = It->FindComponentByClass<UCharacterMemoryComponent>())
			{
				FSavedCharacterMemory Saved;
				Saved.CharacterId = Memory->CharacterId;
				Saved.TrueLoyalty = Memory->GetTrueLoyalty();
				Saved.PublicLoyalty = Memory->GetPublicLoyalty();
				Saved.MemoryLog = Memory->GetMemoryLog();
				SaveObject->CharacterMemories.Add(Saved);
			}
		}
	}

	const bool bSuccess = UGameplayStatics::SaveGameToSlot(SaveObject, SlotName, 0);
	UE_LOG(LogTemp, Log, TEXT("SaveGameManager: save no slot '%s' -> %s"), *SlotName, bSuccess ? TEXT("sucesso") : TEXT("falhou"));
	return bSuccess;
}

bool USaveGameManagerSubsystem::LoadPrototype(const FString& SlotName)
{
	if (!UGameplayStatics::DoesSaveGameExist(SlotName, 0))
	{
		UE_LOG(LogTemp, Warning, TEXT("SaveGameManager: slot '%s' não existe."), *SlotName);
		return false;
	}

	UDictocracySaveGame* SaveObject = Cast<UDictocracySaveGame>(UGameplayStatics::LoadGameFromSlot(SlotName, 0));
	if (!SaveObject)
	{
		UE_LOG(LogTemp, Error, TEXT("SaveGameManager: falha ao carregar slot '%s'."), *SlotName);
		return false;
	}

	if (SaveObject->SaveSchemaVersion != 1)
	{
		// Ponto de extensão para migração incremental (UpgradeFromVersion) — nenhuma versão
		// além da 1 existe ainda no protótipo, então isto é apenas o gancho previsto.
		UE_LOG(LogTemp, Warning, TEXT("SaveGameManager: schema de save (%d) diferente do esperado (1). Migração não implementada no protótipo."), SaveObject->SaveSchemaVersion);
	}

	if (UDecisionSystemSubsystem* DecisionSystem = GetGameInstance()->GetSubsystem<UDecisionSystemSubsystem>())
	{
		DecisionSystem->RestoreState(SaveObject->CurrentDay, SaveObject->WorldIndicators);
	}

	if (UWorld* World = GetGameInstance()->GetWorld())
	{
		for (TActorIterator<AActor> It(World); It; ++It)
		{
			if (UCharacterMemoryComponent* Memory = It->FindComponentByClass<UCharacterMemoryComponent>())
			{
				const FSavedCharacterMemory* Match = SaveObject->CharacterMemories.FindByPredicate(
					[Memory](const FSavedCharacterMemory& Saved) { return Saved.CharacterId == Memory->CharacterId; });

				if (Match)
				{
					Memory->RestoreSavedState(Match->MemoryLog, Match->TrueLoyalty, Match->PublicLoyalty);
				}
			}
		}
	}

	UE_LOG(LogTemp, Log, TEXT("SaveGameManager: slot '%s' carregado. Dia %d."), *SlotName, SaveObject->CurrentDay);
	return true;
}

bool USaveGameManagerSubsystem::DoesSlotExist(const FString& SlotName) const
{
	return UGameplayStatics::DoesSaveGameExist(SlotName, 0);
}
