export type StageType = 'clean' | 'disassemble' | 'weld' | 'paint' | 'test';

export type ShapeId = 'radio' | 'musicbox' | 'bike' | 'typewriter' | 'clock';

export interface CommunityStats {
  confianca: number; // trust in the workshop / community cohesion
  esperanca: number; // hope for the future
  memoria: number; // how much of the past is preserved and honored
}

export interface ChoiceOption {
  id: string;
  label: string;
  description: string;
  effects: Partial<CommunityStats>;
  npcEffects?: Record<string, number>; // npcId -> delta
  resultText: string;
}

export interface ChoiceDef {
  prompt: string;
  options: [ChoiceOption, ChoiceOption];
}

export interface ItemDef {
  id: string;
  name: string;
  shape: ShapeId;
  ownerName: string;
  intro: string; // customer dialogue when dropping off the item
  stages: StageType[];
  storyLines: string[]; // revealed as repair progresses, one per stage completed
  choice: ChoiceDef;
  baseColor: string; // "clean" material color
  paintColor: string; // color used in paint stage
}

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  bio: string;
}

export interface SaveData {
  version: 1;
  dayIndex: number;
  stats: CommunityStats;
  relationships: Record<string, number>;
  choicesMade: Record<string, string>; // itemId -> optionId
  finished: boolean;
}
