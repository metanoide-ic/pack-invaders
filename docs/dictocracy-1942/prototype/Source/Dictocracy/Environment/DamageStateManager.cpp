// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "DamageStateManager.h"
#include "DecisionSystem/DecisionSystemSubsystem.h"

ADamageStateManager::ADamageStateManager()
{
	PrimaryActorTick.bCanEverTick = false;
}

UDecisionSystemSubsystem* ADamageStateManager::GetDecisionSystem() const
{
	if (const UWorld* World = GetWorld())
	{
		if (UGameInstance* GameInstance = World->GetGameInstance())
		{
			return GameInstance->GetSubsystem<UDecisionSystemSubsystem>();
		}
	}
	return nullptr;
}

void ADamageStateManager::BeginPlay()
{
	Super::BeginPlay();

	if (UDecisionSystemSubsystem* DecisionSystem = GetDecisionSystem())
	{
		DecisionSystem->OnDecisionResolved.AddDynamic(this, &ADamageStateManager::HandleDecisionResolved);
		DecisionSystem->OnDelayedEffectManifested.AddDynamic(this, &ADamageStateManager::HandleDelayedEffectManifested);

		// Avalia o estado inicial imediatamente — não espera pela primeira decisão para refletir
		// o valor de partida do indicador (relevante ao carregar um save, por exemplo).
		EvaluateState();
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("DamageStateManager '%s': DecisionSystemSubsystem indisponível em BeginPlay — nenhum estado será avaliado."), *GetName());
	}
}

void ADamageStateManager::HandleDecisionResolved(FName DecisionId, FName OptionId, EDecisionOptionType Type)
{
	EvaluateState();
}

void ADamageStateManager::HandleDelayedEffectManifested(FName SourceDecisionId, FName SourceOptionId, const FDelayedEffect& Effect)
{
	EvaluateState();
}

int32 ADamageStateManager::ComputeStateForValue(int32 IndicatorValue) const
{
	// Thresholds em ordem crescente de severidade de dano (valores decrescentes do indicador).
	// Estado 0 enquanto o valor não cruzar o primeiro limiar; incrementa a cada limiar cruzado.
	int32 State = 0;
	for (const int32 Threshold : Thresholds)
	{
		if (IndicatorValue < Threshold)
		{
			++State;
		}
		else
		{
			break;
		}
	}
	return State;
}

void ADamageStateManager::EvaluateState()
{
	const UDecisionSystemSubsystem* DecisionSystem = GetDecisionSystem();
	if (!DecisionSystem || ObservedIndicatorName.IsNone())
	{
		return;
	}

	const int32 IndicatorValue = DecisionSystem->GetIndicatorValue(ObservedIndicatorName);
	const int32 NewState = ComputeStateForValue(IndicatorValue);

	if (!bHasEvaluatedOnce || NewState != CurrentStateIndex)
	{
		// Na primeira avaliação, PreviousState == NewState propositalmente: sinaliza ao Blueprint
		// "isto é o estado inicial, não uma transição real" — evita que o BP dispare uma
		// animação/efeito de transição indevido só por causa da avaliação de BeginPlay.
		const int32 PreviousState = bHasEvaluatedOnce ? CurrentStateIndex : NewState;
		CurrentStateIndex = NewState;
		bHasEvaluatedOnce = true;
		OnDamageStateChanged(NewState, PreviousState);
	}
}
