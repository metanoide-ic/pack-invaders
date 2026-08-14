// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "CharacterMemoryComponent.h"

UCharacterMemoryComponent::UCharacterMemoryComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UCharacterMemoryComponent::InitializeFromData(const FCharacterData& InData)
{
	CharacterId = InData.CharacterId;
	CurrentTraits = InData.Traits;
	MemoryLog.Empty();
}

void UCharacterMemoryComponent::RecordDecisionImpact(FName DecisionId, FName OptionId, int32 CurrentDay, int32 LoyaltyImpact)
{
	FMemoryLogEntry Entry;
	Entry.DecisionId = DecisionId;
	Entry.ChosenOptionId = OptionId;
	Entry.DayOccurred = CurrentDay;
	Entry.LoyaltyImpact = LoyaltyImpact;
	MemoryLog.Add(Entry);

	// TrueLoyalty é o valor real, que pode divergir do que o NPC expressa publicamente (PublicLoyalty).
	// No protótipo, aplicamos o impacto diretamente; a Fase 3 introduz atenuação por traço
	// (ex.: personagens com Courage alto reagem menos a ameaças, mais a incompetência).
	CurrentTraits.TrueLoyalty = FMath::Clamp(CurrentTraits.TrueLoyalty + LoyaltyImpact, 0, 100);
}

void UCharacterMemoryComponent::RestoreSavedState(const TArray<FMemoryLogEntry>& InMemoryLog, int32 InTrueLoyalty, int32 InPublicLoyalty)
{
	MemoryLog = InMemoryLog;
	CurrentTraits.TrueLoyalty = FMath::Clamp(InTrueLoyalty, 0, 100);
	CurrentTraits.PublicLoyalty = FMath::Clamp(InPublicLoyalty, 0, 100);
}

bool UCharacterMemoryComponent::HasMemoryOf(FName DecisionId) const
{
	return MemoryLog.ContainsByPredicate(
		[DecisionId](const FMemoryLogEntry& Entry) { return Entry.DecisionId == DecisionId; });
}
