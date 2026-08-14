// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "DialogueRuntimeTypes.h"
#include "DialogueRuntimeComponent.generated.h"

class UDataTable;
class UDecisionSystemSubsystem;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDialogueNodeEntered, const FDialogueNode&, Node);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnDialogueEnded);

/**
 * Componente anexado ao Player Controller/Pawn do jogador. Conduz uma sessão de diálogo
 * a partir de uma DialogueTable, integrando com o DecisionSystemSubsystem quando uma
 * resposta está vinculada a uma decisão.
 */
UCLASS(ClassGroup = (Dictocracy), meta = (BlueprintSpawnableComponent))
class DIALOGUERUNTIME_API UDialogueRuntimeComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UDialogueRuntimeComponent();

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void StartDialogue(UDataTable* InDialogueTable, FName StartNodeId);

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void SelectResponse(FName ResponseId);

	/** Registra qual ator representa um CharacterId nesta cena, para que o impacto de lealdade
	 *  de uma resposta seja aplicado ao CharacterMemoryComponent correto (o NPC que está falando,
	 *  não o jogador). Chamado pela Blueprint da cena ao posicionar os NPCs da reunião. */
	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void RegisterParticipant(FName CharacterId, AActor* CharacterActor);

	UFUNCTION(BlueprintPure, Category = "Dialogue")
	bool IsInDialogue() const { return DialogueTable != nullptr && !CurrentNodeId.IsNone(); }

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueNodeEntered OnDialogueNodeEntered;

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueEnded OnDialogueEnded;

private:
	void EnterNode(FName NodeId);

	UPROPERTY()
	TObjectPtr<UDataTable> DialogueTable = nullptr;

	UPROPERTY()
	FName CurrentNodeId;

	UPROPERTY()
	TMap<FName, TWeakObjectPtr<AActor>> ParticipantActors;
};
