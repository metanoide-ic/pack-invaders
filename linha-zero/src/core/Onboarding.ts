const KEY = 'linha-zero-tutorial-seen-v1';

export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markTutorialSeen(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore — it'll just show again next run, harmless */
  }
}

export interface TutorialStep {
  at: number; // seconds into the run
  text: string;
  duration: number;
}

/** A short first-run-only banner sequence, spaced out so it never overlaps a hazard banner. */
export const TUTORIAL_STEPS: TutorialStep[] = [
  { at: 1, text: '👋 WASD move, Espaço pula. Fiquem no teto do trem por enquanto.', duration: 4.5 },
  { at: 6.5, text: '🗺️ O radar no canto mostra cidades (amarelo), resgates (verde) e perigo (vermelho) chegando.', duration: 5 },
  { at: 13, text: '🏙️ Perto de uma cidade: vá até a borda do teto e pule (Espaço) para descer.', duration: 5 },
  { at: 19.5, text: '🔥 E apaga incêndio, repara vagão ou repele saqueador. Q desacopla o último vagão.', duration: 5 },
];
