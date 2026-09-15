# Diarrhena

Protótipo de parkour/PvE em primeira pessoa, Godot 4.3+. Tem a movimentação
completa (parkour + wall-run + deslize), um **sistema de loadout** (3 slots
de arma no mouse + 2 slots de suporte em R/C, cada um trocável por uma
habilidade de um pool maior — pensado pra virar desbloqueio por missão mais
pra frente), inimigos com IA básica e um objetivo de nível, tudo numa arena
de teste gray-box — sem arte final, sem missões/história ainda. Ver seção
"O que falta" no fim, que é honesta sobre isso.

## Como abrir

O executável já está no workspace, não precisa instalar nada:
`_godot/Godot_v4.7.2-stable_win64.exe` (raiz do repo, um nível acima de
`diarrhena/`).

1. Abra esse `.exe`, "Importar" → aponte pra pasta `diarrhena/` (o
   `project.godot` está na raiz dela).
2. Rode a cena principal (F5). Ela já abre em `levels/parkour_test_arena.tscn`.

### Validação automática (sem abrir o editor)

```bash
"_godot/Godot_v4.7.2-stable_win64_console.exe" --headless --path diarrhena --script res://debug/smoke_test.gd
"_godot/Godot_v4.7.2-stable_win64_console.exe" --headless --path diarrhena --script res://debug/combat_test.gd
"_godot/Godot_v4.7.2-stable_win64_console.exe" --headless --path diarrhena --script res://debug/new_abilities_test.gd
```

Três ferramentas de dev (não fazem parte do jogo, não são referenciadas por
nenhuma cena):

- `debug/smoke_test.gd` — segura teclas via `Input.parse_input_event` de
  verdade (não só simula polling): anda, pula+diarreia, dispara os 3 slots
  de arma, meleca dos dois lados, melee, mira invertida, suor, choro.
- `debug/combat_test.gd` — teleporta o jogador pra cenários específicos e
  valida com `assert()`: combate/respawn de inimigo, wall-run, KillZone,
  objetivo de 5 abates.
- `debug/new_abilities_test.gd` — troca os slots do jogador em tempo real
  pra validar cada habilidade nova do pool (Hemorróida, Sebo, Pus, Bile,
  Adrenalina, Espinhas passiva, Unhas, Milho, Cera de ouvido).

Todos passam limpo hoje. Já pegaram bugs de verdade nessa reescrita
(`unique_name_in_owner` como string em vez de bool, spawn fora da borda do
chão, `lerp()` retornando Variant quebrando a checagem de tipos estrita, um
inimigo "morto" de um teste anterior vazando pro próximo porque só
resetar `.health` não desfaz a bandeira de morte) — rodar de novo depois de
qualquer mudança é barato (segundos) e evita abrir o editor toda hora.

## Controles

Sem "correr" separado — o jogador já anda na velocidade de corrida o
tempo todo.

| Tecla | Ação |
|---|---|
| WASD | Mover |
| Mouse | Olhar |
| **Espaço** (chão ou parede) | Pular / pulo na parede (durante wall-run) |
| **Espaço** (segurar, no ar) | **Diarreia** — spray contínuo tipo jetpack pra cima+frente, gasta energia, não dura pra sempre |
| **Shift** | Agachar |
| **Shift correndo** | Deslizar |
| **Scroll pra trás** | **Mijo** — rajada instantânea pra cima e pra trás |
| **Q** | **Meleca (narina esquerda)** — grappling hook, aperta nela de novo pra soltar |
| **E** | **Meleca (narina direita)** — idem |
| **V** | **Melee** — ataque corpo a corpo |
| **F** | **Mira invertida** ("cu pra frente") — inverte as habilidades que iam pra trás; usar o Mijo assim bate na sua própria cara e deixa a visão amarelada |
| **Clique esquerdo** | Slot de arma 1 (padrão: **Espinhas** — disparo rápido, segurar) |
| **Clique do meio** | Slot de arma 2 (padrão: **Cocô** — projétil com recuo; mirar pra trás e atirar "pra frente" = boost tipo a Matilda do Angry Birds) |
| **Clique direito** | Slot de arma 3 (padrão: **Vômito** — spray contínuo, segurar) |
| **R** | Slot de suporte (padrão: **Choro** — cura, segurar) |
| **C** | Slot de suporte (padrão: **Suor** — quanto mais segura, mais rápido e mais descontrolado fica) |
| Esc | Solta/prende o mouse |

Q e E podem ser usados **juntos** (uma meleca em cada narina) — com os dois
pontos grudados a "teia" puxa o jogador na direção dos dois pontos; dá pra
combinar com a Diarreia pra ser puxado na direção da corda até o limite dela.

## Sistema de loadout (trocar as armas)

Os 3 cliques do mouse e o R/C não são fixos — cada um é um **slot** que
guarda o id de uma habilidade, e trocar o id troca a habilidade sem mexer
em mais nada. Hoje isso é feito no Inspector do editor (selecionar o nó
`Player` na cena e mudar `weapon_slot_1`/`2`/`3`/`support_slot_r`/`c`) ou
por script/console — ainda **não existe uma tela de loadout no jogo**, é
o próximo passo óbvio de UI.

**Slots de arma** (padrão: Espinhas / Cocô / Vômito), pool completo:

| Id | O que faz |
|---|---|
| `espinhas` | disparo rápido, alcance longo, dano baixo |
| `coco` | projétil de ataque com recuo (ver mira invertida) |
| `vomito` | spray contínuo curto alcance, dano alto sustentado |
| `catarro` | projétil de área, alcance médio, dano médio |
| `arroto` | empurra o jogador (pra trás, ou pra frente com mira invertida) + atordoa quem tiver na frente |
| `peido` | dano bom + atordoa quem estiver **atrás** do jogador, com empurrão de brinde |
| `cuspe` | carregável (segurar/soltar) — quanto mais carrega, maior e mais longe |
| `cece` | nuvem de dano em área que segue o jogador por alguns segundos |
| `hemorroida` | carrega mirando um ponto, solta pra detonar uma explosão lá — quanto mais carrega, mais dano nos outros **e em você** (até 50% da vida MÁXIMA no talo) |
| `vomito_sangue` | spray de dano MASSIVO que tira vida REAL do jogador (não a energia) enquanto dura |
| `milho` | metralhadora que sai "pelo cu" — só funciona **parado**, os tiros **perfuram** os inimigos |
| `espinhas_passiva` | passiva: sempre que o jogador toma dano, todas as espinhas do corpo explodem em área ao redor |
| `cera_de_ouvido` | passiva: pinga poças no chão por onde anda; inimigo que pisar fica grudado (atordoado) |
| `unhas_compridas` | passiva: o Melee (V) dá muito mais dano, mas cada unhada gasta uma "carga" que regenera sozinha com o tempo |
| `caspa` | chacoalha a cabeça e derruba caspa no chão — vira uma mina, inimigo que encostar toma dano em área e ela some |
| `piolho` | passiva: morde sozinho todo inimigo perto, sem precisar apertar nada |

**Slots de suporte** (padrão: Choro / Suor), pool completo:

| Id | O que faz |
|---|---|
| `choro` | cura enquanto segura, gasta energia |
| `suor` | quanto mais segura, mais rápido — e mais perde o controle da direção |
| `sebo` | passiva: reduz o dano recebido |
| `bile` (Vômito de bile) | mais leve, pula mais alto/longe, mas **bloqueia qualquer habilidade de dano** enquanto ativa |
| `pus` | toma dano enquanto segura; ao soltar, o total vira "vida extra" (um escudo consumido antes da vida normal) |
| `adrenalina` | passiva: "the indomitable human spirit" — em vez de morrer, segura a vida em 1 e fica invencível+rápido por 10s (janela pra reverter o jogo antes de morrer de vez — hoje o protótipo não tem morte/game over real, então essa é a base mecânica já pronta pra quando existir) |
| `mosca` | passiva: escudo que absorve golpe por golpe — cada hit consome uma mosca em vez de vida, elas regeneram devagar sozinhas |
| `necrose` | passiva, só ferra: começa a contar assim que equipada e mata o jogador se o objetivo do nível não for cumprido antes do tempo acabar |

## Arquitetura

```
diarrhena/
  project.godot           # InputMap — ver controles acima
  common/
    game_events.gd         # Autoload "GameEvents" — barramento de sinais
                           # global (vida, energia, cooldowns, dano, tint
                           # de tela) pra HUD/alvos não precisarem de
                           # referência direta ao Player.
  entities/
    player/
      player.gd            # Controlador: locomoção + wall-run + loadout
                           # de slots + toda habilidade do pool, tudo em
                           # _physics_process
      player.tscn
      cece_cloud.gd        # Nuvem de AoE que segue o jogador
      projectiles/
        ability_projectile.gd   # Script genérico (a maioria dos
                                 # projéteis só muda dano/raio/gravidade/
                                 # perfuração via export vars na cena)
        earwax_puddle.gd         # Poça da Cera de ouvido — prende quem pisar
    dummy_target/
      dummy_target.gd      # Alvo de teste: recebe dano, pisca, "renasce"
    enemy/
      enemy.gd              # Inimigo com IA simples: persegue por distância,
                            # ataca corpo a corpo, mesma interface
                            # take_damage/apply_stun dos dummies
  levels/
    parkour_test_arena.tscn # Corredor de wall-run sobre um fosso, torre só
                            # alcançável de graple, 4 bonecos de teste de
                            # dano e 3 inimigos de verdade
    kill_zone.gd            # Caiu no vazio → volta pro spawn
    objective_manager.gd    # Objetivo: derrotar 5 inimigos (conta abates
                            # acumulados, os inimigos respawnam)
  debug/
    smoke_test.gd           # Ferramenta de dev — ver seção de validação
    combat_test.gd          # idem
    new_abilities_test.gd   # idem
  ui/
    hud.tscn / hud.gd      # Vida, energia, estado de movimento (debug),
                            # cooldowns, loadout atual, placar do
                            # objetivo, banner de vitória e o tint de
                            # tela do Mijo invertido — tudo via GameEvents
```

### Por que gray-box (caixas cinzas) e não modelos já

Validar o *feel* do parkour/combate com formas primitivas é mais rápido e
barato de iterar do que já sair modelando (é o mesmo prototype-first
workflow da skill `gamedev-prototype-fast`). A regra de "nada procedural,
só asset real" que vale pro Tupelo Town é sobre a **arte final visível no
jogo**, não sobre blocos de teste que vão ser descartados/reskinnados
assim que o feel estiver aprovado.

## Fontes de asset 100% liberadas pra vender na Steam

Ainda não baixei nada — isso pede permissão explícita (arquivo, tamanho,
fonte) antes de eu trazer qualquer coisa pro projeto. Candidatos prontos
pra quando você quiser seguir com a arte:

- **Kenney.nl** — kits modulares (blocos, props, UI, SFX), CC0.
- **Quaternius** — personagens/props CC0, já é a base do Tupelo Town.
- **KayKit** (Kay Lousberg, itch.io) — kits estilizados, CC0 na maioria.
- **Mixamo (Adobe)** — animações humanoides prontas, uso comercial livre
  (mas não redistribuir o FBX cru).
- **Poly Haven** — HDRIs/texturas/modelos, CC0.
- **Sonniss GDC bundles / Kenney audio** — SFX CC0.

Evite: asset dumps piratas, packs sem licença clara, Sketchfab sem marcação
CC0/CC-BY explícita.

## O que falta (e o que precisa de você pra continuar)

Isso já é um vertical slice de combate/parkour jogável — o que falta é
genuinamente ou trabalho de sentir/jogar, ou uma decisão de escopo grande:

1. **Feel pass**: abrir e jogar de verdade. Os números (dano, velocidade,
   alcance, custo de energia) são a primeira passada, não calibrados.
2. **História e missões**: você descreveu uma premissa (a namorada, o
   sequestro) e que as habilidades desbloqueiam ao longo do jogo — isso
   ainda **não existe**. É um sistema grande por si só (diálogo, missões,
   progressão de desbloqueio ligada ao loadout que já existe) e não entrou
   nessa passada pra não virar uma pilha de código não testado. Quando
   você quiser, esse é o próximo bloco de trabalho.
3. **UI de loadout**: hoje trocar arma é só via Inspector/script. Falta
   uma tela de verdade (pause menu → escolher o que vai em cada slot).
4. **Arte e som de verdade**: substituir os blocos cinza e adicionar SFX
   por habilidade — só falta você aprovar de onde puxar os assets (seção
   acima) que eu trago e integro.
5. **IA melhor**: hoje é só perseguição por distância em linha reta (sem
   NavMesh) — falta pra quando o nível tiver obstáculos de verdade.
