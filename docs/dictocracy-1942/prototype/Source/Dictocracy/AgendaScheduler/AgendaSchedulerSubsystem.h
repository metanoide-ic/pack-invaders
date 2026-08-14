// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Versão mínima do AgendaScheduler (GDD 5.3): mantém uma lista de itens de agenda
// para o dia atual (reuniões disponíveis) e avança o dia delegando para o
// DecisionSystemSubsystem (que dispara os efeitos atrasados).
//
// AddAgendaItem permite que algo (hoje, um binding simples no Level Blueprint escutando
// UDecisionSystemSubsystem::OnDelayedEffectManifested) injete um novo item na agenda em
// reação a um evento — é o que fecha a cadeia "consultar Eden agora -> avaliação dele
// aparece na agenda dali a 3 dias -> nova decisão". O que fica para a Fase 3 é o
// AVALIADOR GENÉRICO de condições de ativação (FConditionExpr do modelo de dados
// completo, ver 05-modelo-de-dados.md) — aqui a ligação evento->item é feita a mão,
// uma de cada vez, sem motor de regras por trás.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "AgendaSchedulerSubsystem.generated.h"

USTRUCT(BlueprintType)
struct FAgendaItem
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Agenda")
	FName ItemId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Agenda")
	FText Title;

	/** Se true, item já foi atendido pelo jogador nesta sessão de agenda. */
	UPROPERTY(BlueprintReadOnly, Category = "Agenda")
	bool bAttended = false;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnAgendaAdvanced);

UCLASS()
class AGENDASCHEDULER_API UAgendaSchedulerSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Agenda")
	void SetTodayAgenda(const TArray<FAgendaItem>& Items);

	/** Adiciona um item à agenda do dia atual sem substituir os existentes. Idempotente por
	 *  ItemId — chamar duas vezes com o mesmo ItemId não duplica o item. */
	UFUNCTION(BlueprintCallable, Category = "Agenda")
	void AddAgendaItem(const FAgendaItem& Item);

	UFUNCTION(BlueprintCallable, Category = "Agenda")
	void MarkAttended(FName ItemId);

	UFUNCTION(BlueprintPure, Category = "Agenda")
	const TArray<FAgendaItem>& GetTodayAgenda() const { return TodayAgenda; }

	/** Avança para o próximo dia: itens não atendidos geram custo (registrado como log; a
	 *  consequência sistêmica de agenda ignorada é escopo de Fase 3), e delega o avanço
	 *  temporal ao DecisionSystemSubsystem para dar gatilho aos efeitos atrasados. */
	UFUNCTION(BlueprintCallable, Category = "Agenda")
	void AdvanceToNextDay();

	UPROPERTY(BlueprintAssignable, Category = "Agenda")
	FOnAgendaAdvanced OnAgendaAdvanced;

private:
	UPROPERTY()
	TArray<FAgendaItem> TodayAgenda;
};
