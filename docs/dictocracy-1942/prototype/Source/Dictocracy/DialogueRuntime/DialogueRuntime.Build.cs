// STATUS: escrito, não compilado neste ambiente (sem UE5 instalado). Revisar/compilar antes de integrar.
using UnrealBuildTool;

public class DialogueRuntime : ModuleRules
{
	public DialogueRuntime(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"DictocracyCore",
			"DecisionSystem",
			"CharacterMemory"
		});
	}
}
