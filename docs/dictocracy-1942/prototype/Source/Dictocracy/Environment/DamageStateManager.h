// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Faz parte do módulo principal de jogo (Dictocracy), não de um módulo de sistema —
// é presentation-layer (GDD arquitetura 5.1: "C++ para performance-critical e regras;
// Blueprint para staging de câmera, interação ambiental"). A REGRA de qual estado
// visual vale para qual faixa de indicador é C++ (determinística, testável); a TROCA
// de material/mesh em si é responsabilidade do Blueprint que herda desta classe
// (BP_DamageStateManager, ver ../Blueprints/especificacao-blueprints.md), via o evento
// BlueprintImplementableEvent abaixo.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DictocracyCore/DictocracyDataTypes.h"
#include "DamageStateManager.generated.h"

class UDecisionSystemSubsystem;

UCLASS(Abstract, Blueprintable)
class ADamageStateManager : public AActor
{
	GENERATED_BODY()

public:
	ADamageStateManager();

	virtual void BeginPlay() override;

protected:
	/** Indicador do DecisionSystemSubsystem observado (ex.: "GermanIndustrialOutput"). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Damage State")
	FName ObservedIndicatorName;

	/** Limiares em ordem crescente. Estado 0 = valor >= Thresholds[0]; estado N = valor < Thresholds[N-1].
	 *  Ex.: Thresholds = [-5, -10] com 3 estados possíveis: intacto (valor >= -5), danificado
	 *  (-10 <= valor < -5), crítico (valor < -10) — espelha a progressão de 3 estados do GDD (8.2). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Damage State")
	TArray<int32> Thresholds;

	/** Implementado em Blueprint: troca material/mesh/iluminação para refletir o novo estado.
	 *  Chamado apenas quando o estado realmente muda, nunca a cada avaliação — evita custo de
	 *  troca de material redundante e mantém o histórico de estado legível em log. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Damage State")
	void OnDamageStateChanged(int32 NewStateIndex, int32 PreviousStateIndex);

private:
	UFUNCTION()
	void HandleDecisionResolved(FName DecisionId, FName OptionId, EDecisionOptionType Type);

	UFUNCTION()
	void HandleDelayedEffectManifested(FName SourceDecisionId, FName SourceOptionId, const FDelayedEffect& Effect);

	void EvaluateState();
	int32 ComputeStateForValue(int32 IndicatorValue) const;

	UDecisionSystemSubsystem* GetDecisionSystem() const;

	int32 CurrentStateIndex = 0;
	bool bHasEvaluatedOnce = false;
};
