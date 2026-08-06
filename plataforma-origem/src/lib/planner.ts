import { useData } from './dataStore';
import type { Client, PostPlatform } from './types';

export interface Holiday {
  md: string; // 'MM-DD'
  name: string;
  universal?: boolean; // gera post para TODOS os clientes
}

/** Datas comemorativas (Brasil) — base curada. */
export const HOLIDAYS: Holiday[] = [
  { md: '01-01', name: 'Ano Novo', universal: true },
  { md: '02-14', name: 'Dia dos Namorados (internacional)' },
  { md: '03-08', name: 'Dia da Mulher', universal: true },
  { md: '03-15', name: 'Dia do Consumidor' },
  { md: '04-21', name: 'Tiradentes' },
  { md: '04-22', name: 'Dia da Terra' },
  { md: '05-01', name: 'Dia do Trabalho' },
  { md: '05-11', name: 'Dia das Mães', universal: true },
  { md: '06-05', name: 'Dia do Meio Ambiente' },
  { md: '06-12', name: 'Dia dos Namorados', universal: true },
  { md: '06-24', name: 'São João' },
  { md: '07-20', name: 'Dia do Amigo' },
  { md: '08-11', name: 'Dia dos Pais', universal: true },
  { md: '09-07', name: 'Independência do Brasil' },
  { md: '09-15', name: 'Dia do Cliente', universal: true },
  { md: '09-21', name: 'Dia da Árvore' },
  { md: '10-12', name: 'Dia das Crianças', universal: true },
  { md: '10-15', name: 'Dia do Professor' },
  { md: '11-15', name: 'Proclamação da República' },
  { md: '11-20', name: 'Consciência Negra' },
  { md: '11-27', name: 'Black Friday', universal: true },
  { md: '12-25', name: 'Natal', universal: true },
  { md: '12-31', name: 'Réveillon', universal: true },
];

/** Datas por profissão/segmento (o cliente escolhe no briefing/segmento). */
export const SEGMENT_HINTS: Record<string, string> = {
  saude: 'Dia do Médico (18/10), Dia do Oftalmologista (07/05), Dia da Saúde (05/08)',
  moda: 'Dia da Moda (18/04), Semana de Moda, trocas de coleção',
  alimentacao: 'Dia do Café (14/04), Dia da Pizza (10/07), Dia do Hambúrguer (28/05)',
  imobiliario: 'Dia do Corretor (27/08), feirões, lançamentos',
  educacao: 'Dia do Professor (15/10), volta às aulas, vestibular',
};

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function platformFor(type: string): PostPlatform {
  const t = type.toLowerCase();
  if (t.includes('vídeo') || t.includes('video') || t.includes('reels')) return 'Instagram';
  if (t.includes('tiktok')) return 'TikTok';
  if (t.includes('youtube')) return 'YouTube';
  if (t.includes('linkedin')) return 'LinkedIn';
  if (t.includes('blog')) return 'Blog';
  return 'Instagram';
}

export interface PlanResult {
  created: number;
  clients: number;
  holidays: string[];
}

/**
 * Gera o planejamento mensal para todos os clientes com cadência definida.
 * Considera a cadência semanal, datas comemorativas do mês e adiciona um
 * post extra para todos os clientes nas datas universais.
 */
export function generateMonthlyPlan(year: number, month: number): PlanResult {
  const store = useData.getState();
  const clients = store.clients;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let created = 0;
  const holidaysHit = new Set<string>();
  let participating = 0;

  const monthHolidays = HOLIDAYS.filter((h) => Number(h.md.slice(0, 2)) === month + 1);

  const hasCadence = (c: Client) => c.weeklyPlan && Object.values(c.weeklyPlan).some((v) => v.length);

  for (const client of clients) {
    if (!hasCadence(client)) continue;
    participating++;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dow = date.getDay();
      const types = client.weeklyPlan?.[dow] ?? [];
      const dayHoliday = monthHolidays.find((h) => Number(h.md.slice(3)) === day);
      for (const type of types) {
        const title = dayHoliday
          ? `${type} — ${dayHoliday.name}`
          : `${type} — ${WEEKDAYS[dow]}`;
        store.addPost({
          title,
          platform: platformFor(type),
          clientId: client.id,
          stage: 'ideia',
          scheduledDate: iso(year, month, day),
          notes: dayHoliday ? `Data comemorativa: ${dayHoliday.name}.` : undefined,
        });
        created++;
        if (dayHoliday) holidaysHit.add(dayHoliday.name);
      }
    }
  }

  // Datas universais: post extra para TODOS os clientes.
  for (const h of monthHolidays.filter((x) => x.universal)) {
    const day = Number(h.md.slice(3));
    for (const client of clients) {
      store.addPost({
        title: `Post comemorativo — ${h.name}`,
        platform: 'Instagram',
        clientId: client.id,
        stage: 'ideia',
        scheduledDate: iso(year, month, day),
        notes: `Data comemorativa universal (${h.name}). Peça para todos os clientes.`,
      });
      created++;
      holidaysHit.add(h.name);
    }
  }

  return { created, clients: participating, holidays: [...holidaysHit] };
}
