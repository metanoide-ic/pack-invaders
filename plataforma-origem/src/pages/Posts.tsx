import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Plus, CheckSquare, GripVertical, MessageSquare, AlertTriangle, LayoutGrid, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Field, Input, Modal, Select, Badge } from '@/components/ui';
import { PostsCalendar } from '@/components/PostsCalendar';
import { useData } from '@/lib/dataStore';
import { useClientMap } from '@/lib/hooks';
import { STAGE_META, STAGE_ORDER, STAGE_FUNNEL, PLATFORMS, PLATFORM_COLOR } from '@/lib/labels';
import { onPostStageChange } from '@/lib/automations';
import { cn, todayISO } from '@/lib/utils';
import type { Post, PostPlatform, PostStage } from '@/lib/types';
import { PostModal } from '@/components/PostModal';

export default function Posts() {
  const { posts, clients, addPost, setPostStage } = useData();
  const clientMap = useClientMap();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<'pipeline' | 'calendario'>('pipeline');

  const [form, setForm] = useState({
    title: '', platform: 'Instagram' as PostPlatform, clientId: '',
    stage: 'ideia' as PostStage, scheduledDate: todayISO(),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const byStage = useMemo(() => {
    const m: Record<string, Post[]> = {};
    STAGE_ORDER.forEach((s) => (m[s] = []));
    posts.forEach((p) => (m[p.stage] ??= []).push(p));
    Object.values(m).forEach((arr) => arr.sort((a, b) => (a.scheduledDate || '9999').localeCompare(b.scheduledDate || '9999')));
    return m;
  }, [posts]);

  const activePost = activeId ? posts.find((p) => p.id === activeId) : null;

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const post = posts.find((p) => p.id === String(active.id));
    const toStage = String(over.id) as PostStage;
    if (!post || post.stage === toStage || !STAGE_ORDER.includes(toStage)) return;
    setPostStage(post.id, toStage);
    onPostStageChange(post.id, post.stage, toStage);
  }

  function create() {
    if (!form.title.trim()) return;
    addPost({
      title: form.title.trim(), platform: form.platform,
      clientId: form.clientId || undefined, stage: form.stage,
      scheduledDate: form.scheduledDate || undefined,
    });
    setForm({ ...form, title: '' });
    setCreating(false);
  }

  return (
    <div>
      <PageHeader
        title="Checklist de Posts"
        subtitle="Arraste entre as etapas. Ao chegar em Aprovação, a copy vai para o grupo."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line p-0.5">
              <button onClick={() => setView('pipeline')} className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition', view === 'pipeline' ? 'bg-brand-500/20 text-brand-100' : 'text-white/50 hover:text-white')}>
                <LayoutGrid size={15} /> Pipeline
              </button>
              <button onClick={() => setView('calendario')} className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition', view === 'calendario' ? 'bg-brand-500/20 text-brand-100' : 'text-white/50 hover:text-white')}>
                <CalendarDays size={15} /> Calendário
              </button>
            </div>
            <Button onClick={() => setCreating(true)}><Plus size={18} /> Novo post</Button>
          </div>
        }
      />

      {view === 'calendario' ? (
        <PostsCalendar posts={posts} onOpen={setOpenId} />
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <StageColumn key={stage} stage={stage} posts={byStage[stage] || []} onOpen={setOpenId} clientMap={clientMap} />
          ))}
        </div>
        <DragOverlay>{activePost ? <PostCard post={activePost} clientMap={clientMap} dragging /> : null}</DragOverlay>
      </DndContext>
      )}

      {openId && <PostModal postId={openId} onClose={() => setOpenId(null)} />}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo post"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button><Button onClick={create}>Criar post</Button></>}
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

function StageColumn({
  stage, posts, onOpen, clientMap,
}: {
  stage: PostStage;
  posts: Post[];
  onOpen: (id: string) => void;
  clientMap: ReturnType<typeof useClientMap>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const meta = STAGE_META[stage];
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
        <span className="text-sm font-semibold text-white/85">{meta.label}</span>
        <span className="rounded-full bg-white/10 px-2 text-xs text-white/50">{posts.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn('flex min-h-[120px] flex-1 flex-col gap-2 rounded-2xl border border-line/60 bg-ink-900/40 p-2 transition', isOver && 'border-brand-400/60 bg-brand-500/10')}
      >
        {posts.map((p) => (
          <DraggablePost key={p.id} post={p} onOpen={() => onOpen(p.id)} clientMap={clientMap} />
        ))}
        {posts.length === 0 && <div className="grid flex-1 place-items-center py-6 text-xs text-white/25">Solte aqui</div>}
      </div>
    </div>
  );
}

function DraggablePost({ post, onOpen, clientMap }: { post: Post; onOpen: () => void; clientMap: ReturnType<typeof useClientMap> }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: post.id });
  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <PostCard post={post} onOpen={onOpen} clientMap={clientMap} handleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function PostCard({
  post, onOpen, clientMap, handleProps, dragging,
}: {
  post: Post;
  onOpen?: () => void;
  clientMap: ReturnType<typeof useClientMap>;
  handleProps?: Record<string, unknown>;
  dragging?: boolean;
}) {
  const client = post.clientId ? clientMap[post.clientId] : undefined;
  const done = post.checklist.filter((c) => c.done).length;
  const pendRev = post.revisions.filter((r) => !r.resolved).length;
  const funnelIdx = STAGE_FUNNEL.indexOf(post.stage);
  const progress = funnelIdx >= 0 ? Math.round(((funnelIdx + 1) / STAGE_FUNNEL.length) * 100) : 50;
  const today = todayISO();
  const late = post.scheduledDate && post.scheduledDate < today && post.stage !== 'publicado';
  const dueToday = post.scheduledDate === today && post.stage !== 'publicado';

  return (
    <div className={cn('group rounded-xl border border-line bg-ink-850 p-3 transition hover:border-brand-400/40', dragging && 'rotate-2 border-brand-400/60 shadow-2xl')}>
      <div className="flex items-start gap-2">
        <button {...handleProps} className="mt-0.5 cursor-grab touch-none text-white/20 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing" aria-label="Arrastar">
          <GripVertical size={15} />
        </button>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ background: `${PLATFORM_COLOR[post.platform]}22`, color: PLATFORM_COLOR[post.platform] }}>
              {post.platform}
            </span>
            {(late || dueToday) && (
              <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium', late ? 'text-red-300' : 'text-amber-300')}>
                <AlertTriangle size={11} /> {late ? 'atrasado' : 'hoje'}
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-white/90">{post.title}</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: STAGE_META[post.stage].color }} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
            {client && <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: client.color }} />{client.name}</span>}
            {post.checklist.length > 0 && <span className="inline-flex items-center gap-1"><CheckSquare size={11} /> {done}/{post.checklist.length}</span>}
            {pendRev > 0 && <span className="inline-flex items-center gap-1 text-rose-300"><MessageSquare size={11} /> {pendRev}</span>}
            {post.sentForApproval && post.stage === 'aprovacao' && <Badge color="#ec4899">no grupo</Badge>}
            {post.scheduledDate && <span className="ml-auto">{new Date(post.scheduledDate + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>}
          </div>
        </button>
      </div>
    </div>
  );
}
