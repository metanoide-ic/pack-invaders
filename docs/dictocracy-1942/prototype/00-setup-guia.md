# Guia de Setup — Protótipo DICTOCRACY: 1942

## Pré-requisitos
- Unreal Engine **5.4 ou 5.5** (Epic Games Launcher ou build de source).
- Visual Studio 2022 (Windows, com workload "Game development with C++") ou Xcode/CLion conforme plataforma.
- Plugins do Editor a habilitar no projeto: `Enhanced Input`, `MetaHuman` (via Quixel Bridge/MetaHuman plugin), `Gameplay Ability System` **não** é necessário neste protótipo (adiado — ver corte de escopo abaixo), `Common UI` (recomendado para a UI de documento/agenda).

## Passo 1 — Criar o projeto
1. Criar novo projeto UE5 → template **Third Person** → C++ (não Blueprint-only, pois os módulos abaixo são C++).
2. Nome do projeto: `Dictocracy` (mantém paridade com os módulos abaixo).
3. Target: Desktop, Scalable 3D/2D, Ray Tracing habilitado (para Lumen).

## Passo 2 — Importar os módulos deste pacote
1. Copiar o conteúdo de `Source/Dictocracy/` deste pacote para `<SeuProjeto>/Source/Dictocracy/`, preservando a subpasta por módulo.
2. Abrir `<SeuProjeto>/Source/Dictocracy/Dictocracy.Build.cs` (gerado pelo template) e adicionar os módulos internos como dependência do módulo principal — ver `Source/Dictocracy/Dictocracy.Build.cs.reference` neste pacote para o bloco `PrivateDependencyModuleNames` esperado.
3. Cada submódulo (`DecisionSystem`, `CharacterMemory`, `DialogueRuntime`, `AgendaScheduler`, `SaveGameSystem`, `DictocracyCore`) precisa de seu próprio `.Build.cs` — modelos inclusos em cada subpasta.
4. Regenerar arquivos de projeto (botão direito no `.uproject` → "Generate Visual Studio project files", ou `GenerateProjectFiles.sh`/`.bat` do UE5).
5. Compilar em modo `Development Editor`. **Este é o primeiro ponto real de verificação** — os arquivos aqui foram escritos contra a API pública da UE5 5.4 (`Subsystem`, `UPrimaryDataAsset`, `USaveGame`, `UActorComponent`), mas erros de compilação são esperados até essa etapa e devem ser corrigidos por quem tiver o Editor à mão antes de seguir.

## Passo 3 — Importar dados
1. No Editor, criar `UDataTable` a partir de `FCharacterData` (struct definida em `DictocracyCore/DictocracyDataTypes.h`) e importar `Data/NPCs_Prototype.csv`.
2. Repetir para `FLeaderData` com `Data/Leader_Prototype.csv`.
3. `FDecisionData` e `FDialogueNode` têm arrays aninhados de structs (opções, efeitos atrasados, respostas) — inviáveis em CSV plano. Criar os `UDataTable` a partir dessas structs e importar `Data/Decisions_Prototype.json` e `Data/DialogueNodes_Prototype.json` usando a opção de import JSON do Editor (Content Browser → Import → selecionar o `.json` → escolher a struct de linha correspondente).
4. Conferir após import: nenhuma linha deve ficar com campos em branco por erro de parsing — o importador da UE5 avisa por linha quando um campo não casa com a struct; revisar o log de import antes de seguir.

## Passo 4 — Montar o nível e os Blueprints
Seguir `Blueprints/especificacao-blueprints.md` — cada Blueprint necessário está descrito nó a nó (não é possível fornecer `.uasset` binário fora do Editor).

## Passo 5 — Testar
Seguir `Testing/guia-de-execucao-e-testes.md`.

## Explicitamente fora deste protótipo
- Mapa mundial real (frentes, produção) — só o painel simplificado descrito nos Blueprints.
- `CountryAI`, `InfoFidelity` (informação imperfeita) — adiados para o vertical slice (Fase 3).
- MetaHuman customizado por personagem histórico — o protótipo usa MetaHumans de amostra/placeholder do próprio plugin, sem esculpição facial de nenhuma figura histórica (essa produção começa na Fase 3, após revisão jurídica).
- Localização, acessibilidade completa — só os hooks de arquitetura (`LocalizationCore` fica para Fase 3+), não a implementação.
- Qualquer áudio/VO final — usar placeholder gravado internamente ou texto-para-fala temporário, nunca voz de ator profissional sem contrato assinado.
