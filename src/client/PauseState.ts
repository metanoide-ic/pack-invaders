/**
 * Pause State — shared state module to avoid circular dependencies.
 */

let _paused = false;

export function togglePause(): void {
  _paused = !_paused;
}

export function isPaused(): boolean {
  return _paused;
}

export function setPaused(val: boolean): void {
  _paused = val;
}
