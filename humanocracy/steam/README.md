# HUMANOCRACY — Build Steam

O jogo roda 100% offline em HTML/JS puro, o que torna o caminho até a Steam curto:
o runtime desktop é **Electron** (já usado neste repositório pelo Pack Invaders).

## Rodar como app desktop (dev)

```bash
npm install          # na raiz do repositório (uma vez)
npm run humanocracy  # abre em tela cheia; F11 / Alt+Enter alternam
```

## Empacotar executáveis

Com o electron-forge já presente no repo:

```bash
npx electron-forge package --arch=x64 --platform=win32   # Windows
npx electron-forge package --arch=x64 --platform=linux   # Linux/Steam Deck
```

(Apontar o `main` do forge para `humanocracy/steam/main.js`, ou usar
electron-builder com `extraMetadata.main`.)

## Integração Steamworks (plano)

1. **SDK:** usar [`steamworks.js`](https://github.com/ceifa/steamworks.js) (bindings
   nativos para Node/Electron) — init com o AppID no `main.js`;
2. **Saves:** o jogo grava em `localStorage` (persistido pelo Electron em
   `userData`) — habilitar **Steam Cloud** apontando para essa pasta;
3. **Overlay:** `--in-process-gpu` na linha de comando do Electron;
4. **Deck:** o jogo já tem controles de toque. Gamepad mapeado em duas cenas:
   a casa (`house.js`, `houseLoop()` — stick esquerdo anda, stick direito olha,
   A interage, Start pausa) e agora também o turno principal no guichê
   (`game.js`, `pollShiftGamepad()` — A aprova, B rejeita, X detém (respeitando
   o `disabled` do botão, ou seja, só com evidência confirmada), Start pausa;
   bloqueado enquanto qualquer overlay/modal estiver aberto, para não disparar
   uma decisão por engano por trás de um comunicado ou bilhete). O gap restante
   é mais estreito agora: inspeção comparativa (selecionar dois elementos
   clicáveis dinâmicos — campos, foto, zonas de exame) ainda não tem navegação
   por controle — precisa de um cursor/foco explícito, decisão de UX própria,
   não coberta por este mapeamento de botões.

## Conquistas propostas

| ID | Nome | Condição |
|---|---|---|
| `ACH_DIA1` | Primeiro Carimbo | concluir o Dia 1 |
| `ACH_MEDALHA` | Servidor Exemplar | final "A Medalha" |
| `ACH_ROTA` | A Rota do Barbeiro | final da resistência |
| `ACH_SILENCIO` | A Cidade Silenciosa | final com 6+ Alternados admitidos |
| `ACH_ESPELHO` | Quem Sou Eu Depois de 48 Dias | qualquer final no Dia 48 |
| `ACH_SILENTE` | Não Olhe de Perto | sobreviver às DUAS visitas do Silente |
| `ACH_OLHOU` | Você Olhou | perder para o Silente (sim, uma conquista) |
| `ACH_FAMILIA` | Ninguém Ficou Para Trás | chegar ao Dia 48 com os 4 vivos |
| `ACH_LIMPO` | Mãos Limpas | 48 dias sem aceitar nenhum suborno |
| `ACH_QUENTE` | O Travesseiro | encontrar o travesseiro quente no quarto de hóspedes 2 |
| `ACH_CINCO` | A Conta Fecha | contar as silhuetas do retrato duas noites |
| `ACH_AMIGO` | O Amigo Nunca Erra | receber os 4 tipos de aviso do amigo do Dario |

Os contadores para todas já existem no estado do jogo (`S.counters`, `S.flags`).

## Produção completa

O port Unity (GDD Volume 9) continua sendo o alvo para a versão 1.0 da Steam;
este build Electron é o caminho de Early Access / demo (Steam Next Fest) com
o conteúdo integral do protótipo.
