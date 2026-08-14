// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "DialogueRuntimeComponent.h"
#include "Engine/DataTable.h"
#include "Kismet/GameplayStatics.h"
#include "DecisionSystem/DecisionSystemSubsystem.h"
#include "CharacterMemory/CharacterMemoryComponent.h"

UDialogueRuntimeComponent::UDialogueRuntimeComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UDialogueRuntimeComponent::StartDialogue(UDataTable* InDialogueTable, FName StartNodeId)
{
	DialogueTable = InDialogueTable;
	EnterNode(StartNodeId);
}

void UDialogueRuntimeComponent::RegisterParticipant(FName CharacterId, AActor* CharacterActor)
{
	ParticipantActors.Add(CharacterId, CharacterActor);
}

void UDialogueRuntimeComponent::EnterNode(FName NodeId)
{
	if (!DialogueTable || NodeId.IsNone())
	{
		CurrentNodeId = NAME_None;
		OnDialogueEnded.Broadcast();
		return;
	}

	static const FString ContextString(TEXT("DialogueRuntimeComponent::EnterNode"));
	const FDialogueNode* Node = DialogueTable->FindRow<FDialogueNode>(NodeId, ContextString);
	if (!Node)
	{
		UE_LOG(LogTemp, Warning, TEXT("DialogueRuntime: nó '%s' não encontrado na tabela. Encerrando diálogo."), *NodeId.ToString());
		CurrentNodeId = NAME_None;
		OnDialogueEnded.Broadcast();
		return;
	}

	CurrentNodeId = NodeId;
	OnDialogueNodeEntered.Broadcast(*Node);
}

void UDialogueRuntimeComponent::SelectResponse(FName ResponseId)
{
	if (!DialogueTable || CurrentNodeId.IsNone())
	{
		return;
	}

	static const FString ContextString(TEXT("DialogueRuntimeComponent::SelectResponse"));
	const FDialogueNode* Node = DialogueTable->FindRow<FDialogueNode>(CurrentNodeId, ContextString);
	if (!Node)
	{
		return;
	}

	const FDialogueResponse* Response = Node->Responses.FindByPredicate(
		[ResponseId](const FDialogueResponse& R) { return R.ResponseId == ResponseId; });

	if (!Response)
	{
		UE_LOG(LogTemp, Warning, TEXT("DialogueRuntime: resposta '%s' não existe no nó '%s'."), *ResponseId.ToString(), *CurrentNodeId.ToString());
		return;
	}

	// Se a resposta está vinculada a uma decisão, resolve via DecisionSystemSubsystem antes de avançar o diálogo.
	if (!Response->LinkedDecisionId.IsNone())
	{
		if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
		{
			if (UDecisionSystemSubsystem* DecisionSystem = GameInstance->GetSubsystem<UDecisionSystemSubsystem>())
			{
				DecisionSystem->ResolveDecision(Response->LinkedDecisionId, Response->LinkedDecisionOptionId);
			}
		}
	}

	// Aplica impacto de lealdade ao alvo explícito da resposta (LoyaltyTargetCharacterId), ou,
	// na ausência dele, ao NPC que estava falando neste nó — nunca ao jogador.
	if (Response->LoyaltyImpact != 0)
	{
		const FName TargetCharacterId = Response->LoyaltyTargetCharacterId.IsNone()
			? Node->SpeakerCharacterId
			: Response->LoyaltyTargetCharacterId;

		if (const TWeakObjectPtr<AActor>* SpeakerActor = ParticipantActors.Find(TargetCharacterId))
		{
			if (AActor* Actor = SpeakerActor->Get())
			{
				if (UCharacterMemoryComponent* Memory = Actor->FindComponentByClass<UCharacterMemoryComponent>())
				{
					if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
					{
						const int32 CurrentDay = GameInstance->GetSubsystem<UDecisionSystemSubsystem>()
							? GameInstance->GetSubsystem<UDecisionSystemSubsystem>()->GetCurrentDay()
							: 0;
						Memory->RecordDecisionImpact(Response->LinkedDecisionId, Response->LinkedDecisionOptionId, CurrentDay, Response->LoyaltyImpact);
					}
				}
			}
		}
	}

	EnterNode(Response->NextNodeId);
}
