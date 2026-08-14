export type WagonKind = 'engine' | 'cargo' | 'passenger' | 'tank' | 'flat';

export interface WagonState {
  id: number;
  index: number; // 0 = engine (front), increases toward caboose
  kind: WagonKind;
  hp: number;
  maxHp: number;
  fire: number; // 0-100
  raider: boolean; // a raider is currently attached, dealing damage
  raiderHp: number;
  z: number; // world z of the wagon's front face
  resources: number; // cargo stored on this wagon (lost if wagon is lost)
  destroyed: boolean;
}

export type ZoneKind = 'city' | 'rescue' | 'raid' | 'calm';

export interface WorldZone {
  id: number;
  kind: ZoneKind;
  startZ: number;
  endZ: number;
  side: 1 | -1; // which side of the track the platform/event is on
  spent: boolean;
  pickups: Pickup[];
  rescues: RescueTarget[];
}

export interface Pickup {
  id: number;
  x: number;
  z: number;
  taken: boolean;
  value: number;
  mesh?: import('three').Object3D;
}

export interface RescueTarget {
  id: number;
  x: number;
  z: number;
  kind: 'passenger' | 'animal';
  rescued: boolean;
  lost: boolean;
  mesh?: import('three').Object3D;
}

export type PlayerInputSource = 'keyboard' | 'gamepad';

export interface PlayerInput {
  moveX: number; // -1..1
  moveZ: number; // -1..1 (forward/back along track, only matters off-train)
  jump: boolean;
  jumpPressed: boolean; // edge
  interact: boolean;
  interactPressed: boolean;
  detach: boolean;
  detachPressed: boolean;
}

export interface RunStats {
  distance: number;
  resources: number;
  passengersSaved: number;
  wagonsLost: number;
  wagonsBuilt: number;
  topSpeed: number;
  firesExtinguished: number;
  raidersRepelled: number;
  stormsSurvived: number;
}
