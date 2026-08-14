// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "CoreMinimal.h"
#include "Misc/AutomationTest.h"

#if WITH_DEV_AUTOMATION_TESTS

#include "CharacterMemory/CharacterMemoryComponent.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FCharacterMemoryLoyaltyClampTest,
	"Dictocracy.CharacterMemory.RecordDecisionImpact_ClampsLoyaltyTo0_100",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FCharacterMemoryLoyaltyClampTest::RunTest(const FString& Parameters)
{
	UCharacterMemoryComponent* Memory = NewObject<UCharacterMemoryComponent>();

	FCharacterData Data;
	Data.CharacterId = FName("brooke");
	Data.Traits.TrueLoyalty = 65;
	Memory->InitializeFromData(Data);

	// Impacto extremo negativo não deve derrubar o valor abaixo de 0.
	Memory->RecordDecisionImpact(FName("dec1"), FName("refuse"), 1, -999);
	TestEqual(TEXT("TrueLoyalty clampado em 0 após impacto extremo negativo"), Memory->GetTrueLoyalty(), 0);

	// Impacto extremo positivo não deve ultrapassar 100.
	Memory->RecordDecisionImpact(FName("dec2"), FName("approve"), 2, 999);
	TestEqual(TEXT("TrueLoyalty clampado em 100 após impacto extremo positivo"), Memory->GetTrueLoyalty(), 100);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FCharacterMemoryHasMemoryOfTest,
	"Dictocracy.CharacterMemory.HasMemoryOf_TrueOnlyAfterDecisionRecorded",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FCharacterMemoryHasMemoryOfTest::RunTest(const FString& Parameters)
{
	UCharacterMemoryComponent* Memory = NewObject<UCharacterMemoryComponent>();
	FCharacterData Data;
	Data.CharacterId = FName("eden");
	Memory->InitializeFromData(Data);

	TestFalse(TEXT("Nenhuma memória antes de qualquer decisão"), Memory->HasMemoryOf(FName("raid_duisburg")));

	Memory->RecordDecisionImpact(FName("raid_duisburg"), FName("modify"), 1, 2);

	TestTrue(TEXT("Memória presente após a decisão ser registrada"), Memory->HasMemoryOf(FName("raid_duisburg")));
	TestFalse(TEXT("Memória de uma decisão não relacionada continua ausente"), Memory->HasMemoryOf(FName("other_decision")));

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FCharacterMemoryRestoreDoesNotRecomputeTest,
	"Dictocracy.CharacterMemory.RestoreSavedState_SetsExactValuesWithoutRecalculating",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FCharacterMemoryRestoreDoesNotRecomputeTest::RunTest(const FString& Parameters)
{
	UCharacterMemoryComponent* Memory = NewObject<UCharacterMemoryComponent>();
	FCharacterData Data;
	Data.CharacterId = FName("brooke");
	Data.Traits.TrueLoyalty = 65;
	Data.Traits.PublicLoyalty = 70;
	Memory->InitializeFromData(Data);

	TArray<FMemoryLogEntry> SavedLog;
	FMemoryLogEntry Entry;
	Entry.DecisionId = FName("raid_duisburg");
	Entry.ChosenOptionId = FName("approve");
	Entry.DayOccurred = 3;
	Entry.LoyaltyImpact = 4;
	SavedLog.Add(Entry);

	// Valor salvo é diferente do que seria obtido recalculando a partir do log (65+4=69);
	// RestoreSavedState deve repor exatamente 42, não recalcular.
	Memory->RestoreSavedState(SavedLog, /*InTrueLoyalty=*/42, /*InPublicLoyalty=*/55);

	TestEqual(TEXT("TrueLoyalty é o valor salvo exato, não recalculado"), Memory->GetTrueLoyalty(), 42);
	TestEqual(TEXT("PublicLoyalty é o valor salvo exato"), Memory->GetPublicLoyalty(), 55);
	TestEqual(TEXT("Log restaurado tem o mesmo número de entradas salvas"), Memory->GetMemoryLog().Num(), 1);
	TestTrue(TEXT("Memória da decisão restaurada é reconhecida por HasMemoryOf"), Memory->HasMemoryOf(FName("raid_duisburg")));

	return true;
}

#endif // WITH_DEV_AUTOMATION_TESTS
