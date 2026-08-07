import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, CheckSquare, MessageSquare, AlertTriangle, LayoutGrid, CalendarDays, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Badge, Avatar } from '@/components/ui';
import { PostsCalendar } from '@/components/PostsCalendar';
import { useData } from '@/lib/dataStore';
import { useAuth } from '@/lib/authStore';
import { useClientMap } from '@/lib/hooks';
import { STAGE_META, STAGE_ORDER, STAGE_FUNNEL, PLATFORM_COLOR } from '@/lib/labels';
import { onPostStageChange } from '@/lib/automations';
import { cn, todayISO } from '@/lib/utils';
import type { Post, PostStage } from '@/lib/types';
import { PostModal } from '@/components/PostModal';

export default function Posts() {
  const { posts, movePost } = useData();
  const clientMap = useClientMap();
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<'pipeline' | 'calendario'>('pipeline');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStage = useMemo(() => {
    const m: Record<string, Post[]> = {};
    STAGE_ORDER.forEach((s) => (m[s] = []));
    posts.forEach((p) => (m[p.stage] ??= []).push(p));
    return m;
  }, [posts]);

  const activePost = activeId ? posts.find((p) => p.id === activeId) : null;

  function stageOf(id: string): PostStage | undefined {
    if ((STAGE_ORDER as string[]).includes(id)) return id as PostStage;
    return posts.find((p) => p.id === id)?.stage;
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const post = posts.find((p) => p.id === String(active.id));
    const toStage = stageOf(String(over.id));
    if (!post || !toStage) return;

    const targetIds = (byStage[toStage] || []).filter((p) => p.id !== post.id).map((p) => p.id);
    let index = targetIds.indexOf(String(over.id));
    if (index === -1) index = targetIds.length;
    movePost(post.id, toStage, index);
    if (post.stage !== toStage) onPostStageChange(post.id, post.stage, toStage);
  }

  return (
    <div>
      <PageHeader
        title="Posts"
        subtitle="Arraste os cartões entre as listas. Ao chegar em Aprovação, a copy vai para o grupo."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line p-0.5">
              <button onClick={() => setView('pipeline')} className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition', view === 'pipeline' ? 'bg-brand-500/20 text-brand-100' : 'text-white/50 hover:text-white')}>
                <LayoutGrid size={15} /> Quadro
              </button>
              <button onClick={() => setView('calendario')} className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition', view === 'calendario' ? 'bg-brand-500/20 text-brand-100' : 'text-white/50 hover:text-white')}>
                <CalendarDays size={15} /> Calendário
              </button>
            </div>
          </div>
        }
      />

      {view === 'calendario' ? (
        <PostsCalendar posts={posts} onOpen={setOpenId} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))} onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGE_ORDER.map((stage) => (
              <StageList key={stage} stage={stage} posts={byStage[stage] || []} onOpen={setOpenId} clientMap={clientMap} />
            ))}
          </div>
          <DragOverlay>{activePost ? <PostCard post={activePost} clientMap={clientMap} dragging /> : null}</DragOverlay>
        </DndContext>
      )}

      {openId && <PostModal postId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
// (Criação agora é feita direto em cada lista, no estilo Trello.)

function StageList({
  stage, posts, onOpen, clientMap,
}: {
  stage: PostStage;
  posts: Post[];
  onOpen: (id: string) => void;
  clientMap: ReturnType<typeof useClientMap>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const addPost = useData((s) => s.addPost);
  const meta = STAGE_META[stage];
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  function add() {
    if (!title.trim()) return;
    addPost({ title: title.trim(), platform: 'Instagram', stage, scheduledDate: todayISO() });
    setTitle('');
  }

  return (
    <div className="flex w-[300px] shrink-0 flex-col rounded-xl border border-line bg-ink-900/60">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
        <span className="text-sm font-semibold text-white/90">{meta.label}</span>
        <span className="rounded-full bg-white/10 px-2 text-xs text-white/50">{posts.length}</span>
      </div>

      <div ref={setNodeRef} className={cn('flex-1 space-y-2 px-2 transition', isOver && 'bg-brand-500/[0.06]')}>
        <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {posts.map((p) => <SortablePost key={p.id} post={p} onOpen={() => onOpen(p.id)} clientMap={clientMap} />)}
        </SortableContext>
        {posts.length === 0 && !adding && <div className="grid h-16 place-items-center rounded-lg text-xs text-white/25">Solte um cartão aqui</div>}
      </div>

      <div className="p-2">
        {adding ? (
          <div className="rounded-lg border border-line bg-ink-850 p-2">
            <textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do cartão…" autoFocus rows={2}
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); add(); }
                if (e.key === 'Escape') setAdding(false);
              }} />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={add}>Adicionar cartão</Button>
              <button onClick={() => { setAdding(false); setTitle(''); }} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"><X size={16} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-white/45 transition hover:bg-white/5 hover:text-white">
            <Plus size={15} /> Adicionar cartão
          </button>
        )}
      </div>
    </div>
  );
}

function SortablePost({ post, onOpen, clientMap }: { post: Post; onOpen: () => void; clientMap: ReturnType<typeof useClientMap> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onOpen}>
      <PostCard post={post} clientMap={clientMap} />
    </div>
  );
}

function PostCard({ post, clientMap, dragging }: { post: Post; clientMap: ReturnType<typeof useClientMap>; dragging?: boolean }) {
  const client = post.clientId ? clientMap[post.clientId] : undefined;
  const assignee = useAuth((s) => (post.assigneeId ? s.accounts.find((a) => a.id === post.assigneeId) : undefined));
  const done = post.checklist.filter((c) => c.done).length;
  const pendRev = post.revisions.filter((r) => !r.resolved).length;
  const funnelIdx = STAGE_FUNNEL.indexOf(post.stage);
  const progress = funnelIdx >= 0 ? Math.round(((funnelIdx + 1) / STAGE_FUNNEL.length) * 100) : 50;
  const today = todayISO();
  const late = post.scheduledDate && post.scheduledDate < today && post.stage !== 'publicado';
  const dueToday = post.scheduledDate === today && post.stage !== 'publicado';

  return (
    <div className={cn(
      'cursor-pointer touch-none select-none rounded-lg border border-line bg-ink-850 p-2.5 shadow-sm transition hover:border-white/20',
      dragging && 'rotate-2 border-brand-400/60 shadow-xl',
    )}>
      {/* barra de etiqueta estilo Trello */}
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-1.5 w-9 rounded-full" style={{ background: PLATFORM_COLOR[post.platform] }} title={post.platform} />
        {(late || dueToday) && (
          <span className={cn('inline-flex items-center gap-1 rounded px-1 text-[10px] font-medium', late ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-300')}>
            <AlertTriangle size={10} /> {late ? 'atrasado' : 'hoje'}
          </span>
        )}
      </div>
      <p className="text-sm leading-snug text-white/90">{post.title}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: STAGE_META[post.stage].color }} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/45">
        <span className="text-white/40">{post.platform}</span>
        {post.checklist.length > 0 && <span className="inline-flex items-center gap-1"><CheckSquare size={11} /> {done}/{post.checklist.length}</span>}
        {pendRev > 0 && <span className="inline-flex items-center gap-1 text-rose-300"><MessageSquare size={11} /> {pendRev}</span>}
        {post.sentForApproval && post.stage === 'aprovacao' && <Badge color="#ec4899">no grupo</Badge>}
        <span className="ml-auto flex items-center gap-2">
          {client && <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: client.color }} />{client.name}</span>}
          {post.scheduledDate && <span>{new Date(post.scheduledDate + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>}
          {assignee && <Avatar name={assignee.name} color={assignee.color} size={18} />}
        </span>
      </div>
    </div>
  );
}
