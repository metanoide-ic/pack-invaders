import { Game } from './Game';
import { PLAYER_COLORS, PLAYER_HATS, HatKind } from './entities/Player';
import { getBestDistanceMeters } from './core/HighScore';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);
// exposed for debugging / smoke tests only
(window as unknown as { __linhaZero: Game }).__linhaZero = game;

const startScreen = document.getElementById('start')!;
const gameOverScreen = document.getElementById('gameover')!;
const btnStart = document.getElementById('btn-start')!;
const btnRestart = document.getElementById('btn-restart')!;
const btnResume = document.getElementById('btn-resume')!;
const btnMute = document.getElementById('btn-mute')!;
const btnRestartPause = document.getElementById('btn-restart-pause')!;

const bestDistance = getBestDistanceMeters();
if (bestDistance > 0) {
  document.getElementById('start-record')!.classList.remove('hidden');
  document.getElementById('start-record-value')!.textContent = `${bestDistance} m`;
}

// --- Player 1 customization (color + hat), picked before the run starts ---
const HAT_GLYPH: Record<HatKind, string> = { cone: '▲', box: '■', dome: '●', ring: '◯' };
let chosenColor = PLAYER_COLORS[0];
let chosenHat: HatKind = PLAYER_HATS[0];

function buildSwatches(containerId: string, options: { value: string; label: string; bg?: string }[], onPick: (value: string) => void) {
  const container = document.getElementById(containerId)!;
  container.innerHTML = '';
  const buttons: HTMLButtonElement[] = [];
  options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'swatch' + (i === 0 ? ' selected' : '');
    btn.textContent = opt.label;
    if (opt.bg) btn.style.background = opt.bg;
    btn.title = opt.value;
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      onPick(opt.value);
    });
    container.appendChild(btn);
    buttons.push(btn);
  });
}

buildSwatches(
  'custom-colors',
  PLAYER_COLORS.map((c) => ({ value: String(c), label: '', bg: `#${c.toString(16).padStart(6, '0')}` })),
  (v) => (chosenColor = Number(v))
);
buildSwatches(
  'custom-hats',
  PLAYER_HATS.map((h) => ({ value: h, label: HAT_GLYPH[h] })),
  (v) => (chosenHat = v as HatKind)
);

btnStart.addEventListener('click', () => {
  game.setPlayerOneCustomization({ color: chosenColor, hat: chosenHat });
  startScreen.classList.add('hidden');
  game.start();
});

btnRestart.addEventListener('click', () => {
  window.location.reload();
});
btnRestartPause.addEventListener('click', () => {
  window.location.reload();
});

btnResume.addEventListener('click', () => {
  game.togglePause();
});

btnMute.addEventListener('click', () => {
  const muted = game.toggleMute();
  btnMute.textContent = muted ? '🔇 Som mudo' : '🔊 Som ligado';
});
