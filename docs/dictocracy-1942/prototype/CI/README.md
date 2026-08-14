# CI/Build Pipeline — Sprint 1

Compromisso do plano de produção (`../../07-producao-e-riscos.md`, Sprint 1: "setup de projeto UE5, estrutura de módulos, pipeline de build/CI"). Assim como o restante da Fase 2, isto **não roda neste ambiente** (sem UE5 instalado, sem runner com licença/instalação da Engine) — é a definição do pipeline pronta para ativar assim que o projeto UE5 real existir em um repositório com um runner adequado.

## Por que não dá para usar runners hospedados do GitHub direto
Compilar um projeto UE5 exige a Engine instalada (dezenas de GB) e, dependendo da distribuição (Epic Games Launcher vs. source do GitHub via conta vinculada), uma licença/autenticação. Runners hospedados genéricos do GitHub Actions não têm isso pré-instalado e não é prático instalar a cada execução. **Este pipeline assume um runner self-hosted** com UE5 5.4+ já instalado (imagem de CI dedicada, física ou em nuvem com GPU), registrado com a label `unreal-5.4`.

## O que o pipeline faz
1. **Checkout** do repositório.
2. **Build**: chama o `RunUAT` (Unreal Automation Tool) para compilar o alvo `Development Editor` — é o mesmo modo usado no Passo 2 do `../00-setup-guia.md`, agora automatizado.
3. **Test**: roda `UnrealEditor-Cmd` em modo headless com o filtro `Dictocracy.*`, cobrindo todos os testes de Automation Framework descritos em `../Testing/guia-de-execucao-e-testes.md` (`DecisionSystemTests`, `CharacterMemoryTests`, `DialogueRuntimeTests`, `AgendaSchedulerTests`).
4. **Publish**: guarda o relatório de teste (`.xml`/`.json` gerado pelo Automation Framework) como artefato do workflow, para inspeção sem precisar rodar localmente.

## Gate de merge
Nenhum PR que toque em `Source/Dictocracy/**` deve ser mergeado com o job de teste vermelho — isso vale a partir do momento em que o projeto UE5 real existir; até lá, esta definição serve como especificação pronta para ativar.

## Arquivo do workflow
Ver `ci-unreal-prototype.yml.reference` nesta pasta. Ao criar o repositório real do projeto UE5, mover esse conteúdo para `.github/workflows/ci-unreal-prototype.yml` (removendo o sufixo `.reference`) e ajustar `UPROJECT_PATH` para o caminho real do `.uproject`.
