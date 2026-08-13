import type { CommunityStats, NPCDef } from '../core/types';

export const INITIAL_STATS: CommunityStats = {
  confianca: 50,
  esperanca: 50,
  memoria: 50,
};

export const NPCS: NPCDef[] = [
  {
    id: 'iracema',
    name: 'Dona Iracema',
    role: 'Feirante',
    bio: 'Troca sementes e conservas por consertos. Conhece todo mundo no vilarejo e todas as histórias que ele guarda.',
  },
  {
    id: 'theo',
    name: 'Theo',
    role: 'Curioso, 11 anos',
    bio: 'Nasceu depois do colapso. Só conhece o mundo antigo pelas coisas que passam pela sua bancada.',
  },
  {
    id: 'aldo',
    name: 'Seu Aldo',
    role: 'Ex-engenheiro',
    bio: 'Ajudava a manter a antiga usina funcionando. Hoje ajuda você a entender o que resta da tecnologia de antes.',
  },
  {
    id: 'vic',
    name: 'Vic',
    role: 'Recém-chegada',
    bio: 'Apareceu há duas estações, cansada e desconfiada. Ainda decide se este lugar vale a pena.',
  },
];

export const INITIAL_RELATIONSHIPS: Record<string, number> = {
  iracema: 50,
  theo: 50,
  aldo: 50,
  vic: 30,
};

export function describeStat(key: keyof CommunityStats, value: number): string {
  if (key === 'confianca') {
    if (value >= 75) return 'As pessoas deixam suas portas destrancadas de novo.';
    if (value >= 50) return 'O vilarejo confia na sua oficina, aos poucos.';
    if (value >= 25) return 'Ainda tem gente de pé atrás com você.';
    return 'Poucos confiam na oficina — e nas suas escolhas.';
  }
  if (key === 'esperanca') {
    if (value >= 75) return 'Tem música tocando de novo depois do jantar.';
    if (value >= 50) return 'As pessoas voltaram a fazer planos para o ano que vem.';
    if (value >= 25) return 'O dia a dia é sobre sobreviver, não sonhar.';
    return 'Ninguém fala mais sobre o futuro.';
  }
  if (value >= 75) return 'As histórias de antes do fim são contadas e recontadas com carinho.';
  if (value >= 50) return 'Um pouco do passado sobrevive nos objetos que você conserta.';
  if (value >= 25) return 'O passado vira apenas peças de reposição.';
  return 'Quase ninguém mais lembra como era o mundo antigo.';
}
