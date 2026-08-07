import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trash2, Pencil, CalendarRange, Sparkles, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Field, Input, Textarea, Modal, EmptyState, Badge } from '@/components/ui';
import { useData } from '@/lib/dataStore';
import { useAuth } from '@/lib/authStore';
import { generateMonthlyPlan } from '@/lib/planner';
import { AVATAR_COLORS, money, initials, cn } from '@/lib/utils';
import type { Client, WeeklyPlan } from '@/lib/types';

const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const blank = {
  name: '', contact: '', monthlyFee: '', color: AVATAR_COLORS[0],
  briefing: '', city: '', whatsappGroup: '',
  weekly: { 0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' } as Record<number, string>,
};

function toWeeklyPlan(w: Record<number, string>): WeeklyPlan {
  const plan: WeeklyPlan = {};
  for (let d = 0; d < 7; d++) {
    const items = (w[d] || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (items.length) plan[d] = items;
  }
  return plan;
}
function fromWeeklyPlan(p?: WeeklyPlan): Record<number, string> {
  const w: Record<number, string> = { 0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' };
  if (p) for (const d of Object.keys(p)) w[Number(d)] = p[Number(d)].join(', ');
  return w;
}

export default function Clients() {
  const { clients, transactions, posts, boards, videos, addClient, updateClient, removeClient } = useData();
  const canFinance = !!useAuth((s) => s.current()?.canFinance);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(blank);
  const [planMsg, setPlanMsg] = useState('');
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const m: Record<string, { receita: number; posts: number; tarefas: number; videos: number }> = {};
    clients.forEach((c) => (m[c.id] = { receita: 0, posts: 0, tarefas: 0, videos: 0 }));
    transactions.forEach((t) => { if (t.clientId && m[t.clientId] && t.type === 'receita') m[t.clientId].receita += t.amount; });
    posts.forEach((p) => p.clientId && m[p.clientId] && m[p.clientId].posts++);
    boards.forEach((b) => Object.values(b.cards).forEach((c) => c.clientId && m[c.clientId] && m[c.clientId].tarefas++));
    videos.forEach((v) => v.clientId && m[v.clientId] && m[v.clientId].videos++);
    return m;
  }, [clients, transactions, posts, boards, videos]);

  function openNew() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name, contact: c.contact ?? '', monthlyFee: c.monthlyFee?.toString() ?? '', color: c.color,
      briefing: c.briefing ?? '', city: c.city ?? '', whatsappGroup: c.whatsappGroup ?? '',
      weekly: fromWeeklyPlan(c.weeklyPlan),
    });
    setOpen(true);
  }
  function save() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(), contact: form.contact.trim() || undefined,
      monthlyFee: form.monthlyFee ? parseFloat(form.monthlyFee.replace(',', '.')) : undefined,
      color: form.color, briefing: form.briefing.trim() || undefined, city: form.city.trim() || undefined,
      whatsappGroup: form.whatsappGroup.trim() || undefined, weeklyPlan: toWeeklyPlan(form.weekly),
    };
    if (editing) updateClient(editing.id, payload);
    else addClient(payload);
    setOpen(false);
  }

  function gerarPlano() {
    const now = new Date();
    const res = generateMonthlyPlan(now.getFullYear(), now.getMonth());
    setPlanMsg(res.created
      ? `Planejamento gerado: ${res.created} posts para ${res.clients} cliente(s). Datas: ${res.holidays.join(', ') || '—'}.`
      : 'Nenhum post gerado. Defina a cadência semanal em pelo menos um cliente.');
    setTimeout(() => setPlanMsg(''), 8000);
  }

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Contas, briefings e cadência de conteúdo."
        action={
          <>
            <Button variant="outline" onClick={gerarPlano}><CalendarRange size={18} /> Gerar planejamento do mês</Button>
            <Button onClick={openNew}><Plus size={18} /> Novo cliente</Button>
          </>
        } />

      {planMsg && <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-100"><Sparkles size={16} /> {planMsg}</div>}

      {clients.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="Nenhum cliente cadastrado"
          description="Cadastre clientes com briefing e cadência para a IA planejar o mês."
          action={<Button onClick={openNew}><Plus size={18} /> Cadastrar cliente</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => {
            const m = metrics[c.id];
            const dias = c.weeklyPlan ? Object.keys(c.weeklyPlan).length : 0;
            return (
              <div key={c.id} onClick={() => navigate(`/app/clientes/${c.id}`)} className="card group cursor-pointer p-5 transition hover:border-brand-400/40">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-semibold text-white" style={{ background: c.color }}>{initials(c.name)}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{c.name}</h3>
                    {c.contact && <p className="truncate text-sm text-white/45">{c.contact}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"><Pencil size={15} /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeClient(c.id); }} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15} /></button>
                  </div>
                </div>
                {c.briefing && <p className="mt-3 line-clamp-2 text-xs text-white/50">{c.briefing}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dias > 0 && <Badge color="#7c5cff"><CalendarRange size={11} /> {dias}x/semana</Badge>}
                  {c.whatsappGroup && <Badge color="#25D366"><MessageCircle size={11} /> grupo</Badge>}
                  {c.city && <Badge>{c.city}</Badge>}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {canFinance
                    ? <Metric label="Receita" value={money(m?.receita ?? 0)} />
                    : <Metric label="Vídeos" value={String(m?.videos ?? 0)} />}
                  <Metric label="Posts" value={String(m?.posts ?? 0)} />
                  <Metric label="Tarefas" value={String(m?.tarefas ?? 0)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'} wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save}>{editing ? 'Salvar' : 'Cadastrar'}</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do cliente"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Studio Aurora" autoFocus /></Field>
            <Field label="Cidade" hint="Para datas comemorativas locais."><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ex.: Volta Redonda" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contato"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="@perfil ou e-mail" /></Field>
            <Field label="Fee mensal"><Input value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} placeholder="0,00" inputMode="decimal" /></Field>
          </div>
          <Field label="Grupo de WhatsApp"><Input value={form.whatsappGroup} onChange={(e) => setForm({ ...form, whatsappGroup: e.target.value })} placeholder="ID ou nome do grupo do cliente" /></Field>
          <Field label="Briefing (contexto para a IA)" hint="O que é o cliente, público, tom, produtos, diferenciais…">
            <Textarea value={form.briefing} onChange={(e) => setForm({ ...form, briefing: e.target.value })} className="min-h-[90px]" placeholder="Ex.: Ótica premium em Volta Redonda, público 30-55, foco em óculos de grife e exames…" />
          </Field>
          <div>
            <div className="mb-1.5 text-xs font-medium text-white/60">Cadência semanal <span className="text-white/35">(o que entra em cada dia — separe por vírgula)</span></div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {WD.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-9 shrink-0 text-xs font-medium text-white/50">{d}</span>
                  <Input value={form.weekly[i]} onChange={(e) => setForm({ ...form, weekly: { ...form.weekly, [i]: e.target.value } })} placeholder={i === 1 ? 'Vídeo' : i === 3 || i === 5 ? 'Post' : '—'} className="h-9" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium text-white/60">Cor</div>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((col) => (
                <button key={col} onClick={() => setForm({ ...form, color: col })}
                  className={cn('h-8 w-8 rounded-full transition', form.color === col && 'ring-2 ring-white ring-offset-2 ring-offset-ink-850')} style={{ background: col }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-2 py-2.5">
      <div className="text-sm font-semibold text-white">{value}</div>
      <div className="text-[11px] text-white/40">{label}</div>
    </div>
  );
}
