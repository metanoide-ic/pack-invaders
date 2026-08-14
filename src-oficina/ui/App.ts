import { GameState } from '../core/GameState';
import type { ItemDef, StageType, ChoiceOption } from '../core/types';
import { NPCS, describeStat } from '../data/community';
import { el, statBar } from './dom';
import { WorkshopScene } from '../render3d/WorkshopScene';
import { mountPreview } from '../render3d/preview';
import { TOOLS } from '../render3d/tools3d';
import { STAGE_TOOL } from '../render3d/types';
import { runClean3D } from '../render3d/stages/clean3d';
import { runDisassemble3D } from '../render3d/stages/disassemble3d';
import { runWeld3D } from '../render3d/stages/weld3d';
import { runPaint3D } from '../render3d/stages/paint3d';
import { runTest3D } from '../render3d/stages/test3d';

const STAGE_META: Record<StageType, { title: string; icon: string; instructions: string }> = {
  clean: { title: 'Limpar', icon: '🧽', instructions: 'Pegue a esponja na bancada e arraste sobre o objeto para tirar a sujeira.' },
  disassemble: { title: 'Desmontar', icon: '🔧', instructions: 'Pegue a chave de fenda e clique nas peças destacadas para soltá-las.' },
  weld: { title: 'Soldar', icon: '⚡', instructions: 'Pegue o maçarico e clique no ponto de solda no tempo certo.' },
  paint: { title: 'Pintar', icon: '🎨', instructions: 'Pegue o pincel e arraste sobre o objeto até cobrir toda a peça.' },
  test: { title: 'Testar', icon: '🔌', instructions: 'Pegue a mão e clique no interruptor para ligar o objeto.' },
};

export class App {
  root: HTMLElement;
  state: GameState;
  private previewDispose: (() => void) | null = null;
  private scene3d: WorkshopScene | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = GameState.loadOrNew();
    this.showTitle();
  }

  private mount(...children: (Node | string)[]) {
    this.root.innerHTML = '';
    for (const c of children) this.root.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }

  private teardownPreview() {
    this.previewDispose?.();
    this.previewDispose = null;
  }

  private teardownScene() {
    this.scene3d?.dispose();
    this.scene3d = null;
  }

  // ---------- TITLE ----------
  showTitle() {
    this.teardownPreview();
    this.teardownScene();
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
    this.teardownScene();
    const item = this.state.currentItem;
    if (!item) return this.showEnding();
    const previewHost = el('div', { class: 'item-preview-3d' });
    this.mount(
      el('div', { class: 'screen intro-screen' }, [
        el('div', { class: 'day-badge' }, [`Dia ${this.state.dayIndex + 1} de ${this.state.totalDays}`]),
        el('div', { class: 'intro-card' }, [
          previewHost,
          el('h2', {}, [item.name]),
          el('p', { class: 'owner' }, [`Trazido por: ${item.ownerName}`]),
          el('p', { class: 'dialogue' }, [item.intro]),
          el('button', { class: 'btn primary', onClick: () => this.runRepair(item, 0) }, [
            'Começar o conserto',
          ]),
        ]),
      ])
    );
    this.teardownPreview();
    this.previewDispose = mountPreview(previewHost, item);
  }

  // ---------- REPAIR LOOP (3D) ----------
  runRepair(item: ItemDef, stageIdx: number) {
    this.teardownPreview();
    if (stageIdx >= item.stages.length) {
      this.showStoryReveal(item);
      return;
    }
    const stage = item.stages[stageIdx];
    const meta = STAGE_META[stage];
    const tool = TOOLS[STAGE_TOOL[stage]];

    const sceneHost = el('div', { class: 'scene-3d-host' });
    const hud = el('div', { class: 'hud-overlay' });
    const toolLabel = el('div', { class: 'equipped-tool' }, ['Ferramenta: nenhuma']);
    const hint = el('div', { class: 'hint-toast' });
    const progressFill = el('div', { class: 'progress-fill' });
    const stepDots = item.stages.map((s, i) =>
      el('div', { class: `step-dot ${i < stageIdx ? 'done' : i === stageIdx ? 'active' : ''}` })
    );

    this.mount(
      el('div', { class: 'screen repair-screen' }, [
        el('div', { class: 'repair-header' }, [
          el('h2', {}, [`${meta.icon} ${meta.title} — ${item.name}`]),
          el('div', { class: 'step-dots' }, stepDots),
        ]),
        el('p', { class: 'instructions' }, [
          meta.instructions,
          ` (dica: ${tool.icon} ${tool.label})`,
        ]),
        el('div', { class: 'scene-wrap' }, [sceneHost, toolLabel, hint, hud]),
        el('div', { class: 'progress-track' }, [progressFill]),
      ])
    );

    const isNewItem = stageIdx === 0 || !this.scene3d;
    if (isNewItem) {
      this.teardownScene();
      this.scene3d = new WorkshopScene(sceneHost);
      this.scene3d.loadItem(item);
    } else {
      sceneHost.appendChild(this.scene3d!.canvas);
      this.scene3d!.container = sceneHost;
      this.scene3d!.resize();
    }
    const scene = this.scene3d!;
    scene.onEquip = (toolId) => {
      toolLabel.textContent = `Ferramenta: ${TOOLS[toolId].icon} ${TOOLS[toolId].label}`;
    };
    if (scene.equipped) toolLabel.textContent = `Ferramenta: ${TOOLS[scene.equipped].icon} ${TOOLS[scene.equipped].label}`;

    let hintTimeout = 0;
    const onHint = (msg: string) => {
      hint.textContent = msg;
      hint.classList.add('show');
      window.clearTimeout(hintTimeout);
      hintTimeout = window.setTimeout(() => hint.classList.remove('show'), 1800);
    };

    const onProgress = (pct: number) => {
      progressFill.style.width = `${Math.round(pct * 100)}%`;
    };
    const onComplete = () => {
      cleanup();
      this.runRepair(item, stageIdx + 1);
    };

    let cleanup = () => {};
    const instance = scene.current!;
    if (stage === 'clean') cleanup = runClean3D(scene, instance, item.baseColor, onProgress, onComplete, onHint);
    else if (stage === 'disassemble') cleanup = runDisassemble3D(scene, instance, onProgress, onComplete, onHint);
    else if (stage === 'weld') cleanup = runWeld3D(scene, instance, hud, onProgress, onComplete, onHint);
    else if (stage === 'paint') cleanup = runPaint3D(scene, instance, item.paintColor, onProgress, onComplete, onHint);
    else if (stage === 'test') cleanup = runTest3D(scene, instance, onProgress, onComplete, onHint);
  }

  // ---------- STORY REVEAL ----------
  showStoryReveal(item: ItemDef) {
    this.teardownScene();
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
