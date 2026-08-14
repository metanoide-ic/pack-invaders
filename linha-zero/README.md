# Linha Zero

Cooperativo 3D para 1–4 jogadores, dentro de um trem que nunca pode parar.
**Alvo de plataforma: PC (Steam)** — jogo desktop, não mobile.

Construído com **Three.js + TypeScript + Vite**, empacotado como app desktop
via **Electron**. É um endless-runner 3D em terceira pessoa onde a tripulação
corre pelo teto dos vagões, salta para plataformas de cidades para saquear
recursos, resgata sobreviventes e animais à beira da linha, apaga incêndios,
repele saqueadores e decide, sob pressão, quais vagões abandonar para manter
o resto da composição viva.

## Rodando localmente

```bash
cd linha-zero
npm install
npm run dev       # abre em http://localhost:3100
```

Outros comandos:

```bash
npm run build      # build de produção em dist/
npm run check       # checagem de tipos (tsc --noEmit)
npm run preview     # serve o build de produção
```

## Build desktop (Windows/Mac/Linux) e caminho até a Steam

```bash
npm run build       # gera dist/ primeiro — o Electron carrega esse build, não o dev server
npm run start        # abre o jogo numa janela Electron (não no navegador)
npm run package       # empacota um app desktop nativo em out/ (usa a plataforma atual)
npm run make           # como package, mas também gera um .zip distribuível
```

`electron/main.cjs` abre uma janela própria (sem chrome de navegador), com
`F11` para tela cheia — o padrão que se espera de um jogo, não de uma página
web. O `forge.config.cjs` empacota só `dist/` + `electron/`: o build do Vite
já embute o Three.js inteiro num único arquivo, então `node_modules` e o
código-fonte não precisam ir para o pacote final (testado: sem essa exclusão,
o pacote saía com o `node_modules` de desenvolvimento inteiro dentro).

**Ícone**: `assets/icons/` tem o ícone do jogo (`icon-source.html` é a fonte
editável, renderizada e convertida para `icon.ico`/`icon.icns`/`icon-1024.png`).
O `.ico` é embutido no `.exe` do Windows automaticamente pelo `electron-packager`
na hora de empacotar (verificado inspecionando os recursos do `.exe` gerado —
os bytes do ícone embutido batem exatamente com `icon.ico`, não é o ícone
padrão do Electron); o `.icns` faz o mesmo no macOS; no Linux, o ícone é
definido em tempo de execução pelo próprio `main.cjs`. Para trocar o ícone,
edite `icon-source.html` e regenere com `png2icons` (já é devDependency).

**O que falta para publicar de verdade na Steam** (depende de acesso a uma
conta Steamworks que esta sessão não tem):
- Uma conta de parceiro Steamworks e um App ID.
- Subir o conteúdo de `npm run package` (a pasta `out/<plataforma>/`) como
  depot via SteamPipe (`steamcmd` + um script `app_build.vdf`/`depot_build.vdf`).
- Opcionalmente, integrar o SDK do Steamworks (conquistas, save na nuvem,
  overlay) via um binding nativo como `steamworks.js` — não incluído aqui.
- Página da loja, classificação etária, arte de capa/capsule — fora do
  escopo de código.

## Como jogar

O trem nunca para. A distância percorrida e a velocidade aumentam com o tempo —
e junto delas, o perigo.

**Jogador 1 (teclado)**
- `WASD` — mover (lateral no teto do vagão / correr fora do trem)
- `Espaço` — pular: salta da borda do vagão para uma plataforma de cidade/resgate,
  ou salta de volta para o trem quando está perto o bastante dele
- `E` — interagir: apagar incêndio, repelir saqueador, reparar vagão danificado,
  ou pegar um recurso/passageiro quando estiver fora do trem
- `Q` — desacoplar o último vagão (só funciona se você estiver nele)

**Jogadores 2–4 (controles/gamepad)** — até 3 amigos podem entrar plugando um
controle a qualquer momento durante a partida:
- Analógico esquerdo — mover
- `A` — pular / saltar de volta
- `X` — interagir
- `Y` — desacoplar

**Celular/tablet**: um joystick e botões na tela aparecem automaticamente em
dispositivos de toque (controlando o Jogador 1), incluindo um botão de pausa
próprio já que não há tecla `Esc`.

**Personalização**: na tela inicial, o Jogador 1 escolhe a cor e o chapéu do
seu personagem antes de embarcar.

**Radar**: o pequeno mapa no canto inferior direito mostra o trecho de trilho
à frente — cidades (amarelo), resgates (verde) e zonas de perigo (vermelho) —
e onde cada jogador está.

**Pausa**: `Esc` a qualquer momento pausa a partida, com opção de mutar o som
ou reiniciar. O jogo lembra sua maior distância percorrida entre sessões
(salvo localmente no navegador) e comemora quando você bate o recorde.

**Primeira vez**: na primeira partida, uma sequência curta de dicas aparece
nos primeiros 25 segundos explicando os controles — só uma vez, nunca mais
depois disso.

**Biomas**: o cenário alterna entre pradaria, deserto e neve conforme a
distância percorrida, cada um com vegetação, cores de terreno e céu próprios.

**Som ambiente**: o trem "chugga" continuamente no ritmo da velocidade atual,
e um vento contínuo entra durante tempestades — além dos efeitos pontuais de
ação. A tela de fim de jogo agora também mostra velocidade máxima, incêndios
apagados, saqueadores repelidos, tempestades enfrentadas e vagões perdidos.

## O laço de jogo

1. **Cidades** aparecem ao lado da linha. Salte do teto do vagão para a
   plataforma, corra (você é mais rápido que o trem em velocidade base, mas
   ele acelera com o tempo!) até as caixas de recurso, pegue-as e salte de
   volta antes que o trem passe.
2. **Resgates** funcionam do mesmo jeito, mas o prêmio é um passageiro (com
   roupa de uma cor aleatória) ou um animal (cachorro, gato ou uma criatura
   maior tipo vaca) — trazê-lo a bordo cura um pouco o vagão em que ele
   embarca.
3. **Incêndios** podem começar em qualquer vagão de carga. Sem ninguém para
   apagar (`E`), o fogo cresce e destrói o vagão — e tudo que estiver
   acoplado atrás dele, numa reação em cadeia.
4. **Saqueadores** se agarram ao último vagão e o corroem aos poucos; lute
   (`E`) ou corte o vagão para se livrar da ameaça.
5. **Tempestades** aparecem periodicamente: reduzem a visibilidade, freiam um
   pouco o trem e empurram lateralmente quem estiver fora dele — cidades e
   resgates ficam mais arriscados até ela passar.
6. **Recursos coletados** acoplam automaticamente novos vagões à composição
   conforme acumulam — construção modular: o tipo do vagão acoplado reflete
   o que a tripulação andou trazendo (mais carga → vagões de carga/plataforma,
   mais resgates → vagões de passageiros), então a estratégia de coleta
   molda o formato do trem. A família cresce, mas cada vagão extra é mais um
   ponto que pode pegar fogo.
7. Se a locomotiva for destruída, a linha para. Fim de jogo.

## Direção de arte

- **Estilizado, sem realismo**: paleta saturada tipo brinquedo, materiais
  `MeshToonMaterial` com um degradê de 4 tons (cel-shading), céu e cenário
  claros e legíveis — não um render fotorrealista.
- **Câmera em terceira pessoa, afastada**: visão ampla atrás e acima do
  trem, dando espaço para ver ameaças chegando e vagões se soltando.
- **Personagens pequenos, expressivos e customizáveis**: proporção chibi
  (cabeça grande, corpo pequeno), rosto simples (olhos + sorriso) e um
  chapéu de silhueta distinta por jogador (cone, caixa, cúpula, argola),
  além da cor própria de cada um.
- **Física divertida, mas controlável**: pulo com arco de gravidade real,
  squash & stretch de desenho animado ao saltar/aterrissar — mas sem
  ragdoll incontrolável durante o jogo normal.
- **Animações exageradas para quedas e acidentes**: perder o trem dispara
  um tombo cômico (giro rápido + achatamento + fade); um vagão desacoplado
  ou destruído se solta e cai girando atrás do trem antes de sumir; ser
  ejetado por um desacoplamento repentino dá um salto de susto.
- **Construção modular**: cada tipo de vagão tem um "módulo" visualmente
  distinto (caixotes empilhados, janelas, tanque cilíndrico, cargas presas
  a cintas) e se encaixa com engates visíveis entre os vagões — mais um
  novo vagão entra com uma animação de "clique" saltitante.

## Estrutura do código

```
src/
  types.ts             tipos compartilhados (vagões, zonas, inputs, stats)
  input/InputManager.ts teclado (P1) + até 4 gamepads
  world/Train.ts        vagões, malha 3D, desgaste/reparo visual
  world/Track.ts        trilho infinito, cidades/resgates/perigos procedurais
  world/TrainExt.ts      desacoplamento em cadeia
  entities/Player.ts     personagem, movimento em/fora do trem
  hud/HUD.ts             HUD (DOM) — status, vagões, avisos, jogadores
  Game.ts                laço principal: física simplificada, regras, câmera
  main.ts                bootstrap + telas de menu/game over
```

## Limitações conhecidas / próximos passos

Este é um protótipo jogável single-machine (co-op local por teclado +
gamepads), não multiplayer em rede — jogar com amigos remotos exigiria um
servidor de sincronização de estado, fora do escopo deste primeiro corte.
Próximos passos naturais: modelos 3D no lugar dos primitivos, sons, mais
tipos de ameaça, e um mapa/minimapa mostrando cidades e perigos se
aproximando.
