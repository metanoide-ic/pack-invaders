/**
 * Steamworks integration for the Electron main process.
 *
 * IMPORTANT — honest status: this has never been tested against a real
 * Steamworks App ID or a running Steam client, because this dev environment
 * has neither. What IS verified is the fallback path: `init()` fails
 * gracefully (catches, logs, returns false) when Steam isn't available,
 * which is the actual state every time this has been run so far. Treat the
 * "Steam present" branch as wired-up-but-unverified until someone runs it
 * with a real App ID and the Steam client open.
 *
 * Before shipping: replace DEV_APP_ID with the game's real Steamworks App ID
 * (or ship a steam_appid.txt next to the executable instead), and create the
 * achievement IDs listed in ACHIEVEMENTS below in the Steamworks partner
 * dashboard — they do nothing until they exist there.
 */

// Valve's public "Spacewar" test App ID — documented and safe to use for
// local development before a real App ID exists. https://partner.steamgames.com/doc/sdk/api
const DEV_APP_ID = 480;

const ACHIEVEMENTS = {
  FIRST_RESCUE: 'ACH_FIRST_RESCUE',
  FIRST_STORM_SURVIVED: 'ACH_FIRST_STORM_SURVIVED',
  FIRST_RAIDER_REPELLED: 'ACH_FIRST_RAIDER_REPELLED',
  TEN_WAGONS: 'ACH_TEN_WAGONS',
  DISTANCE_1000M: 'ACH_DISTANCE_1000M',
  DISTANCE_5000M: 'ACH_DISTANCE_5000M',
};

let client = null;
let available = false;

function init() {
  try {
    const steamworks = require('steamworks.js');
    const appId = Number(process.env.STEAM_APP_ID) || DEV_APP_ID;
    client = steamworks.init(appId);
    steamworks.electronEnableSteamOverlay();
    available = true;
    console.log(`[steam] Steamworks initialized (appId=${appId})`);
  } catch (err) {
    available = false;
    client = null;
    console.warn('[steam] Steamworks unavailable — running without it:', err.message);
  }
  return available;
}

function isAvailable() {
  return available;
}

function unlockAchievement(id) {
  if (!available || !client) return false;
  if (!Object.values(ACHIEVEMENTS).includes(id)) {
    console.warn('[steam] unknown achievement id, ignoring:', id);
    return false;
  }
  try {
    return client.achievement.activate(id);
  } catch (err) {
    console.warn('[steam] failed to unlock achievement', id, err.message);
    return false;
  }
}

module.exports = { init, isAvailable, unlockAchievement, ACHIEVEMENTS };
