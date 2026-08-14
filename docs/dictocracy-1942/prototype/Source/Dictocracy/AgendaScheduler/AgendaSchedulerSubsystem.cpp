// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "AgendaSchedulerSubsystem.h"
#include "DecisionSystem/DecisionSystemSubsystem.h"

void UAgendaSchedulerSubsystem::SetTodayAgenda(const TArray<FAgendaItem>& Items)
{
	TodayAgenda = Items;
}

void UAgendaSchedulerSubsystem::AddAgendaItem(const FAgendaItem& Item)
{
	const bool bAlreadyPresent = TodayAgenda.ContainsByPredicate(
		[&Item](const FAgendaItem& Existing) { return Existing.ItemId == Item.ItemId; });

	if (!bAlreadyPresent)
	{
		TodayAgenda.Add(Item);
	}
}

void UAgendaSchedulerSubsystem::MarkAttended(FName ItemId)
{
	if (FAgendaItem* Item = TodayAgenda.FindByPredicate(
		[ItemId](const FAgendaItem& I) { return I.ItemId == ItemId; }))
	{
		Item->bAttended = true;
	}
}

void UAgendaSchedulerSubsystem::AdvanceToNextDay()
{
	for (const FAgendaItem& Item : TodayAgenda)
	{
		if (!Item.bAttended)
		{
			// Escopo de protótipo: apenas log. O custo sistêmico de ignorar a agenda
			// (ministro se sente desprezado, informação chega tarde) é Fase 3.
			UE_LOG(LogTemp, Log, TEXT("Item de agenda '%s' não foi atendido — consequência sistêmica adiada para Fase 3."), *Item.Title.ToString());
		}
	}

	if (UDecisionSystemSubsystem* DecisionSystem = GetGameInstance()->GetSubsystem<UDecisionSystemSubsystem>())
	{
		DecisionSystem->AdvanceDay();
	}

	TodayAgenda.Empty();
	OnAgendaAdvanced.Broadcast();
}
