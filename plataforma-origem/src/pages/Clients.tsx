import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trash2, Pencil, CalendarRange, MessageCircle, Instagram, AtSign } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Field, Input, Textarea, Modal, Select, EmptyState } from '@/components/ui';
import { PlanModal } from '@/components/PlanModal';
import { useData } from '@/lib/dataStore';
import { useAuth } from '@/lib/authStore';
import { AVATAR_COLORS, money, initials, cn } from '@/lib/utils';
import type { BillingMethod, Client, WeeklyPlan } from '@/lib/types';

const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CONTENT_TYPES = ['Post', 'Carrossel', 'Stories', 'Vídeo', 'Reels'];

const blank = {
  name: '', contact: '', instagram: '', monthlyFee: '', color: AVATAR_COLORS[0],
  briefing: '', city: '', whatsappGroup: '',
  billingWhatsapp: '', billingMethod: 'pix' as BillingMethod, billingDay: '5', document: '',
  weekly: {} as WeeklyPlan,
};

export default function Clients() {
  const { clients, addClient, updateClient, removeClient } = useData();
  const canFinance = !!useAuth((s) => s.current()?.canFinance);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [planFor, setPlanFor] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [form, setForm] = useState(blank);

  function openNew() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name, contact: c.contact ?? '', instagram: c.instagram ?? '',
      monthlyFee: c.monthlyFee?.toString() ?? '', color: c.color,
      briefing: c.briefing ?? '', city: c.city ?? '', whatsappGroup: c.whatsappGroup ?? '',
      billingWhatsapp: c.billingWhatsapp ?? '', billingMethod: c.billingMethod ?? 'pix',
      billingDay: (c.billingDay ?? 5).toString(), document: c.document ?? '',
      weekly: { ...(c.weeklyPlan ?? {}) },
    });
    setOpen(true);
  }
  function toggleType(day: number, type: string) {
    setForm((f) => {
      const current = f.weekly[day] ?? [];
      const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
      const weekly = { ...f.weekly };
      if (next.length) weekly[day] = next; else delete weekly[day];
      return { ...f, weekly };
    });
  }
  function save() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim() || undefined,
      instagram: form.instagram.trim().replace(/^@/, '') || undefined,
      monthlyFee: form.monthlyFee ? parseFloat(form.monthlyFee.replace(',', '.')) : undefined,
      color: form.color,
      briefing: form.briefing.trim() || undefined,
      city: form.city.trim() || undefined,
      whatsappGroup: form.whatsappGroup.trim() || undefined,
      billingWhatsapp: form.billingWhatsapp.trim() || undefined,
      billingMethod: form.billingMethod,
      billingDay: Math.min(Math.max(parseInt(form.billingDay, 10) || 5, 1), 28),
      document: form.document.trim() || undefined,
      weeklyPlan: form.weekly,
    };
    if (editing) updateClient(editing.id, payload);
    else addClient(payload);
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Cada cliente com briefing, cadência da semana, grupo e Instagram."
        action={<Button onClick={openNew}><Plus size={18} /> Adicionar cliente</Button>}
      />

      {clients.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="Nenhum cliente cadastrado"
          description="Adicione o primeiro cliente com briefing e dias de publicação para gerar planejamentos."
          action={<Button onClick={openNew}><Plus size={18} /> Adicionar cliente</Button>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Cadência da semana</th>
                <th className="px-4 py-3 font-medium">Grupo</th>
                {canFinance && <th className="px-4 py-3 font-medium">Fee</th>}
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((c) => {
                const days = Object.entries(c.weeklyPlan ?? {}).sort((a, b) => Number(a[0]) - Number(b[0]));
                return (
                  <tr key={c.id} className="group cursor-pointer transition hover:bg-white/[0.03]" onClick={() => navigate(`/app/clientes/${c.id}`)}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white" style={{ background: c.color }}>{initials(c.name)}</span>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-white">{c.name}</div>
                          <div className="flex items-center gap-2 text-xs text-white/45">
                            {c.instagram && <span className="inline-flex items-center gap-0.5"><AtSign size={11} />{c.instagram}</span>}
                            {c.city && <span>{c.city}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {days.length ? (
                        <div className="flex flex-wrap gap-1">
                          {days.map(([d, types]) => (
                            <span key={d} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[11px] text-white/70">
                              <b className="text-brand-300">{WD[Number(d)]}</b> {types.join(' · ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-white/30">Sem cadência</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {c.whatsappGroup
                        ? <span className="inline-flex items-center gap-1.5 text-xs text-white/70"><MessageCircle size={13} className="text-emerald-400" />{c.whatsappGroup}</span>
                        : <span className="text-xs text-white/30">Sem grupo</span>}
                    </td>
                    {canFinance && (
                      <td className="px-4 py-3.5 text-xs">
                        <span className="text-white/70">{c.monthlyFee ? money(c.monthlyFee) : '—'}</span>
                        {c.monthlyFee && (
                          <span className="block text-[11px] text-white/35">
                            {{ pix: 'Pix', boleto: 'Boleto', nf: 'Nota fiscal' }[c.billingMethod ?? 'pix']} · dia {c.billingDay ?? 5}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="soft" onClick={() => setPlanFor(c)}>
                          <CalendarRange size={14} /> Gerar planejamento
                        </Button>
                        <button onClick={() => openEdit(c)} className="grid h-8 w-8 place-items-center rounded-lg text-white/45 transition hover:bg-white/5 hover:text-white"><Pencil size={15} /></button>
                        <button onClick={() => setConfirmDelete(c)} className="grid h-8 w-8 place-items-center rounded-lg text-white/45 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cadastro / edição */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cliente' : 'Adicionar cliente'} wide
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save}>{editing ? 'Salvar' : 'Adicionar'}</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do cliente"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Ótica Vista Clara" autoFocus /></Field>
            <Field label="Cidade"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ex.: Volta Redonda" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Instagram">
              <div className="relative">
                <Instagram size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="perfil" className="pl-9" />
              </div>
            </Field>
            <Field label="Grupo de WhatsApp"><Input value={form.whatsappGroup} onChange={(e) => setForm({ ...form, whatsappGroup: e.target.value })} placeholder="Nome ou ID do grupo" /></Field>
            <Field label={canFinance ? 'Fee mensal' : 'Contato'}>
              {canFinance
                ? <Input value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} placeholder="0,00" inputMode="decimal" />
                : <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="E-mail ou telefone" />}
            </Field>
          </div>
          {canFinance && (
            <>
              <Field label="Contato"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="E-mail ou telefone" /></Field>
              <div className="rounded-xl border border-line bg-white/[0.02] p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wide text-white/45">Cobrança</div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="WhatsApp de cobrança" hint="Número de quem paga.">
                    <Input value={form.billingWhatsapp} onChange={(e) => setForm({ ...form, billingWhatsapp: e.target.value })} placeholder="55249..." inputMode="tel" />
                  </Field>
                  <Field label="Forma de pagamento">
                    <Select value={form.billingMethod} onChange={(e) => setForm({ ...form, billingMethod: e.target.value as BillingMethod })}>
                      <option value="pix">Pix</option>
                      <option value="boleto">Boleto</option>
                      <option value="nf">Nota fiscal</option>
                    </Select>
                  </Field>
                  <Field label="Dia do vencimento">
                    <Input value={form.billingDay} onChange={(e) => setForm({ ...form, billingDay: e.target.value })} placeholder="5" inputMode="numeric" />
                  </Field>
                  <Field label="CPF ou CNPJ" hint="Necessário para o gateway emitir Pix e boleto.">
                    <Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} placeholder="00.000.000/0001-00" inputMode="numeric" />
                  </Field>
                </div>
              </div>
            </>
          )}
          <Field label="Geral do cliente" hint="O que a empresa é, o que precisa ser feito, estilo e tom. A IA usa isso para gerar temas e copies.">
            <Textarea value={form.briefing} onChange={(e) => setForm({ ...form, briefing: e.target.value })} className="min-h-[96px]"
              placeholder="Ex.: Ótica com foco em óculos de grife e exames de vista. Público 30 a 55 anos. Tom elegante e acessível, sem gíria. Destacar atendimento personalizado." />
          </Field>

          <div>
            <div className="mb-2 text-xs font-medium text-white/60">Dias de publicação <span className="text-white/35">(clique para marcar o que sai em cada dia)</span></div>
            <div className="space-y-1.5">
              {WD.map((label, day) => (
                <div key={day} className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2">
                  <span className={cn('w-9 shrink-0 text-xs font-semibold', (form.weekly[day]?.length ?? 0) > 0 ? 'text-brand-300' : 'text-white/40')}>{label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CONTENT_TYPES.map((type) => {
                      const active = form.weekly[day]?.includes(type);
                      return (
                        <button key={type} type="button" onClick={() => toggleType(day, type)}
                          className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition',
                            active ? 'bg-brand-500/25 text-brand-100 ring-1 ring-brand-400/50' : 'bg-white/[0.04] text-white/45 hover:bg-white/10 hover:text-white')}>
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-white/60">Cor</div>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((col) => (
                <button key={col} type="button" onClick={() => setForm({ ...form, color: col })}
                  className={cn('h-8 w-8 rounded-full transition', form.color === col && 'ring-2 ring-white ring-offset-2 ring-offset-ink-850')} style={{ background: col }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmação de exclusão */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remover cliente?"
        footer={<><Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => { if (confirmDelete) removeClient(confirmDelete.id); setConfirmDelete(null); }}>Remover</Button></>}>
        <p className="text-sm text-white/60">
          {confirmDelete?.name} será removido da lista. Posts, tarefas e lançamentos já criados continuam existindo, sem o vínculo.
        </p>
      </Modal>

      {planFor && <PlanModal client={planFor} onClose={() => setPlanFor(null)} />}
    </div>
  );
}
