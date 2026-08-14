// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Versão mínima do AgendaScheduler (GDD 5.3): mantém uma lista de itens de agenda
// para o dia atual (reuniões disponíveis) e avança o dia delegando para o
// DecisionSystemSubsystem (que dispara os efeitos atrasados). A geração dinâmica de
// agenda a partir de eventos condicionais fica para a Fase 3 — aqui a agenda do dia
// é fixa/definida por Blueprint, o suficiente para o protótipo (um assistente
// apresentando compromissos do dia).

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
