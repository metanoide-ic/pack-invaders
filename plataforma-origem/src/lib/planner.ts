import { useData } from './dataStore';
import type { Client, PostPlatform } from './types';

export interface Holiday {
  md: string; // 'MM-DD'
  name: string;
  universal?: boolean; // gera post extra para todos os clientes
}

/** Datas comemorativas (Brasil). */
export const HOLIDAYS: Holiday[] = [
  { md: '01-01', name: 'Ano Novo', universal: true },
  { md: '03-08', name: 'Dia da Mulher', universal: true },
  { md: '03-15', name: 'Dia do Consumidor' },
  { md: '04-21', name: 'Tiradentes' },
  { md: '05-01', name: 'Dia do Trabalho' },
  { md: '05-11', name: 'Dia das Mães', universal: true },
  { md: '06-05', name: 'Dia do Meio Ambiente' },
  { md: '06-12', name: 'Dia dos Namorados', universal: true },
  { md: '06-24', name: 'São João' },
  { md: '07-20', name: 'Dia do Amigo' },
  { md: '08-11', name: 'Dia dos Pais', universal: true },
  { md: '09-07', name: 'Independência do Brasil' },
  { md: '09-15', name: 'Dia do Cliente', universal: true },
  { md: '10-12', name: 'Dia das Crianças', universal: true },
  { md: '10-15', name: 'Dia do Professor' },
  { md: '11-20', name: 'Consciência Negra' },
  { md: '11-27', name: 'Black Friday', universal: true },
  { md: '12-25', name: 'Natal', universal: true },
  { md: '12-31', name: 'Réveillon', universal: true },
];

export interface PlanItem {
  date: string; // ISO
  type: string; // Post, Carrossel, Stories, Vídeo, Reels
  title: string;
  holiday?: string;
}

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Ângulos editoriais usados no gerador local de temas. */
const ANGLES: Record<string, string[]> = {
  default: [
    'Dica prática para o público',
    'Bastidores do trabalho',
    'Prova social com resultado de cliente',
    'Mito e verdade do segmento',
    'Pergunta para engajar os seguidores',
    'Apresentação de produto ou serviço',
    'Conteúdo educativo sobre o segmento',
    'Depoimento ou avaliação',
  ],
  video: [
    'Bastidores gravados no local',
    'Antes e depois',
    'Tutorial rápido',
    'Resposta a uma dúvida frequente',
    'Tendência adaptada ao segmento',
    'Tour ou demonstração',
  ],
};

function localTitle(type: string, index: number, holiday?: string): string {
  if (holiday) return `${type} comemorativo: ${holiday}`;
  const pool = /víd|reels/i.test(type) ? ANGLES.video : ANGLES.default;
  return `${type}: ${pool[index % pool.length]}`;
}

/** Monta os slots do mês a partir da cadência semanal + datas comemorativas. */
export function buildClientSlots(client: Client, year: number, month: number): PlanItem[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Datas do calendário nacional mais as datas próprias do cliente
  // (aniversário de cada cidade onde ele atua, aniversário da loja, data do
  // setor). Um cliente regional pode ter várias.
  const proprias: Holiday[] = (client.localDates ?? []).map((d) => ({ md: d.md, name: d.name }));
  const monthHolidays = [...HOLIDAYS, ...proprias].filter(
    (h) => Number(h.md.slice(0, 2)) === month + 1,
  );
  const items: PlanItem[] = [];
  let idx = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    const types = client.weeklyPlan?.[dow] ?? [];
    const hol = monthHolidays.find((h) => Number(h.md.slice(3)) === d);
    for (const type of types) {
      items.push({ date: iso(year, month, d), type, title: localTitle(type, idx++, hol?.name), holiday: hol?.name });
    }
  }

  // Post extra nas datas universais e nas datas próprias do cliente, mesmo
  // que não haja cadência naquele dia.
  const proprioNoMes = new Set(proprias.map((p) => p.md));
  for (const h of monthHolidays.filter((x) => x.universal || proprioNoMes.has(x.md))) {
    const date = iso(year, month, Number(h.md.slice(3)));
    if (!items.some((i) => i.date === date && i.holiday === h.name)) {
      items.push({ date, type: 'Post', title: localTitle('Post', idx++, h.name), holiday: h.name });
    }
  }

  return items.sort((a, b) => a.date.localeCompare(b.date));
}

function platformFor(type: string): PostPlatform {
  const t = type.toLowerCase();
  if (t.includes('tiktok')) return 'TikTok';
  if (t.includes('youtube')) return 'YouTube';
  return 'Instagram';
}

/** Prazo de produção: dois dias antes da publicação (nunca antes de hoje). */
function dueDateFor(publishDate: string): string {
  const d = new Date(publishDate + 'T00:00');
  d.setDate(d.getDate() - 2);
  const today = new Date().toISOString().slice(0, 10);
  const due = d.toISOString().slice(0, 10);
  return due < today ? today : due;
}

export interface ApplyResult {
  posts: number;
  cards: number;
  videos: number;
  boardId: string;
}

/**
 * Envia o plano para produção: cria os posts no pipeline, as tarefas no quadro
 * do cliente (com prazo) e os projetos de vídeo. Itens já existentes (mesmo
 * título e data) são pulados, então gerar de novo não duplica.
 */
export function applyPlanToWorkspace(client: Client, items: PlanItem[]): ApplyResult {
  const store = useData.getState();
  const board = store.ensureClientBoard(client.id, `Produção: ${client.name}`);
  const firstCol = board.columns[0]?.id;
  const existingCards = new Set(Object.values(board.cards).map((c) => `${c.title}|${c.dueDate}`));
  let posts = 0, cards = 0, videos = 0;

  for (const item of items) {
    const due = dueDateFor(item.date);
    const isVideo = /víd|reels/i.test(item.type);

    const postExists = store.posts.some(
      (p) => p.clientId === client.id && p.scheduledDate === item.date && p.title === item.title,
    );
    if (!postExists) {
      store.addPost({
        title: item.title,
        platform: platformFor(item.type),
        clientId: client.id,
        stage: 'ideia',
        scheduledDate: item.date,
        notes: item.holiday ? `Data comemorativa: ${item.holiday}.` : undefined,
      });
      posts++;
    }

    if (firstCol && !existingCards.has(`${item.title}|${due}`)) {
      store.addCard(board.id, firstCol, {
        title: item.title,
        dueDate: due,
        clientId: client.id,
        labels: [isVideo ? 'Vídeo' : 'Design'],
        description: `Publicação prevista para ${new Date(item.date + 'T00:00').toLocaleDateString('pt-BR')} (${WEEKDAYS[new Date(item.date + 'T00:00').getDay()]}).${item.holiday ? ` Data comemorativa: ${item.holiday}.` : ''}`,
      });
      existingCards.add(`${item.title}|${due}`);
      cards++;
    }

    if (isVideo) {
      const vidExists = store.videos.some((v) => v.clientId === client.id && v.title === item.title && v.dueDate === due);
      if (!vidExists) {
        store.addVideo({ title: item.title, clientId: client.id, dueDate: due });
        videos++;
      }
    }
  }

  store.addEvent({
    channel: 'sistema',
    title: `Planejamento de ${client.name} enviado para produção`,
    status: 'ok',
    detail: `${posts} posts, ${cards} tarefas e ${videos} vídeos criados com prazos.`,
  });

  return { posts, cards, videos, boardId: board.id };
}
