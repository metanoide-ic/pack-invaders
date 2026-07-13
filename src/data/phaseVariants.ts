/**
 * PHASE VARIANTS — alternate month layouts that occasionally replace a
 * scheduled normal-fight or boss-fight month (see GameManager.MONTH_SCHEDULE
 * and rollYearPhasePlan). Each year rolls 2 normal-slot months + 1 boss-slot
 * month (never month 12, the mega boss) from these pools, picking only
 * `implemented: true` entries so the schedule never selects a variant whose
 * gameplay hasn't shipped yet. Add more entries here and flip `implemented`
 * once a variant's mechanics are built.
 */

export interface PhaseVariantDef {
  id: string;
  name: string;
  description: string;
  implemented: boolean;
}

export const NORMAL_PHASE_VARIANTS: PhaseVariantDef[] = [
  {
    id: 'frostbite',
    name: 'Geada Mortal',
    description: 'Onda congelada — fique parado e o frio acumula até estourar em dano pesado. Mova-se e dashe pra não congelar.',
    implemented: true,
  },
  {
    id: 'truck',
    name: 'Estrada de Fuga',
    description: 'Na caçamba de uma caminhonete em movimento, inimigos vêm de cima e o combustível precisa ser coletado antes de acabar.',
    implemented: false, // aguardando sprites dos 8 inimigos novos
  },
  {
    id: 'space',
    name: 'Vácuo Aberto',
    description: 'Controle uma nave no espaço aberto — destroços e asteroides vêm em rota de colisão e causam dano pesado.',
    implemented: true,
  },
  {
    id: 'acid_rain',
    name: 'Chuva Ácida',
    description: 'Tempestade ácida nas ruínas — fique sob abrigo ou tome dano contínuo a céu aberto.',
    implemented: true,
  },
  {
    id: 'ground_zero',
    name: 'Zona-Zero',
    description: 'Um telhado prestes a desabar — o chão cede em pedaços e a área segura encolhe com o tempo.',
    implemented: true,
  },
];

export const BOSS_PHASE_VARIANTS: PhaseVariantDef[] = [
  {
    id: 'copycat',
    name: 'Copycat',
    description: 'Um alien assume sua forma e seu equipamento — duelo 1v1 numa cidade em ruínas, com uma fase final de pura sobrevivência.',
    implemented: true,
  },
  {
    id: 'mothership',
    name: 'Nave-Mãe',
    description: 'Uma nave gigante parada dispara sem parar enquanto inimigos vazam pelas laterais — acerte os pontos fracos quando brilharem.',
    implemented: true,
  },
  {
    id: 'swarm_tide',
    name: 'Enxame em Maré',
    description: 'Sem boss único — uma Rainha escondida comanda uma horda crescente por tempo limitado até ser forçada a se expor.',
    implemented: true,
  },
  {
    id: 'rail_duel',
    name: 'Duelo nas Trilhas',
    description: 'Um veículo rival acompanha na estrada, tentando abalroar e atirando pelas laterais — só vulnerável quando a blindagem abre.',
    implemented: true,
  },
  {
    id: 'the_pit',
    name: 'O Poço',
    description: 'O boss fica soterrado, erguendo membros de pontos fixos da arena que precisam ser destruídos antes de recuarem.',
    implemented: true,
  },
];

export function getNormalVariant(id: string | null): PhaseVariantDef | null {
  return NORMAL_PHASE_VARIANTS.find(v => v.id === id) ?? null;
}

export function getBossVariant(id: string | null): PhaseVariantDef | null {
  return BOSS_PHASE_VARIANTS.find(v => v.id === id) ?? null;
}
