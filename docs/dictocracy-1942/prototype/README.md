# Fase 2 — Protótipo: Documentação Técnica de Implementação

## Aviso honesto sobre este material

Este ambiente de execução **não tem o Unreal Engine 5 instalado** (sem Editor, sem UnrealBuildTool). Por isso, nada aqui foi compilado, aberto no Editor ou testado em runtime. Isto **não é** o "protótipo funcional" exigido pela Fase 2 do GDD — é o material de engenharia necessário para que uma pessoa (ou equipe) com UE5 5.4+ instalado monte esse protótipo em poucos dias em vez de partir do zero.

Cada arquivo de código traz um cabeçalho `// STATUS: escrito, não compilado neste ambiente.` — isso não é boilerplate, é rastreabilidade: nenhuma alegação de "funciona" é feita até compilar e testar de verdade contra o Editor.

## O que está aqui

| Pasta | Conteúdo |
|---|---|
| `00-setup-guia.md` | Passo a passo para criar o projeto UE5 e importar este código |
| `Source/Dictocracy/` | Módulos C++ do protótipo (subconjunto dos módulos da arquitetura completa, ver `../04-arquitetura-tecnica.md`) |
| `Data/` | Data Tables em CSV prontas para importar como `UDataTable` no Editor (NPCs, Decisão, Líder do protótipo) |
| `Narrative/roteiro-reuniao-prototipo.md` | Roteiro completo da cena de reunião com 3 NPCs exigida pelo GDD, pronto para gravação/dublagem placeholder e para alimentar as Data Tables de diálogo |
| `Blueprints/especificacao-blueprints.md` | Especificação nó-a-nó dos Blueprints necessários (não é possível gerar arquivos `.uasset` binários fora do Editor — a especificação substitui o arquivo) |
| `Testing/guia-de-execucao-e-testes.md` | Critérios de aceite por sistema e passo a passo de teste manual no Editor |

## Escopo deste protótipo (recorte de Sprint 2–5, ver `../07-producao-e-riscos.md`)

Cobre exatamente o pedido da Fase 2 no prompt original:
1. Um escritório 3D (ver especificação de nível em `Blueprints/especificacao-blueprints.md`, seção "Nível: BP_PrototypeOffice").
2. Um personagem controlável em terceira pessoa (template UE5 Third Person como base — ver setup).
3. Um assistente (NPC que apresenta a agenda).
4. Uma reunião com três NPCs (ver `Narrative/roteiro-reuniao-prototipo.md`).
5. Um documento assinável.
6. Um mapa estratégico simplificado.
7. Uma decisão com consequência atrasada (dado real em `Data/Decisions_Prototype.csv`, lógica em `SaveGameSystem`/`DecisionSystem`).
8. Um sistema de salvamento (`UDictocracySaveGame`).
9. Uma pequena alteração visual no ambiente condicionada a estado de jogo.

Sistemas de escopo maior da arquitetura completa (`CountryAI`, `InfoFidelity`, mapa mundial real, diplomacia) **não** entram neste recorte — ver corte explícito em `../07-producao-e-riscos.md`, seção 13, e a lista de "fora do protótipo" no fim de `00-setup-guia.md`.
