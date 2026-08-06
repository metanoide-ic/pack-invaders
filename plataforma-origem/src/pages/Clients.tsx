import { useMemo, useState } from 'react';
import { Plus, Users, Trash2, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Field, Input, Modal, EmptyState } from '@/components/ui';
import { useData } from '@/lib/dataStore';
import { AVATAR_COLORS, money, initials, cn } from '@/lib/utils';
import type { Client } from '@/lib/types';

const blank = { name: '', contact: '', monthlyFee: '', color: AVATAR_COLORS[0] };

export default function Clients() {
  const { clients, transactions, posts, boards, addClient, updateClient, removeClient } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(blank);

  const metrics = useMemo(() => {
    const m: Record<string, { receita: number; posts: number; tarefas: number }> = {};
    clients.forEach((c) => (m[c.id] = { receita: 0, posts: 0, tarefas: 0 }));
    transactions.forEach((t) => {
      if (t.clientId && m[t.clientId] && t.type === 'receita') m[t.clientId].receita += t.amount;
    });
    posts.forEach((p) => p.clientId && m[p.clientId] && m[p.clientId].posts++);
    boards.forEach((b) =>
      Object.values(b.cards).forEach((c) => c.clientId && m[c.clientId] && m[c.clientId].tarefas++),
    );
    return m;
  }, [clients, transactions, posts, boards]);

  function openNew() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({ name: c.name, contact: c.contact ?? '', monthlyFee: c.monthlyFee?.toString() ?? '', color: c.color });
    setOpen(true);
  }
  function save() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim() || undefined,
      monthlyFee: form.monthlyFee ? parseFloat(form.monthlyFee.replace(',', '.')) : undefined,
      color: form.color,
    };
    if (editing) updateClient(editing.id, payload);
    else addClient(payload);
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="As contas atendidas pela agência."
        action={<Button onClick={openNew}><Plus size={18} /> Novo cliente</Button>}
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title="Nenhum cliente cadastrado"
          description="Cadastre seus clientes para vincular tarefas, posts e finanças."
          action={<Button onClick={openNew}><Plus size={18} /> Cadastrar cliente</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => {
            const m = metrics[c.id];
            return (
              <div key={c.id} className="card group p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-semibold text-white"
                    style={{ background: c.color }}
                  >
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{c.name}</h3>
                    {c.contact && <p className="truncate text-sm text-white/45">{c.contact}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => openEdit(c)} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => removeClient(c.id)} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Metric label="Receita" value={money(m?.receita ?? 0)} />
                  <Metric label="Posts" value={String(m?.posts ?? 0)} />
                  <Metric label="Tarefas" value={String(m?.tarefas ?? 0)} />
                </div>
                {c.monthlyFee ? (
                  <div className="mt-3 rounded-xl bg-white/[0.03] px-3 py-2 text-center text-sm text-white/60">
                    Fee mensal · <span className="font-semibold text-white">{money(c.monthlyFee)}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nome do cliente">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Studio Aurora" autoFocus />
          </Field>
          <Field label="Contato (opcional)">
            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="@perfil ou e-mail" />
          </Field>
          <Field label="Fee mensal (opcional)">
            <Input value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} placeholder="0,00" inputMode="decimal" />
          </Field>
          <div>
            <div className="mb-1.5 text-xs font-medium text-white/60">Cor</div>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => setForm({ ...form, color: col })}
                  className={cn('h-8 w-8 rounded-full transition', form.color === col && 'ring-2 ring-white ring-offset-2 ring-offset-ink-850')}
                  style={{ background: col }}
                />
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
