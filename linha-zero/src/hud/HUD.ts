import { Train } from '../world/Train';
import { Player } from '../entities/Player';
import { RunStats } from '../types';

export class HUD {
  private hud = document.getElementById('hud')!;
  private distanceEl = document.getElementById('stat-distance')!;
  private speedEl = document.getElementById('stat-speed')!;
  private resourcesEl = document.getElementById('stat-resources')!;
  private passengersEl = document.getElementById('stat-passengers')!;
  private wagonsStrip = document.getElementById('wagons-strip')!;
  private banner = document.getElementById('event-banner')!;
  private playersPanel = document.getElementById('players-panel')!;
  private actionHint = document.getElementById('action-hint')!;
  private bannerTimer = 0;
  private hintTimer = 0;

  show() { this.hud.classList.remove('hidden'); }
  hide() { this.hud.classList.add('hidden'); }

  banner_show(text: string, duration = 3) {
    this.banner.textContent = text;
    this.banner.classList.add('show');
    this.bannerTimer = duration;
  }

  hint(text: string) {
    this.actionHint.textContent = text;
    this.actionHint.classList.add('show');
    this.hintTimer = 0.2;
  }

  update(dt: number, stats: RunStats, train: Train, players: Player[]) {
    this.distanceEl.textContent = `${Math.floor(stats.distance / 10)} m`;
    this.speedEl.textContent = `${Math.round(train.speed * 3.2)} km/h`;
    this.resourcesEl.textContent = `${stats.resources}`;
    this.passengersEl.textContent = `${stats.passengersSaved}`;

    this.wagonsStrip.innerHTML = '';
    for (const w of train.wagons) {
      const chip = document.createElement('div');
      chip.className = 'wagon-chip' + (w.fire > 0 ? ' burning' : '') + (w.destroyed ? ' gone' : '');
      chip.textContent = w.kind === 'engine' ? '🚂' : w.raider ? '⚠️' : '';
      const bar = document.createElement('div');
      bar.className = 'hp-bar';
      const fill = document.createElement('div');
      fill.style.width = `${Math.max(0, (w.hp / w.maxHp) * 100)}%`;
      fill.style.background = w.hp < 35 ? '#ff3d3d' : w.hp < 70 ? '#ffb347' : '#4ade80';
      bar.appendChild(fill);
      chip.appendChild(bar);
      this.wagonsStrip.appendChild(chip);
    }

    this.playersPanel.innerHTML = '';
    for (const p of players) {
      const card = document.createElement('div');
      card.className = 'player-card' + (!p.alive ? ' dead' : '');
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.background = `#${p.color.toString(16).padStart(6, '0')}`;
      card.appendChild(dot);
      const label = document.createElement('span');
      label.textContent = `${p.name}${p.onTrain ? '' : ' • fora do trem!'}`;
      card.appendChild(label);
      if (p.carry) {
        const carry = document.createElement('span');
        carry.className = 'carry';
        carry.textContent = p.carry === 'resource' ? ` +${p.carryValue}` : ' 🧍 carregando';
        card.appendChild(carry);
      }
      this.playersPanel.appendChild(card);
    }

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner.classList.remove('show');
    }
    if (this.hintTimer > 0) {
      this.hintTimer -= dt;
      if (this.hintTimer <= 0) this.actionHint.classList.remove('show');
    }
  }
}
