import type { Board, Card, Client, Post, Transaction, WorkspaceData } from './types';
import { uid } from './utils';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function seedData(): WorkspaceData {
  const clients: Client[] = [
    { id: uid('cli'), name: 'Studio Aurora', color: '#ec4899', contact: 'contato@studioaurora.com', monthlyFee: 4800, createdAt: Date.now() },
    { id: uid('cli'), name: 'Café Matriz', color: '#f59e0b', contact: '@cafematriz', monthlyFee: 2600, createdAt: Date.now() },
    { id: uid('cli'), name: 'Vértice Imóveis', color: '#06b6d4', contact: 'marketing@vertice.com', monthlyFee: 6900, createdAt: Date.now() },
    { id: uid('cli'), name: 'Academia Pulse', color: '#10b981', contact: '@pulsefit', monthlyFee: 3200, createdAt: Date.now() },
  ];

  const [aurora, cafe, vertice] = clients;

  const mkCard = (title: string, extra: Partial<Card> = {}): Card => ({
    id: uid('card'),
    title,
    labels: [],
    checklist: [],
    createdAt: Date.now(),
    ...extra,
  });

  const c1 = mkCard('Campanha de lançamento — Coleção Verão', {
    clientId: aurora.id,
    priority: 'alta',
    dueDate: daysFromNow(3),
    labels: ['Campanha', 'Instagram'],
    description: 'Conceito visual + 6 peças para o feed e stories.',
    checklist: [
      { id: uid('ck'), text: 'Definir conceito', done: true },
      { id: uid('ck'), text: 'Aprovar paleta', done: true },
      { id: uid('ck'), text: 'Produzir artes', done: false },
    ],
  });
  const c2 = mkCard('Roteiro Reels — bastidores', { clientId: cafe.id, priority: 'media', labels: ['Vídeo'] });
  const c3 = mkCard('Tour 360º — apartamento decorado', { clientId: vertice.id, priority: 'urgente', dueDate: daysFromNow(1), labels: ['Vídeo', 'Site'] });
  const c4 = mkCard('Planejamento de conteúdo — Agosto', { clientId: aurora.id, priority: 'media', labels: ['Estratégia'] });
  const c5 = mkCard('Ajustes de identidade visual', { clientId: cafe.id, priority: 'baixa', labels: ['Design'] });
  const c6 = mkCard('Relatório de performance — Julho', { clientId: vertice.id, priority: 'alta', dueDate: daysFromNow(-1), labels: ['Relatório'] });

  const cards: Record<string, Card> = Object.fromEntries(
    [c1, c2, c3, c4, c5, c6].map((c) => [c.id, c]),
  );

  const board: Board = {
    id: uid('board'),
    name: 'Produção de Conteúdo',
    description: 'Fluxo geral de demandas criativas da agência.',
    columns: [
      { id: uid('col'), title: 'A fazer', cardIds: [c4.id, c5.id] },
      { id: uid('col'), title: 'Em produção', cardIds: [c1.id, c2.id] },
      { id: uid('col'), title: 'Revisão', cardIds: [c3.id] },
      { id: uid('col'), title: 'Concluído', cardIds: [c6.id] },
    ],
    cards,
    createdAt: Date.now(),
  };

  const boards: Board[] = [board];

  const transactions: Transaction[] = [
    { id: uid('tx'), type: 'receita', description: 'Fee mensal — Vértice Imóveis', amount: 6900, category: 'Contrato', clientId: vertice.id, date: daysFromNow(-4), status: 'pago', createdAt: Date.now() },
    { id: uid('tx'), type: 'receita', description: 'Fee mensal — Studio Aurora', amount: 4800, category: 'Contrato', clientId: aurora.id, date: daysFromNow(-3), status: 'pago', createdAt: Date.now() },
    { id: uid('tx'), type: 'receita', description: 'Projeto avulso — Café Matriz', amount: 2600, category: 'Contrato', clientId: cafe.id, date: daysFromNow(2), status: 'pendente', createdAt: Date.now() },
    { id: uid('tx'), type: 'despesa', description: 'Tráfego pago (Meta Ads)', amount: 3200, category: 'Mídia', clientId: vertice.id, date: daysFromNow(-2), status: 'pago', createdAt: Date.now() },
    { id: uid('tx'), type: 'despesa', description: 'Ferramentas e assinaturas', amount: 890, category: 'Software', date: daysFromNow(-5), status: 'pago', createdAt: Date.now() },
    { id: uid('tx'), type: 'despesa', description: 'Freelancer de edição', amount: 1400, category: 'Terceiros', clientId: aurora.id, date: daysFromNow(1), status: 'pendente', createdAt: Date.now() },
  ];

  const posts: Post[] = [
    {
      id: uid('post'), title: 'Carrossel — 5 tendências de verão', platform: 'Instagram',
      clientId: aurora.id, stage: 'aprovacao', scheduledDate: daysFromNow(2),
      caption: 'O verão chegou e o guarda-roupa pede novidade ☀️',
      checklist: [
        { id: uid('ck'), text: 'Copy aprovada', done: true },
        { id: uid('ck'), text: 'Arte finalizada', done: true },
        { id: uid('ck'), text: 'Aprovação do cliente', done: false },
      ], createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Reels — receita do café especial', platform: 'TikTok',
      clientId: cafe.id, stage: 'edicao', scheduledDate: daysFromNow(4),
      checklist: [{ id: uid('ck'), text: 'Gravação', done: true }, { id: uid('ck'), text: 'Edição', done: false }],
      createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Tour do apê decorado', platform: 'YouTube',
      clientId: vertice.id, stage: 'agendado', scheduledDate: daysFromNow(1),
      checklist: [], createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Post institucional — nova unidade', platform: 'LinkedIn',
      clientId: vertice.id, stage: 'ideia', checklist: [], createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Stories — enquete de sabores', platform: 'Instagram',
      clientId: cafe.id, stage: 'publicado', scheduledDate: daysFromNow(-2),
      checklist: [{ id: uid('ck'), text: 'Publicado', done: true }], createdAt: Date.now(),
    },
  ];

  return { clients, boards, transactions, posts };
}
