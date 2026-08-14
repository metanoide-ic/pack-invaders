// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.

#include "CoreMinimal.h"
#include "Misc/AutomationTest.h"

#if WITH_DEV_AUTOMATION_TESTS

#include "AgendaScheduler/AgendaSchedulerSubsystem.h"
#include "Engine/GameInstance.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FAgendaSchedulerAddItemIsIdempotentTest,
	"Dictocracy.AgendaScheduler.AddAgendaItem_IsIdempotentByItemId",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FAgendaSchedulerAddItemIsIdempotentTest::RunTest(const FString& Parameters)
{
	UAgendaSchedulerSubsystem* Scheduler = NewObject<UAgendaSchedulerSubsystem>();

	FAgendaItem Item;
	Item.ItemId = FName("eden_assessment");
	Item.Title = FText::FromString(TEXT("Avaliação de Eden"));

	Scheduler->AddAgendaItem(Item);
	TestEqual(TEXT("Item adicionado uma vez"), Scheduler->GetTodayAgenda().Num(), 1);

	// Simula o evento disparando de novo (ex.: binding acionado mais de uma vez) — não deve duplicar.
	Scheduler->AddAgendaItem(Item);
	TestEqual(TEXT("Item com mesmo ItemId não duplica"), Scheduler->GetTodayAgenda().Num(), 1);

	FAgendaItem OtherItem;
	OtherItem.ItemId = FName("routine_briefing");
	Scheduler->AddAgendaItem(OtherItem);
	TestEqual(TEXT("Item com ItemId diferente é adicionado normalmente"), Scheduler->GetTodayAgenda().Num(), 2);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FAgendaSchedulerAdvanceClearsAgendaTest,
	"Dictocracy.AgendaScheduler.AdvanceToNextDay_ClearsAgendaForNextDay",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FAgendaSchedulerAdvanceClearsAgendaTest::RunTest(const FString& Parameters)
{
	// UGameInstanceSubsystem::GetGameInstance() usa CastChecked(GetOuter()) — chamado dentro de
	// AdvanceToNextDay(). Um subsistema criado via NewObject() sem outer NÃO é seguro de usar aqui
	// (o CastChecked falharia/crasharia, não retornaria nullptr graciosamente). Por isso o teste
	// precisa de um UGameInstance real como outer, mesmo sem chamar Init() nele — GetSubsystem<T>()
	// sobre uma FSubsystemCollection nunca inicializada apenas retorna nullptr, sem crash.
	UGameInstance* GameInstance = NewObject<UGameInstance>();
	UAgendaSchedulerSubsystem* Scheduler = NewObject<UAgendaSchedulerSubsystem>(GameInstance);

	FAgendaItem Item;
	Item.ItemId = FName("meeting_1");
	Scheduler->AddAgendaItem(Item);
	TestEqual(TEXT("Agenda tem 1 item antes de avançar"), Scheduler->GetTodayAgenda().Num(), 1);

	// GameInstance->GetSubsystem<UDecisionSystemSubsystem>() retorna nullptr aqui (subsistema nunca
	// inicializado via Init()), então o avanço do DecisionSystem é pulado — este teste verifica
	// apenas o efeito sobre a própria agenda. A integração completa (dia avança em ambos os
	// subsistemas dentro de um GameInstance real, inicializado) é coberta pelo teste de fluxo manual
	// em Testing/guia-de-execucao-e-testes.md, que roda dentro de uma sessão real de PIE.
	Scheduler->AdvanceToNextDay();

	TestEqual(TEXT("Agenda esvaziada após avançar o dia"), Scheduler->GetTodayAgenda().Num(), 0);

	return true;
}

#endif // WITH_DEV_AUTOMATION_TESTS
