// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Teste de regressão para o bug encontrado e corrigido durante a autoria deste protótipo:
// o impacto de lealdade de uma resposta de diálogo era aplicado ao NPC que fala o nó atual
// (SpeakerCharacterId), mesmo quando a intenção narrativa era que outro personagem reagisse
// à escolha (ex.: nó falado por Eden, mas a escolha deveria refletir na confiança de Brooke).
// Corrigido com o campo FDialogueResponse::LoyaltyTargetCharacterId — este teste garante que
// a regressão não volte silenciosamente em uma refatoração futura.

#include "CoreMinimal.h"
#include "Misc/AutomationTest.h"

#if WITH_DEV_AUTOMATION_TESTS

#include "DialogueRuntime/DialogueRuntimeComponent.h"
#include "DialogueRuntime/DialogueRuntimeTypes.h"
#include "CharacterMemory/CharacterMemoryComponent.h"
#include "Engine/DataTable.h"
#include "Engine/World.h"
#include "GameFramework/Actor.h"

namespace DictocracyTests
{
	UDataTable* BuildTestDialogueTable(UObject* Outer)
	{
		UDataTable* Table = NewObject<UDataTable>(Outer);
		Table->RowStruct = FDialogueNode::StaticStruct();

		FDialogueNode Node;
		Node.NodeId = FName("eden_warning");
		Node.SpeakerCharacterId = FName("eden"); // quem FALA o nó...

		FDialogueResponse Response;
		Response.ResponseId = FName("decide_refuse");
		Response.NextNodeId = NAME_None; // encerra o diálogo
		Response.LoyaltyTargetCharacterId = FName("brooke"); // ...mas quem DEVE reagir é Brooke.
		Response.LoyaltyImpact = -4;
		Node.Responses.Add(Response);

		Table->AddRow(FName("eden_warning"), Node);
		return Table;
	}

	AActor* SpawnActorWithMemory(UWorld* World, FName CharacterId)
	{
		AActor* Actor = World->SpawnActor<AActor>();
		UCharacterMemoryComponent* Memory = NewObject<UCharacterMemoryComponent>(Actor);
		Memory->RegisterComponent();
		Actor->AddInstanceComponent(Memory);

		FCharacterData Data;
		Data.CharacterId = CharacterId;
		Data.Traits.TrueLoyalty = 65;
		Memory->InitializeFromData(Data);

		return Actor;
	}
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDialogueRuntimeLoyaltyTargetRegressionTest,
	"Dictocracy.DialogueRuntime.SelectResponse_AppliesLoyaltyToExplicitTargetNotSpeaker",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FDialogueRuntimeLoyaltyTargetRegressionTest::RunTest(const FString& Parameters)
{
	UWorld* World = UWorld::CreateWorld(EWorldType::Game, /*bInformEngineOfWorld=*/false);
	if (!TestNotNull(TEXT("Mundo de teste criado"), World))
	{
		return false;
	}

	AActor* EdenActor = DictocracyTests::SpawnActorWithMemory(World, FName("eden"));
	AActor* BrookeActor = DictocracyTests::SpawnActorWithMemory(World, FName("brooke"));

	AActor* PlayerActor = World->SpawnActor<AActor>();
	UDialogueRuntimeComponent* DialogueRuntime = NewObject<UDialogueRuntimeComponent>(PlayerActor);
	DialogueRuntime->RegisterComponent();
	PlayerActor->AddInstanceComponent(DialogueRuntime);

	DialogueRuntime->RegisterParticipant(FName("eden"), EdenActor);
	DialogueRuntime->RegisterParticipant(FName("brooke"), BrookeActor);

	UDataTable* DialogueTable = DictocracyTests::BuildTestDialogueTable(PlayerActor);
	DialogueRuntime->StartDialogue(DialogueTable, FName("eden_warning"));

	UCharacterMemoryComponent* EdenMemory = EdenActor->FindComponentByClass<UCharacterMemoryComponent>();
	UCharacterMemoryComponent* BrookeMemory = BrookeActor->FindComponentByClass<UCharacterMemoryComponent>();
	const int32 EdenLoyaltyBefore = EdenMemory->GetTrueLoyalty();
	const int32 BrookeLoyaltyBefore = BrookeMemory->GetTrueLoyalty();

	DialogueRuntime->SelectResponse(FName("decide_refuse"));

	TestEqual(TEXT("Lealdade de Eden (falante do nó) NÃO muda — não é o alvo da resposta"),
		EdenMemory->GetTrueLoyalty(), EdenLoyaltyBefore);

	TestEqual(TEXT("Lealdade de Brooke (alvo explícito via LoyaltyTargetCharacterId) reflete o impacto de -4"),
		BrookeMemory->GetTrueLoyalty(), BrookeLoyaltyBefore - 4);

	World->DestroyWorld(false);
	return true;
}

#endif // WITH_DEV_AUTOMATION_TESTS
