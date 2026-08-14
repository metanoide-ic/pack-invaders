// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Modelo de diálogo do protótipo: uma FDialogueNode apresenta uma fala de um NPC e uma
// lista de FDialogueResponse do jogador. Cada resposta pode levar a outro nó, encerrar
// o diálogo, e/ou disparar uma decisão do DecisionSystem. Isto é deliberadamente mais
// simples que o DialogueRuntime completo do GDD (sem InfoFidelity, sem estado emocional
// dinâmico do NPC) — suficiente para a cena de reunião com 3 NPCs do protótipo.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "DictocracyCore/DictocracyDataTypes.h"
#include "DialogueRuntimeTypes.generated.h"

USTRUCT(BlueprintType)
struct FDialogueResponse
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Response")
	FName ResponseId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Response")
	FText Label;

	/** Tipo da resposta — reaproveita o enum de opções de decisão para manter o vocabulário único no jogo inteiro. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Response")
	EDecisionOptionType Type = EDecisionOptionType::Approve;

	/** Próximo nó de diálogo. NAME_None encerra o diálogo. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Flow")
	FName NextNodeId;

	/** Se preenchido, esta resposta resolve a decisão indicada com a opção indicada ao ser escolhida. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Flow")
	FName LinkedDecisionId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Flow")
	FName LinkedDecisionOptionId;

	/** Impacto direto na lealdade real de um NPC, registrado via CharacterMemoryComponent.
	 *  Deliberadamente separado de SpeakerCharacterId (o falante do nó): a resposta pode
	 *  reagir a uma pessoa diferente de quem fez a última fala (ex.: nó falado por Eden,
	 *  mas a escolha do jogador reflete principalmente na confiança de Brooke). Se vazio
	 *  (NAME_None), aplica ao SpeakerCharacterId do nó como padrão. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Flow")
	FName LoyaltyTargetCharacterId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Flow")
	int32 LoyaltyImpact = 0;
};

USTRUCT(BlueprintType)
struct FDialogueNode : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Node")
	FName NodeId;

	/** Qual NPC fala este nó — deve casar com FCharacterData::CharacterId. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Node")
	FName SpeakerCharacterId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Node", meta = (MultiLine = true))
	FText SpeakerLine;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Node")
	TArray<FDialogueResponse> Responses;
};
