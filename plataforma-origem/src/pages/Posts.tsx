import { useMemo, useState } from 'react';
import { Plus, CalendarCheck, Instagram, CheckSquare } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Field, Input, Modal, Select, Badge, EmptyState } from '@/components/ui';
import { useData } from '@/lib/dataStore';
import { useClientMap } from '@/lib/hooks';
import { STAGE_META, STAGE_ORDER, PLATFORMS, PLATFORM_COLOR } from '@/lib/labels';
import { cn, todayISO } from '@/lib/utils';
import type { PostPlatform, PostStage } from '@/lib/types';
import { PostModal } from '@/components/PostModal';

export default function Posts() {
  const { posts, clients, addPost } = useData();
  const clientMap = useClientMap();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [stageFilter, setStageFilter] = useState<'todos' | PostStage>('todos');

  const [form, setForm] = useState({
    title: '',
    platform: 'Instagram' as PostPlatform,
    clientId: '',
    stage: 'ideia' as PostStage,
    scheduledDate: todayISO(),
  });

  const filtered = useMemo(
    () =>
      posts
        .filter((p) => stageFilter === 'todos' || p.stage === stageFilter)
        .sort((a, b) => (a.scheduledDate || '9999').localeCompare(b.scheduledDate || '9999')),
    [posts, stageFilter],
  );

  function create() {
    if (!form.title.trim()) return;
    addPost({
      title: form.title.trim(),
      platform: form.platform,
      clientId: form.clientId || undefined,
      stage: form.stage,
      scheduledDate: form.scheduledDate || undefined,
    });
    setForm({ ...form, title: '' });
    setCreating(false);
  }

  return (
    <div>
      <PageHeader
        title="Checklist de Posts"
        subtitle="Acompanhe cada publicação da ideia à veiculação."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus size={18} /> Novo post
          </Button>
        }
      />

      {/* Filtros por etapa */}
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip active={stageFilter === 'todos'} onClick={() => setStageFilter('todos')} label="Todos" count={posts.length} />
        {STAGE_ORDER.map((s) => {
          const count = posts.filter((p) => p.stage === s).length;
          return (
            <FilterChip
              key={s}
              active={stageFilter === s}
              onClick={() => setStageFilter(s)}
              label={STAGE_META[s].label}
              count={count}
              color={STAGE_META[s].color}
            />
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={40} />}
          title="Nenhum post por aqui"
          description="Crie um post e acompanhe cada etapa até a publicação."
          action={<Button onClick={() => setCreating(true)}><Plus size={18} /> Criar post</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const client = p.clientId ? clientMap[p.clientId] : undefined;
            const done = p.checklist.filter((c) => c.done).length;
            const stageIdx = STAGE_ORDER.indexOf(p.stage);
            const progress = Math.round(((stageIdx + 1) / STAGE_ORDER.length) * 100);
            return (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className="card group p-5 text-left transition hover:border-brand-400/50"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium"
                    style={{ background: `${PLATFORM_COLOR[p.platform]}22`, color: PLATFORM_COLOR[p.platform] }}
                  >
                    <Instagram size={13} /> {p.platform}
                  </span>
                  <Badge color={STAGE_META[p.stage].color}>{STAGE_META[p.stage].label}</Badge>
                </div>
                <h3 className="mt-3 line-clamp-2 font-medium text-white">{p.title}</h3>

                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, background: STAGE_META[p.stage].color }} />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-white/45">
                  <span className="flex items-center gap-2">
                    {client && (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: client.color }} /> {client.name}
                      </span>
                    )}
                    {p.checklist.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <CheckSquare size={12} /> {done}/{p.checklist.length}
                      </span>
                    )}
                  </span>
                  {p.scheduledDate && (
                    <span>{new Date(p.scheduledDate + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {openId && <PostModal postId={openId} onClose={() => setOpenId(null)} />}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo post"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button onClick={create}>Criar post</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Título / tema">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Carrossel — dicas de verão" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Plataforma">
              <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as PostPlatform })}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Etapa">
              <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as PostStage })}>
                {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente">
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">—</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Data prevista">
              <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition',
        active ? 'text-white' : 'text-white/50 hover:bg-white/5',
      )}
      style={active ? { background: `${color ?? '#7c3aed'}26`, color: color ?? '#c9b4ff' } : undefined}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {label}
      <span className="rounded-full bg-white/10 px-1.5 text-xs text-white/60">{count}</span>
    </button>
  );
}
