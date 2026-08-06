import type { PostPlatform, PostStage, Priority } from './types';

export const STAGE_META: Record<PostStage, { label: string; color: string }> = {
  ideia: { label: 'Ideia', color: '#94a3b8' },
  roteiro: { label: 'Roteiro', color: '#38bdf8' },
  producao: { label: 'Produção', color: '#a855f7' },
  edicao: { label: 'Edição', color: '#f59e0b' },
  aprovacao: { label: 'Aprovação', color: '#ec4899' },
  agendado: { label: 'Agendado', color: '#6366f1' },
  publicado: { label: 'Publicado', color: '#10b981' },
};

export const STAGE_ORDER: PostStage[] = [
  'ideia',
  'roteiro',
  'producao',
  'edicao',
  'aprovacao',
  'agendado',
  'publicado',
];

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: '#64748b' },
  media: { label: 'Média', color: '#38bdf8' },
  alta: { label: 'Alta', color: '#f59e0b' },
  urgente: { label: 'Urgente', color: '#ef4444' },
};

export const PLATFORMS: PostPlatform[] = [
  'Instagram',
  'TikTok',
  'YouTube',
  'LinkedIn',
  'Facebook',
  'Blog',
];

export const PLATFORM_COLOR: Record<PostPlatform, string> = {
  Instagram: '#ec4899',
  TikTok: '#22d3ee',
  YouTube: '#ef4444',
  LinkedIn: '#3b82f6',
  Facebook: '#6366f1',
  Blog: '#a855f7',
};

/** Cores predefinidas para etiquetas de cards. */
export const LABEL_PALETTE = [
  'Campanha', 'Vídeo', 'Design', 'Estratégia', 'Site',
  'Instagram', 'Relatório', 'Urgente', 'Tráfego',
];
