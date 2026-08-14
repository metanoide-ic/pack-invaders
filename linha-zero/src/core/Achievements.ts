/**
 * IDs must stay in sync with electron/steam.cjs's ACHIEVEMENTS map by hand —
 * the two run in separate processes (renderer vs. Electron main) with no
 * shared module system, so there's no single source of truth to import from.
 */
export const ACHIEVEMENTS = {
  FIRST_RESCUE: 'ACH_FIRST_RESCUE',
  FIRST_STORM_SURVIVED: 'ACH_FIRST_STORM_SURVIVED',
  FIRST_RAIDER_REPELLED: 'ACH_FIRST_RAIDER_REPELLED',
  TEN_WAGONS: 'ACH_TEN_WAGONS',
  DISTANCE_1000M: 'ACH_DISTANCE_1000M',
  DISTANCE_5000M: 'ACH_DISTANCE_5000M',
} as const;

type AchievementId = (typeof ACHIEVEMENTS)[keyof typeof ACHIEVEMENTS];

declare global {
  interface Window {
    /** Only present inside the packaged Electron app (see electron/preload.cjs) — undefined in a plain browser tab. */
    steamBridge?: {
      isAvailable: () => Promise<boolean>;
      unlockAchievement: (id: string) => Promise<boolean>;
    };
  }
}

/**
 * Fire-and-forget: does nothing (silently) outside the Electron build, and
 * does nothing (silently) if Steam itself isn't available inside it either.
 * Never throws, never blocks gameplay on a network/IPC round trip.
 */
export function unlockAchievement(id: AchievementId) {
  window.steamBridge?.unlockAchievement(id).catch(() => {
    /* Steam hiccups shouldn't matter to the player mid-run */
  });
}
