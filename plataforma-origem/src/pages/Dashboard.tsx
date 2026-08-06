import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CalendarCheck,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui';
import { useData } from '@/lib/dataStore';
import { useAuth } from '@/lib/authStore';
import { useClientMap, isSameMonth, monthKey } from '@/lib/hooks';
import { money, cn } from '@/lib/utils';
import { STAGE_META } from '@/lib/labels';

function Kpi({
  label,
  value,
  icon,
  tint,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tint: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/55">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${tint}22`, color: tint }}>
          {icon}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-white/40">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const user = useAuth((s) => s.current());
  const { transactions, posts, boards } = useData();
  const clientMap = useClientMap();

  const fin = useMemo(() => {
    const monthTx = transactions.filter((t) => isSameMonth(t.date));
    const receita = monthTx.filter((t) => t.type === 'receita' && t.status === 'pago').reduce((a, t) => a + t.amount, 0);
    const aReceber = transactions.filter((t) => t.type === 'receita' && t.status === 'pendente').reduce((a, t) => a + t.amount, 0);
    const despesa = monthTx.filter((t) => t.type === 'despesa').reduce((a, t) => a + t.amount, 0);
    return { receita, aReceber, despesa, saldo: receita - despesa };
  }, [transactions]);

  const monthly = useMemo(() => {
    const map = new Map<string, { receita: number; despesa: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      map.set(d.toISOString().slice(0, 7), { receita: 0, despesa: 0 });
    }
    transactions.forEach((t) => {
      const k = monthKey(t.date);
      const e = map.get(k);
      if (e) e[t.type === 'receita' ? 'receita' : 'despesa'] += t.amount;
    });
    return [...map.entries()].map(([k, v]) => ({
      mes: new Date(k + '-02').toLocaleDateString('pt-BR', { month: 'short' }),
      ...v,
    }));
  }, [transactions]);

  const postsByStage = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => (counts[p.stage] = (counts[p.stage] || 0) + 1));
    return Object.entries(counts).map(([stage, value]) => ({
      name: STAGE_META[stage as keyof typeof STAGE_META]?.label ?? stage,
      value,
      color: STAGE_META[stage as keyof typeof STAGE_META]?.color ?? '#7c3aed',
    }));
  }, [posts]);

  const openTasks = useMemo(() => {
    const items: { title: string; client?: string; due?: string; boardId: string }[] = [];
    boards.forEach((b) => {
      const doneCol = b.columns[b.columns.length - 1]?.id;
      b.columns.forEach((col) => {
        if (col.id === doneCol) return;
        col.cardIds.forEach((id) => {
          const c = b.cards[id];
          if (c) items.push({ title: c.title, client: c.clientId ? clientMap[c.clientId]?.name : undefined, due: c.dueDate, boardId: b.id });
        });
      });
    });
    return items
      .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
      .slice(0, 5);
  }, [boards, clientMap]);

  const upcomingPosts = useMemo(
    () =>
      [...posts]
        .filter((p) => p.stage !== 'publicado')
        .sort((a, b) => (a.scheduledDate || '9999').localeCompare(b.scheduledDate || '9999'))
        .slice(0, 5),
    [posts],
  );

  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <div>
      <PageHeader
        title={`Olá, ${firstName} 👋`}
        subtitle="Aqui está o panorama da agência hoje."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Receita do mês" value={money(fin.receita)} tint="#10b981" icon={<TrendingUp size={18} />} hint="Pagamentos confirmados" />
        <Kpi label="A receber" value={money(fin.aReceber)} tint="#f59e0b" icon={<Clock size={18} />} hint="Pendências em aberto" />
        <Kpi label="Despesas do mês" value={money(fin.despesa)} tint="#ef4444" icon={<TrendingDown size={18} />} />
        <Kpi label="Saldo do mês" value={money(fin.saldo)} tint="#7c3aed" icon={<Wallet size={18} />} hint="Receitas − despesas" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Gráfico financeiro */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Receitas x Despesas</h3>
            <Link to="/app/financeiro" className="inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200">
              Ver financeiro <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barGap={6}>
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: '#ffffff66', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#ffffff08' }}
                  contentStyle={{ background: '#14142a', border: '1px solid #23233f', borderRadius: 12, color: '#fff' }}
                  formatter={(v: number) => money(v)}
                />
                <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar dataKey="despesa" name="Despesa" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Posts por etapa */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Posts por etapa</h3>
            <Link to="/app/posts" className="inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200">
              Ver posts <ArrowUpRight size={14} />
            </Link>
          </div>
          {postsByStage.length ? (
            <div className="flex items-center gap-2">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={postsByStage} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={2} stroke="none">
                      {postsByStage.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {postsByStage.map((e) => (
                  <div key={e.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/70">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                      {e.name}
                    </span>
                    <span className="font-medium text-white">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-white/40">Sem posts ainda.</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Tarefas */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Tarefas em aberto</h3>
            <Link to="/app/quadros" className="text-xs text-brand-300 hover:text-brand-200">Ver quadros</Link>
          </div>
          <div className="space-y-2">
            {openTasks.length ? (
              openTasks.map((t, i) => (
                <Link
                  key={i}
                  to={`/app/quadros/${t.boardId}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3 transition hover:border-brand-400/40"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                  <span className="min-w-0 flex-1 truncate text-sm text-white/85">{t.title}</span>
                  {t.client && <Badge>{t.client}</Badge>}
                  {t.due && <DueChip iso={t.due} />}
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-white/40">Nada em aberto. 🎉</p>
            )}
          </div>
        </div>

        {/* Próximos posts */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Próximos posts</h3>
            <Link to="/app/posts" className="text-xs text-brand-300 hover:text-brand-200">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {upcomingPosts.length ? (
              upcomingPosts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3">
                  <CalendarCheck size={16} className="shrink-0 text-brand-300" />
                  <span className="min-w-0 flex-1 truncate text-sm text-white/85">{p.title}</span>
                  <Badge color={STAGE_META[p.stage].color}>{STAGE_META[p.stage].label}</Badge>
                  {p.scheduledDate && <DueChip iso={p.scheduledDate} />}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-white/40">Nenhum post agendado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DueChip({ iso }: { iso: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const late = iso < today;
  const soon = iso === today;
  return (
    <span
      className={cn(
        'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium',
        late ? 'bg-red-500/15 text-red-300' : soon ? 'bg-amber-500/15 text-amber-300' : 'bg-white/5 text-white/50',
      )}
    >
      {new Date(iso + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
    </span>
  );
}
