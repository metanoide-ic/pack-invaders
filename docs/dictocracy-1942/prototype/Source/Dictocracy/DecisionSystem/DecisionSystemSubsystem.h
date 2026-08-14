// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// GameInstanceSubsystem = único por sessão de jogo, sobrevive a transições de nível
// (escritório -> mapa estratégico), que é exatamente o requisito do GDD de não ter
// hitch/perda de estado na transição ambiente<->mapa.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "DictocracyCore/DictocracyDataTypes.h"
#include "DecisionSystemSubsystem.generated.h"

class UDataTable;

/** Um efeito atrasado já agendado, aguardando a data de manifestação (dia de jogo). */
USTRUCT()
struct FPendingDelayedEffect
{
	GENERATED_BODY()

	UPROPERTY()
	int32 ManifestOnDay = 0;

	UPROPERTY()
	FDelayedEffect Effect;

	UPROPERTY()
	FName SourceDecisionId;

	UPROPERTY()
	FName SourceOptionId;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnDecisionResolved, FName, DecisionId, FName, OptionId, EDecisionOptionType, Type);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDelayedEffectManifested, const FDelayedEffect&, Effect);

/**
 * Runtime de avaliação de decisões (ver GDD 5.3 / 6.3).
 * Responsabilidades no escopo do protótipo:
 *  - Resolver uma decisão a partir da opção escolhida pelo jogador.
 *  - Aplicar efeitos imediatos a um mapa de indicadores em memória (WorldSim completo é Fase 3).
 *  - Agendar e disparar efeitos atrasados quando o dia de jogo correspondente chega.
 *  - Nunca perder um efeito atrasado — é isso que prova ao jogador que a decisão teve peso.
 */
UCLASS()
class DECISIONSYSTEM_API UDecisionSystemSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	/** Fonte de dados de decisões — atribuída no BeginPlay do GameMode do protótipo. */
	UFUNCTION(BlueprintCallable, Category = "Decision System")
	void SetDecisionTable(UDataTable* InDecisionTable);

	/** Avança o "dia de jogo" e dispara qualquer efeito atrasado cujo prazo chegou. Chamado pelo AgendaScheduler. */
	UFUNCTION(BlueprintCallable, Category = "Decision System")
	void AdvanceDay();

	/** Resolve a decisão indicada aplicando a opção escolhida. Retorna false se DecisionId/OptionId não existem. */
	UFUNCTION(BlueprintCallable, Category = "Decision System")
	bool ResolveDecision(FName DecisionId, FName OptionId);

	UFUNCTION(BlueprintPure, Category = "Decision System")
	int32 GetIndicatorValue(FName IndicatorName) const;

	UFUNCTION(BlueprintPure, Category = "Decision System")
	int32 GetCurrentDay() const { return CurrentDay; }

	/** Usado pelo SaveGameSystem para serializar o estado completo de indicadores. */
	const TMap<FName, int32>& GetAllIndicators() const { return Indicators; }

	/** Usado pelo SaveGameSystem ao carregar um slot — restaura dia e indicadores diretamente,
	 *  sem passar pelo fluxo normal de ResolveDecision/AdvanceDay. Efeitos atrasados pendentes
	 *  não sobrevivem ao save no protótipo (limitação aceita — ver Testing/guia-de-execucao-e-testes.md). */
	UFUNCTION(BlueprintCallable, Category = "Decision System")
	void RestoreState(int32 InCurrentDay, const TMap<FName, int32>& InIndicators);

	UPROPERTY(BlueprintAssignable, Category = "Decision System")
	FOnDecisionResolved OnDecisionResolved;

	UPROPERTY(BlueprintAssignable, Category = "Decision System")
	FOnDelayedEffectManifested OnDelayedEffectManifested;

private:
	void ApplyEffects(const TArray<FWorldSimMutation>& Effects);

	UPROPERTY()
	TObjectPtr<UDataTable> DecisionTable = nullptr;

	UPROPERTY()
	TMap<FName, int32> Indicators;

	UPROPERTY()
	TArray<FPendingDelayedEffect> PendingEffects;

	int32 CurrentDay = 0;
};
