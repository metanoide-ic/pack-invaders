const KEY = 'linha-zero-best-distance-v1';

/** Best distance ever reached, persisted locally (meters, matching the HUD's display unit). */
export function getBestDistanceMeters(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0; // localStorage can throw in locked-down/private contexts — fail quiet, no score is fine
  }
}

/** Returns true if this run set a new record. */
export function reportDistanceMeters(distanceMeters: number): boolean {
  const best = getBestDistanceMeters();
  if (distanceMeters <= best) return false;
  try {
    localStorage.setItem(KEY, String(Math.floor(distanceMeters)));
  } catch {
    /* ignore — record just won't persist this session */
  }
  return true;
}
