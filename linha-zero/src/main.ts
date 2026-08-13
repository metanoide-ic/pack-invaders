import { Game } from './Game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);
// exposed for debugging / smoke tests only
(window as unknown as { __linhaZero: Game }).__linhaZero = game;

const startScreen = document.getElementById('start')!;
const gameOverScreen = document.getElementById('gameover')!;
const btnStart = document.getElementById('btn-start')!;
const btnRestart = document.getElementById('btn-restart')!;

btnStart.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  game.start();
});

btnRestart.addEventListener('click', () => {
  window.location.reload();
});
