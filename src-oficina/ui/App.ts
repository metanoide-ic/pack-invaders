import { GameState } from '../core/GameState';
import type { ItemDef, StageType, ChoiceOption } from '../core/types';
import { SHAPES } from '../render/shapes';
import { NPCS, describeStat } from '../data/community';
import { el, statBar } from './dom';
import { runClean } from '../minigames/clean';
import { runDisassemble } from '../minigames/disassemble';
import { runWeld } from '../minigames/weld';
import { runPaint } from '../minigames/paint';
import { runTest } from '../minigames/test';
import { CANVAS_W, CANVAS_H } from '../minigames/common';

const STAGE_META: Record<StageType, { title: string; icon: string; instructions: string }> = {
  clean: { title: 'Limpar', icon: '🧽', instructions: 'Arraste o mouse (ou o dedo) para tirar a sujeira acumulada.' },
  disassemble: { title: 'Desmontar', icon: '🔧', instructions: 'Clique nas peças destacadas para soltá-las com cuidado.' },
  weld: { title: 'Soldar', icon: '⚡', instructions: 'Clique (ou espaço) quando o marcador estiver sobre a zona verde.' },
  paint: { title: 'Pintar', icon: '🎨', instructions: 'Arraste o pincel até cobrir toda a peça.' },
  test: { title: 'Testar', icon: '🔌', instructions: 'Arraste a alavanca até o fim para ligar o objeto.' },
};

export class App {
  root: HTMLElement;
  state: GameState;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = GameState.loadOrNew();
    this.showTitle();
  }

  private mount(...children: (Node | string)[]) {
    this.root.innerHTML = '';
    for (const c of children) this.root.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }

  // ---------- TITLE ----------
  showTitle() {
    const hasSave = this.state.dayIndex > 0 || this.state.finished;
    this.mount(
      el('div', { class: 'screen title-screen' }, [
        el('div', { class: 'title-card' }, [
          el('h1', {}, ['Oficina do Fim do Mundo']),
          el('p', { class: 'subtitle' }, [
            'Um simulador relaxante de restauração de objetos, num mundo depois de tudo acabar.',
          ]),
          el('p', { class: 'pitch' }, [
            'Limpe, desmonte, solde, pinte e teste peças recuperadas dos escombros. Cada objeto guarda a história de quem o perdeu — e cada escolha que você faz muda a pequena comunidade ao redor da sua bancada.',
          ]),
          el('div', { class: 'title-buttons' }, [
            el('button', { class: 'btn primary', onClick: () => this.startDay() }, [
              hasSave && !this.state.finished ? 'Continuar' : 'Nova oficina',
            ]),
            hasSave
              ? el(
                  'button',
                  {
                    class: 'btn ghost',
                    onClick: () => {
                      this.state.reset();
                      this.startDay();
                    },
                  },
                  ['Recomeçar do zero']
                )
              : null,
          ]),
          el('p', { class: 'hint' }, ['Progresso salvo automaticamente neste navegador.']),
        ]),
      ])
    );
  }

  startDay() {
    if (this.state.finished) {
      this.showEnding();
      return;
    }
    this.showDayIntro();
  }

  // ---------- DAY INTRO ----------
  showDayIntro() {
    const item = this.state.currentItem;
    if (!item) return this.showEnding();
    this.mount(
      el('div', { class: 'screen intro-screen' }, [
        el('div', { class: 'day-badge' }, [`Dia ${this.state.dayIndex + 1} de ${this.state.totalDays}`]),
        el('div', { class: 'intro-card' }, [
          el('div', { class: 'item-preview' }, [this.renderStaticPreview(item)]),
          el('h2', {}, [item.name]),
          el('p', { class: 'owner' }, [`Trazido por: ${item.ownerName}`]),
          el('p', { class: 'dialogue' }, [item.intro]),
          el('button', { class: 'btn primary', onClick: () => this.runRepair(item, 0) }, [
            'Começar o conserto',
          ]),
        ]),
      ])
    );
  }

  private renderStaticPreview(item: ItemDef): HTMLElement {
    const canvas = el('canvas', { width: 260, height: 170, class: 'preview-canvas' });
    const ctx = canvas.getContext('2d')!;
    const shape = SHAPES[item.shape];
    ctx.save();
    ctx.translate(0, -50);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#3a2f28';
    shape.drawSilhouette(ctx, 130, 135, '#3a2f28');
    ctx.restore();
    return canvas;
  }

  // ---------- REPAIR LOOP ----------
  runRepair(item: ItemDef, stageIdx: number) {
    if (stageIdx >= item.stages.length) {
      this.showStoryReveal(item);
      return;
    }
    const stage = item.stages[stageIdx];
    const meta = STAGE_META[stage];
    const shape = SHAPES[item.shape];

    const canvas = el('canvas', {
      width: CANVAS_W,
      height: CANVAS_H,
      class: 'work-canvas',
    }) as HTMLCanvasElement;
    const progressFill = el('div', { class: 'progress-fill' });
    const stepDots = item.stages
      .map((s, i) =>
        el('div', {
          class: `step-dot ${i < stageIdx ? 'done' : i === stageIdx ? 'active' : ''}`,
        })
      );

    this.mount(
      el('div', { class: 'screen repair-screen' }, [
        el('div', { class: 'repair-header' }, [
          el('h2', {}, [`${meta.icon} ${meta.title} — ${item.name}`]),
          el('div', { class: 'step-dots' }, stepDots),
        ]),
        el('p', { class: 'instructions' }, [meta.instructions]),
        el('div', { class: 'canvas-wrap' }, [canvas]),
        el('div', { class: 'progress-track' }, [progressFill]),
      ])
    );

    const onProgress = (pct: number) => {
      progressFill.style.width = `${Math.round(pct * 100)}%`;
    };
    const onComplete = () => {
      cleanup();
      this.runRepair(item, stageIdx + 1);
    };

    let cleanup = () => {};
    if (stage === 'clean') cleanup = runClean(canvas, shape, item.baseColor, onProgress, onComplete);
    else if (stage === 'disassemble')
      cleanup = runDisassemble(canvas, shape, item.baseColor, onProgress, onComplete);
    else if (stage === 'weld') cleanup = runWeld(canvas, shape, item.baseColor, onProgress, onComplete);
    else if (stage === 'paint') cleanup = runPaint(canvas, shape, item.paintColor, onProgress, onComplete);
    else if (stage === 'test') cleanup = runTest(canvas, shape, item.paintColor, onProgress, onComplete);
  }

  // ---------- STORY REVEAL ----------
  showStoryReveal(item: ItemDef) {
    this.mount(
      el('div', { class: 'screen story-screen' }, [
        el('div', { class: 'story-card' }, [
          el('h2', {}, [`${item.name}, restaurado`]),
          el(
            'div',
            { class: 'story-lines' },
            item.storyLines.map((line) => el('p', { class: 'story-line' }, [line]))
          ),
          el('button', { class: 'btn primary', onClick: () => this.showChoice(item) }, ['Continuar']),
        ]),
      ])
    );
  }

  // ---------- CHOICE ----------
  showChoice(item: ItemDef) {
    const optionCard = (opt: ChoiceOption) =>
      el('button', { class: 'choice-card', onClick: () => this.applyChoice(item, opt) }, [
        el('h3', {}, [opt.label]),
        el('p', {}, [opt.description]),
      ]);

    this.mount(
      el('div', { class: 'screen choice-screen' }, [
        el('div', { class: 'choice-card-wrap' }, [
          el('h2', {}, ['Uma decisão']),
          el('p', { class: 'choice-prompt' }, [item.choice.prompt]),
          el('div', { class: 'choice-options' }, [
            optionCard(item.choice.options[0]),
            optionCard(item.choice.options[1]),
          ]),
        ]),
      ])
    );
  }

  applyChoice(item: ItemDef, opt: ChoiceOption) {
    this.state.choicesMade[item.id] = opt.id;
    for (const [k, v] of Object.entries(opt.effects)) {
      (this.state.stats as any)[k] += v;
    }
    if (opt.npcEffects) {
      for (const [npc, v] of Object.entries(opt.npcEffects)) {
        this.state.relationships[npc] = (this.state.relationships[npc] ?? 50) + v;
      }
    }
    this.state.clampStats();

    this.mount(
      el('div', { class: 'screen result-screen' }, [
        el('div', { class: 'story-card' }, [
          el('h2', {}, ['Consequências']),
          el('p', { class: 'story-line' }, [opt.resultText]),
          el('button', { class: 'btn primary', onClick: () => this.showTown() }, ['Ver a comunidade']),
        ]),
      ])
    );
  }

  // ---------- TOWN / DAY RESULT ----------
  showTown() {
    const s = this.state.stats;
    this.mount(
      el('div', { class: 'screen town-screen' }, [
        el('div', { class: 'town-card' }, [
          el('h2', {}, ['O vilarejo, hoje']),
          el('div', { class: 'stats-block' }, [
            statBar('Confiança', s.confianca, '#7fb069'),
            el('p', { class: 'stat-desc' }, [describeStat('confianca', s.confianca)]),
            statBar('Esperança', s.esperanca, '#e0a458'),
            el('p', { class: 'stat-desc' }, [describeStat('esperanca', s.esperanca)]),
            statBar('Memória', s.memoria, '#7d9dc9'),
            el('p', { class: 'stat-desc' }, [describeStat('memoria', s.memoria)]),
          ]),
          el(
            'div',
            { class: 'npc-list' },
            NPCS.map((n) =>
              el('div', { class: 'npc-row' }, [
                el('div', { class: 'npc-name' }, [`${n.name} `, el('span', { class: 'npc-role' }, [n.role])]),
                statBar('', this.state.relationships[n.id] ?? 50, '#c97b3d'),
              ])
            )
          ),
          el(
            'button',
            {
              class: 'btn primary',
              onClick: () => {
                this.state.advanceDay();
                if (this.state.finished) this.showEnding();
                else this.showDayIntro();
              },
            },
            [this.state.dayIndex + 1 >= this.state.totalDays ? 'Encerrar a temporada' : 'Próximo dia']
          ),
        ]),
      ])
    );
  }

  // ---------- ENDING ----------
  showEnding() {
    const s = this.state.stats;
    this.mount(
      el('div', { class: 'screen ending-screen' }, [
        el('div', { class: 'story-card' }, [
          el('h2', {}, ['Fim da demonstração']),
          el('p', {}, [
            'Você restaurou cinco objetos e, com eles, moldou um pouco do futuro deste vilarejo. Esta é só a primeira temporada da Oficina do Fim do Mundo — mais objetos, personagens e histórias estão a caminho.',
          ]),
          el('div', { class: 'stats-block' }, [
            statBar('Confiança final', s.confianca, '#7fb069'),
            statBar('Esperança final', s.esperanca, '#e0a458'),
            statBar('Memória final', s.memoria, '#7d9dc9'),
          ]),
          el(
            'button',
            {
              class: 'btn primary',
              onClick: () => {
                this.state.reset();
                this.showTitle();
              },
            },
            ['Jogar novamente']
          ),
        ]),
      ])
    );
  }
}
