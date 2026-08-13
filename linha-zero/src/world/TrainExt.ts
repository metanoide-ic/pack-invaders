import * as THREE from 'three';
import { Train } from './Train';
import { WagonState } from '../types';

export interface SeveredWagon {
  wagon: WagonState;
  mesh: THREE.Group;
}

/**
 * A structural failure (fire burning through / hull breach) doesn't just cost
 * one wagon — the coupling gives way and everything behind it goes with it.
 * This augments Train with that behaviour without bloating the base class.
 */
export function detachFrom(train: Train, index: number): { removed: SeveredWagon[]; lostResources: number } {
  const removed: SeveredWagon[] = [];
  let lostResources = 0;
  while (train.wagons.length > Math.max(1, index)) {
    const res = train.detachLast();
    if (!res) break;
    removed.push({ wagon: res.wagon, mesh: res.mesh });
    lostResources += res.lostResources;
  }
  return { removed, lostResources };
}
