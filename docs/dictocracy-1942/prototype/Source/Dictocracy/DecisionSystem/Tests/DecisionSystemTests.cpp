// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
//
// Testes de Automation Framework (ver arquitetura técnica 5.8: "testes unitários C++
// para WorldSim, DecisionSystem, InfoFidelity"). No recorte do protótipo, WorldSim e
// InfoFidelity ainda não existem — este arquivo cobre o que existe: DecisionSystem.
//
// UDecisionSystemSubsystem não toca GetGameInstance()/GetWorld() dentro de ResolveDecision
// ou AdvanceDay, então pode ser testado com NewObject() direto, sem subir um UWorld —
// mantém os testes rápidos e sem dependência de PIE.

#include "CoreMinimal.h"
#include "Misc/AutomationTest.h"

#if WITH_DEV_AUTOMATION_TESTS

#include "DecisionSystem/DecisionSystemSubsystem.h"
#include "DictocracyCore/DictocracyDataTypes.h"
#include "Engine/DataTable.h"

namespace DictocracyTests
{
	/** Monta uma DataTable de decisão equivalente a "raid_duisburg" simplificada, só com o
	 *  necessário para exercitar efeito imediato + atrasado, evitando duplicar todo o dado de produção. */
	UDataTable* BuildTestDecisionTable(UObject* Outer)
	{
		UDataTable* Table = NewObject<UDataTable>(Outer);
		Table->RowStruct = FDecisionData::StaticStruct();

		FDecisionData Row;
		Row.DecisionId = TEXT("test_decision");
		Row.Title = FText::FromString(TEXT("Decisão de Teste"));

		FDecisionOption ApproveOption;
		ApproveOption.OptionId = TEXT("approve");
		ApproveOption.Type = EDecisionOptionType::Approve;
		ApproveOption.ImmediateEffects.Add({ FName("IndicatorA"), -8 });

		FDelayedEffect Delayed;
		Delayed.DelayInDays = 10;
		Delayed.Effects.Add({ FName("IndicatorB"), -4 });
		Delayed.ManifestationText = FText::FromString(TEXT("Efeito tardio manifestado."));
		ApproveOption.DelayedEffects.Add(Delayed);

		Row.Options.Add(ApproveOption);

		FDecisionOption RefuseOption;
		RefuseOption.OptionId = TEXT("refuse");
		RefuseOption.Type = EDecisionOptionType::Refuse;
		Row.Options.Add(RefuseOption);

		Table->AddRow(FName("test_decision"), Row);
		return Table;
	}
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDecisionSystemImmediateEffectTest,
	"Dictocracy.DecisionSystem.ResolveDecision_AppliesImmediateEffectRightAway",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FDecisionSystemImmediateEffectTest::RunTest(const FString& Parameters)
{
	UDecisionSystemSubsystem* System = NewObject<UDecisionSystemSubsystem>();
	UDataTable* Table = DictocracyTests::BuildTestDecisionTable(System);
	System->SetDecisionTable(Table);

	TestEqual(TEXT("IndicatorA começa em zero"), System->GetIndicatorValue(FName("IndicatorA")), 0);

	const bool bResolved = System->ResolveDecision(FName("test_decision"), FName("approve"));
	TestTrue(TEXT("ResolveDecision retorna true para decisão/opção válidas"), bResolved);

	TestEqual(TEXT("IndicatorA reflete o efeito imediato assim que a decisão é resolvida"),
		System->GetIndicatorValue(FName("IndicatorA")), -8);

	TestEqual(TEXT("IndicatorB (efeito atrasado) NÃO deve mudar antes do prazo"),
		System->GetIndicatorValue(FName("IndicatorB")), 0);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDecisionSystemDelayedEffectTest,
	"Dictocracy.DecisionSystem.AdvanceDay_ManifestsDelayedEffectOnlyAtDeadline",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FDecisionSystemDelayedEffectTest::RunTest(const FString& Parameters)
{
	// Nota: FOnDelayedEffectManifested é DECLARE_DYNAMIC_MULTICAST_DELEGATE (para ser
	// BlueprintAssignable) — delegates dinâmicos só aceitam bind via AddDynamic/AddUFunction
	// (exigem um UFUNCTION real como alvo), não .AddLambda(), que é exclusivo de delegates
	// multicast não-dinâmicos. Testar o broadcast em si exigiria um UObject auxiliar com
	// UFUNCTION próprio; em vez disso, este teste prova "disparou exatamente uma vez, no dia
	// certo" observando o efeito colateral (o indicador), que é uma prova equivalente e mais simples.
	UDecisionSystemSubsystem* System = NewObject<UDecisionSystemSubsystem>();
	UDataTable* Table = DictocracyTests::BuildTestDecisionTable(System);
	System->SetDecisionTable(Table);
	System->ResolveDecision(FName("test_decision"), FName("approve")); // efeito atrasado agendado para dia +10

	// Avança 9 dias — o efeito (agendado para o dia 10) ainda não deve ter disparado.
	for (int32 Day = 0; Day < 9; ++Day)
	{
		System->AdvanceDay();
	}
	TestEqual(TEXT("IndicatorB permanece 0 até o dia anterior ao prazo"), System->GetIndicatorValue(FName("IndicatorB")), 0);

	// Dia 10: o efeito deve se manifestar exatamente agora.
	System->AdvanceDay();
	TestEqual(TEXT("IndicatorB reflete o efeito atrasado no dia do prazo"), System->GetIndicatorValue(FName("IndicatorB")), -4);

	// Dias seguintes não devem reaplicar o mesmo efeito (senão o indicador continuaria caindo).
	System->AdvanceDay();
	System->AdvanceDay();
	TestEqual(TEXT("IndicatorB não muda novamente em dias posteriores — efeito não reaplicado"),
		System->GetIndicatorValue(FName("IndicatorB")), -4);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDecisionSystemInvalidInputTest,
	"Dictocracy.DecisionSystem.ResolveDecision_ReturnsFalseForUnknownIds",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter)

bool FDecisionSystemInvalidInputTest::RunTest(const FString& Parameters)
{
	UDecisionSystemSubsystem* System = NewObject<UDecisionSystemSubsystem>();
	UDataTable* Table = DictocracyTests::BuildTestDecisionTable(System);
	System->SetDecisionTable(Table);

	TestFalse(TEXT("DecisionId inexistente retorna false, não crasha"),
		System->ResolveDecision(FName("does_not_exist"), FName("approve")));

	TestFalse(TEXT("OptionId inexistente para uma decisão válida retorna false"),
		System->ResolveDecision(FName("test_decision"), FName("does_not_exist")));

	return true;
}

#endif // WITH_DEV_AUTOMATION_TESTS
