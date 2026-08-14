// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "DecisionSystemSubsystem.h"
#include "Engine/DataTable.h"

void UDecisionSystemSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	CurrentDay = 0;
	Indicators.Empty();
	PendingEffects.Empty();
}

void UDecisionSystemSubsystem::SetDecisionTable(UDataTable* InDecisionTable)
{
	DecisionTable = InDecisionTable;
}

void UDecisionSystemSubsystem::ApplyEffects(const TArray<FWorldSimMutation>& Effects)
{
	for (const FWorldSimMutation& Effect : Effects)
	{
		int32& Value = Indicators.FindOrAdd(Effect.IndicatorName);
		Value += Effect.Delta;
	}
}

bool UDecisionSystemSubsystem::ResolveDecision(FName DecisionId, FName OptionId)
{
	if (!DecisionTable)
	{
		UE_LOG(LogTemp, Error, TEXT("DecisionSystemSubsystem::ResolveDecision chamado sem DecisionTable atribuída."));
		return false;
	}

	static const FString ContextString(TEXT("DecisionSystemSubsystem::ResolveDecision"));
	const FDecisionData* Row = DecisionTable->FindRow<FDecisionData>(DecisionId, ContextString);
	if (!Row)
	{
		UE_LOG(LogTemp, Warning, TEXT("DecisionId '%s' não encontrado na tabela de decisões."), *DecisionId.ToString());
		return false;
	}

	const FDecisionOption* ChosenOption = Row->Options.FindByPredicate(
		[OptionId](const FDecisionOption& Option) { return Option.OptionId == OptionId; });

	if (!ChosenOption)
	{
		UE_LOG(LogTemp, Warning, TEXT("OptionId '%s' não existe na decisão '%s'."), *OptionId.ToString(), *DecisionId.ToString());
		return false;
	}

	// Efeito imediato: aplicado agora, sem espera — o jogador vê o resultado na hora.
	ApplyEffects(ChosenOption->ImmediateEffects);

	// Efeitos atrasados: agendados para o dia futuro, nunca aplicados imediatamente.
	// É este bloco que garante a "consequência atrasada" exigida como item obrigatório do protótipo.
	for (const FDelayedEffect& DelayedEffect : ChosenOption->DelayedEffects)
	{
		FPendingDelayedEffect Pending;
		Pending.ManifestOnDay = CurrentDay + FMath::Max(1, DelayedEffect.DelayInDays);
		Pending.Effect = DelayedEffect;
		Pending.SourceDecisionId = DecisionId;
		Pending.SourceOptionId = OptionId;
		PendingEffects.Add(Pending);
	}

	OnDecisionResolved.Broadcast(DecisionId, OptionId, ChosenOption->Type);
	return true;
}

void UDecisionSystemSubsystem::AdvanceDay()
{
	++CurrentDay;

	// Percorre de trás para frente para poder remover com RemoveAtSwap sem invalidar índices seguintes.
	for (int32 Index = PendingEffects.Num() - 1; Index >= 0; --Index)
	{
		const FPendingDelayedEffect& Pending = PendingEffects[Index];
		if (Pending.ManifestOnDay <= CurrentDay)
		{
			ApplyEffects(Pending.Effect.Effects);
			OnDelayedEffectManifested.Broadcast(Pending.SourceDecisionId, Pending.SourceOptionId, Pending.Effect);

			UE_LOG(LogTemp, Log, TEXT("Efeito atrasado da decisão '%s' (opção '%s') manifestou no dia %d."),
				*Pending.SourceDecisionId.ToString(), *Pending.SourceOptionId.ToString(), CurrentDay);

			PendingEffects.RemoveAtSwap(Index);
		}
	}
}

void UDecisionSystemSubsystem::RestoreState(int32 InCurrentDay, const TMap<FName, int32>& InIndicators)
{
	CurrentDay = InCurrentDay;
	Indicators = InIndicators;
	// PendingEffects propositalmente não é restaurado no protótipo — ver nota no header.
	// Fase 3 precisa serializar PendingEffects também, para que nenhuma consequência atrasada
	// se perca ao salvar/carregar; sinalizado aqui para não ser esquecido.
}

int32 UDecisionSystemSubsystem::GetIndicatorValue(FName IndicatorName) const
{
	if (const int32* Value = Indicators.Find(IndicatorName))
	{
		return *Value;
	}
	return 0;
}
