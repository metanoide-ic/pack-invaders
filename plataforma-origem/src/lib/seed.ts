import type { Board, Campaign, CampaignDay, Card, Client, LibraryItem, Post, Transaction, VideoProject, WorkspaceData } from './types';
import { uid } from './utils';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function seedData(): WorkspaceData {
  const clients: Client[] = [
    { id: uid('cli'), name: 'Studio Aurora', color: '#ec4899', contact: 'contato@studioaurora.com', instagram: 'studioaurora', monthlyFee: 4800, createdAt: Date.now() },
    {
      id: uid('cli'), name: 'Café Matriz', color: '#f59e0b', instagram: 'cafematriz', monthlyFee: 2600,
      city: 'Volta Redonda', whatsappGroup: 'Café Matriz x Origem',
      briefing: 'Cafeteria artesanal no centro, com grãos próprios e brunch aos fins de semana. Público 25 a 45 anos. Tom acolhedor e direto, valoriza o preparo e o ambiente.',
      weeklyPlan: { 1: ['Vídeo'], 3: ['Post'], 5: ['Carrossel'] },
      createdAt: Date.now(),
    },
    { id: uid('cli'), name: 'Vértice Imóveis', color: '#06b6d4', contact: 'marketing@vertice.com', instagram: 'verticeimoveis', monthlyFee: 6900, createdAt: Date.now() },
    { id: uid('cli'), name: 'Academia Pulse', color: '#10b981', instagram: 'pulsefit', monthlyFee: 3200, createdAt: Date.now() },
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
      { id: uid('col'), title: 'Revisão', cardIds: [] },
      { id: uid('col'), title: 'Prontos', cardIds: [c3.id] },
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
      caption: 'O verão chegou e o guarda-roupa pede novidade.', sentForApproval: true,
      copy: 'O verão chegou e o guarda-roupa pede novidade.\n\nSeparamos 5 tendências que vão bombar. Salva esse post!\n\n#moda #verao #tendencias #origem #marketing',
      revisions: [],
      checklist: [
        { id: uid('ck'), text: 'Copy aprovada', done: true },
        { id: uid('ck'), text: 'Arte finalizada', done: true },
        { id: uid('ck'), text: 'Aprovação do cliente', done: false },
      ], createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Reels — receita do café especial', platform: 'TikTok',
      clientId: cafe.id, stage: 'edicao', scheduledDate: daysFromNow(4), revisions: [],
      checklist: [{ id: uid('ck'), text: 'Gravação', done: true }, { id: uid('ck'), text: 'Edição', done: false }],
      createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Tour do apê decorado', platform: 'Instagram',
      clientId: vertice.id, stage: 'agendado', scheduledDate: daysFromNow(0), revisions: [],
      checklist: [], createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Post institucional — nova unidade', platform: 'LinkedIn',
      clientId: vertice.id, stage: 'alteracao', revisions: [
        { id: uid('rev'), text: 'Trocar a foto de capa pela fachada nova.', resolved: false, createdAt: Date.now() },
        { id: uid('rev'), text: 'Deixar a legenda mais curta e direta.', resolved: false, createdAt: Date.now() },
      ], checklist: [], createdAt: Date.now(),
    },
    {
      id: uid('post'), title: 'Stories — enquete de sabores', platform: 'Instagram',
      clientId: cafe.id, stage: 'publicado', scheduledDate: daysFromNow(-2), published: true, revisions: [],
      checklist: [{ id: uid('ck'), text: 'Publicado', done: true }], createdAt: Date.now(),
    },
  ];

  const videos: VideoProject[] = [
    {
      id: uid('vid'), title: 'VSL — Vértice Imóveis', clientId: vertice.id, stage: 'edicao',
      editor: 'Bruno', dueDate: daysFromNow(2), notes: 'Vídeo de vendas de 90s para tráfego.',
      links: [{ id: uid('lnk'), label: 'Material bruto (Drive)', url: 'https://drive.google.com' }],
      checklist: [{ id: uid('ck'), text: 'Decupagem', done: true }, { id: uid('ck'), text: 'Corte v1', done: false }],
      revisions: [], createdAt: Date.now(),
    },
    {
      id: uid('vid'), title: 'Reels bastidores — Café Matriz', clientId: cafe.id, stage: 'alteracao',
      editor: 'Marina', dueDate: daysFromNow(1),
      links: [], checklist: [],
      revisions: [
        { id: uid('rev'), text: 'Cortar os 3 primeiros segundos.', resolved: false, createdAt: Date.now() },
        { id: uid('rev'), text: 'Aumentar o volume da trilha.', resolved: true, createdAt: Date.now() },
      ], createdAt: Date.now(),
    },
    {
      id: uid('vid'), title: 'Institucional 60s — Studio Aurora', clientId: aurora.id, stage: 'gravacao',
      editor: 'Bruno', dueDate: daysFromNow(5), links: [], checklist: [], revisions: [], createdAt: Date.now(),
    },
  ];

  const library: LibraryItem[] = [
    {
      id: uid('lib'), title: 'Prova social — depoimento', platform: 'Instagram', category: 'Autoridade',
      caption: 'Quem confia, colhe resultado. Veja o que [CLIENTE] alcançou com a gente.',
      hashtags: '#resultado #depoimento #origem #marketing', createdAt: Date.now(),
    },
    {
      id: uid('lib'), title: 'Bastidores da equipe', platform: 'Instagram', category: 'Conexão',
      caption: 'Por trás de cada campanha tem gente que ama o que faz. Bora criar junto?',
      hashtags: '#bastidores #agencia #time', createdAt: Date.now(),
    },
    {
      id: uid('lib'), title: 'Dica rápida de marketing', platform: 'TikTok', category: 'Educativo',
      caption: 'Anota essa: [DICA]. Simples assim. Salva pra aplicar hoje.',
      hashtags: '#dica #marketingdigital #estrategia', createdAt: Date.now(),
    },
  ];

  // Dias sintéticos para o diagnóstico ter tendência com que trabalhar.
  const serie = (n: number, f: (i: number) => Omit<CampaignDay, 'date'>): CampaignDay[] =>
    Array.from({ length: n }, (_, i) => ({ date: daysFromNow(-(n - i)), ...f(i) }));

  const campaigns: Campaign[] = [
    {
      id: uid('cmp'), name: 'Vendas — lançamentos Vértice', clientId: vertice.id, platform: 'Meta',
      objective: 'Leads', status: 'ativa', dailyBudget: 60, startDate: daysFromNow(-12),
      funnel: 'topo', targetCpa: 12,
      landingUrl: 'https://verticeimoveis.com.br/lancamentos',
      notes: 'Público de 25 a 55 anos na região, criativos de tour do apartamento.',
      metrics: { spend: 720, impressions: 148320, reach: 61240, clicks: 3140, results: 87, frequency: 2.4, updatedAt: Date.now() },
      history: serie(12, () => ({ spend: 60, impressions: 12360, clicks: 262, results: 7 })),
      createdAt: Date.now(),
    },
    {
      // Criativo cansado: frequência alta e cliques caindo nos últimos dias.
      id: uid('cmp'), name: 'Movimento de loja — Café Matriz', clientId: cafe.id, platform: 'Meta',
      objective: 'Mensagens', status: 'ativa', dailyBudget: 25, startDate: daysFromNow(-24),
      funnel: 'topo', targetCpa: 4,
      metrics: { spend: 600, impressions: 141870, reach: 32910, clicks: 1964, results: 141, frequency: 4.3, updatedAt: Date.now() },
      history: [
        ...serie(9, () => ({ spend: 25, impressions: 5800, clicks: 105, results: 7 })),
        ...serie(3, () => ({ spend: 25, impressions: 5800, clicks: 52, results: 3 })),
      ],
      createdAt: Date.now(),
    },
    {
      id: uid('cmp'), name: 'Reconhecimento — Studio Aurora', clientId: aurora.id, platform: 'Google',
      objective: 'Reconhecimento', status: 'planejada', totalBudget: 900, startDate: daysFromNow(3),
      metrics: { spend: 0, impressions: 0, reach: 0, clicks: 0, results: 0 },
      createdAt: Date.now(),
    },
  ];

  return { clients, boards, transactions, posts, videos, library, events: [], charges: [], campaigns };
}
