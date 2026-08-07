import { useMemo, useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, pointerWithin,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { Plus, CheckSquare, MessageSquare, Link2, Clapperboard } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { useData } from '@/lib/dataStore';
import { useAuth } from '@/lib/authStore';
import { useClientMap } from '@/lib/hooks';
import { VIDEO_STAGE_META, VIDEO_STAGE_ORDER } from '@/lib/labels';
import { cn, todayISO } from '@/lib/utils';
import type { VideoProject, VideoStage } from '@/lib/types';
import { VideoModal } from '@/components/VideoModal';

export default function Videos() {
  const { videos, clients, addVideo, moveVideo } = useData();
  const clientMap = useClientMap();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', clientId: '', editor: '', dueDate: '' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const byStage = useMemo(() => {
    const m: Record<string, VideoProject[]> = {};
    VIDEO_STAGE_ORDER.forEach((s) => (m[s] = []));
    videos.forEach((v) => (m[v.stage] ??= []).push(v));
    return m;
  }, [videos]);

  const activeVideo = activeId ? videos.find((v) => v.id === activeId) : null;

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const v = videos.find((x) => x.id === String(active.id));
    const toStage = String(over.id) as VideoStage;
    if (v && VIDEO_STAGE_ORDER.includes(toStage) && v.stage !== toStage) moveVideo(v.id, toStage);
  }

  function create() {
    if (!form.title.trim()) return;
    addVideo({ title: form.title.trim(), clientId: form.clientId || undefined, editor: form.editor || undefined, dueDate: form.dueDate || undefined });
    setForm({ title: '', clientId: '', editor: '', dueDate: '' });
    setCreating(false);
  }

  return (
    <div>
      <PageHeader
        title="Edição de Vídeo"
        subtitle="Do briefing à entrega. Arraste os projetos entre as etapas."
        action={<Button onClick={() => setCreating(true)}><Plus size={18} /> Novo vídeo</Button>}
      />

      <DndContext sensors={sensors} collisionDetection={pointerWithin}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {VIDEO_STAGE_ORDER.map((stage) => (
            <VideoColumn key={stage} stage={stage} videos={byStage[stage] || []} onOpen={setOpenId} clientMap={clientMap} />
          ))}
        </div>
        <DragOverlay>{activeVideo ? <VideoCard video={activeVideo} clientMap={clientMap} dragging /> : null}</DragOverlay>
      </DndContext>

      {openId && <VideoModal videoId={openId} onClose={() => setOpenId(null)} />}

      <Modal open={creating} onClose={() => setCreating(false)} title="Novo vídeo"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button><Button onClick={create}>Criar</Button></>}>
        <div className="space-y-4">
          <Field label="Título do vídeo">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: VSL — Cliente X" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente">
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">—</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Editor(a)">
              <Input value={form.editor} onChange={(e) => setForm({ ...form, editor: e.target.value })} placeholder="Ex.: Bruno" />
            </Field>
          </div>
          <Field label="Prazo">
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function VideoColumn({ stage, videos, onOpen, clientMap }: {
  stage: VideoStage; videos: VideoProject[]; onOpen: (id: string) => void; clientMap: ReturnType<typeof useClientMap>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const meta = VIDEO_STAGE_META[stage];
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
        <span className="text-sm font-semibold text-white/85">{meta.label}</span>
        <span className="rounded-full bg-white/10 px-2 text-xs text-white/50">{videos.length}</span>
      </div>
      <div ref={setNodeRef} className={cn('flex min-h-[120px] flex-1 flex-col gap-2 rounded-2xl border border-line/60 bg-ink-900/40 p-2 transition', isOver && 'border-brand-400/60 bg-brand-500/10')}>
        {videos.map((v) => <DraggableVideo key={v.id} video={v} onOpen={() => onOpen(v.id)} clientMap={clientMap} />)}
        {videos.length === 0 && <div className="grid flex-1 place-items-center py-6 text-xs text-white/25">Solte aqui</div>}
      </div>
    </div>
  );
}

function DraggableVideo({ video, onOpen, clientMap }: { video: VideoProject; onOpen: () => void; clientMap: ReturnType<typeof useClientMap> }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: video.id });
  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...attributes} {...listeners} onClick={onOpen}>
      <VideoCard video={video} clientMap={clientMap} />
    </div>
  );
}

function VideoCard({ video, clientMap, dragging }: {
  video: VideoProject; clientMap: ReturnType<typeof useClientMap>; dragging?: boolean;
}) {
  const client = video.clientId ? clientMap[video.clientId] : undefined;
  const assignee = useAuth((s) => (video.assigneeId ? s.accounts.find((a) => a.id === video.assigneeId) : undefined));
  const done = video.checklist.filter((c) => c.done).length;
  const pendRev = video.revisions.filter((r) => !r.resolved).length;
  const late = video.dueDate && video.dueDate < todayISO() && video.stage !== 'entregue';
  return (
    <div className={cn('cursor-pointer touch-none select-none rounded-lg border border-line bg-ink-850 p-3 transition hover:border-white/20', dragging && 'rotate-2 border-brand-400/60 shadow-2xl')}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 text-brand-300"><Clapperboard size={13} /><span className="text-[11px] text-white/40">{assignee?.name || video.editor || 'sem responsável'}</span></div>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/90">{video.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
            {client && <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: client.color }} />{client.name}</span>}
            {video.links.length > 0 && <span className="inline-flex items-center gap-1"><Link2 size={11} /> {video.links.length}</span>}
            {video.checklist.length > 0 && <span className="inline-flex items-center gap-1"><CheckSquare size={11} /> {done}/{video.checklist.length}</span>}
            {pendRev > 0 && <span className="inline-flex items-center gap-1 text-rose-300"><MessageSquare size={11} /> {pendRev}</span>}
            {video.dueDate && <span className={cn('ml-auto', late && 'text-red-300')}>{new Date(video.dueDate + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
