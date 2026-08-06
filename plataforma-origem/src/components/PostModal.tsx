import { useState } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { Modal, Button, Field, Input, Textarea, Select } from './ui';
import { useData } from '@/lib/dataStore';
import { STAGE_META, STAGE_ORDER, PLATFORMS } from '@/lib/labels';
import { uid, cn } from '@/lib/utils';
import type { PostPlatform } from '@/lib/types';

export function PostModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const post = useData((s) => s.posts.find((p) => p.id === postId));
  const clients = useData((s) => s.clients);
  const updatePost = useData((s) => s.updatePost);
  const removePost = useData((s) => s.removePost);
  const [newCk, setNewCk] = useState('');

  if (!post) return null;
  const stageIdx = STAGE_ORDER.indexOf(post.stage);

  return (
    <Modal open onClose={onClose} wide title="Post">
      <div className="space-y-5">
        <Field label="Título / tema">
          <Input value={post.title} onChange={(e) => updatePost(postId, { title: e.target.value })} />
        </Field>

        {/* Trilha de etapas */}
        <div>
          <div className="mb-2 text-xs font-medium text-white/60">Etapa da produção</div>
          <div className="flex flex-wrap gap-1.5">
            {STAGE_ORDER.map((s, i) => {
              const active = s === post.stage;
              const passed = i < stageIdx;
              return (
                <button
                  key={s}
                  onClick={() => updatePost(postId, { stage: s })}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                    active ? 'text-white ring-1' : passed ? 'text-white/70' : 'text-white/40 hover:text-white/70',
                  )}
                  style={
                    active
                      ? { background: `${STAGE_META[s].color}30`, color: STAGE_META[s].color, boxShadow: `inset 0 0 0 1px ${STAGE_META[s].color}` }
                      : passed
                        ? { background: `${STAGE_META[s].color}18` }
                        : { background: 'rgba(255,255,255,0.04)' }
                  }
                >
                  {STAGE_META[s].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Plataforma">
            <Select value={post.platform} onChange={(e) => updatePost(postId, { platform: e.target.value as PostPlatform })}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Cliente">
            <Select value={post.clientId ?? ''} onChange={(e) => updatePost(postId, { clientId: e.target.value || undefined })}>
              <option value="">—</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Data prevista">
            <Input type="date" value={post.scheduledDate ?? ''} onChange={(e) => updatePost(postId, { scheduledDate: e.target.value || undefined })} />
          </Field>
        </div>

        <Field label="Legenda">
          <Textarea value={post.caption ?? ''} onChange={(e) => updatePost(postId, { caption: e.target.value })} placeholder="Escreva a legenda da publicação…" />
        </Field>

        <Field label="Observações">
          <Textarea value={post.notes ?? ''} onChange={(e) => updatePost(postId, { notes: e.target.value })} placeholder="Roteiro, referências, hashtags…" />
        </Field>

        {/* Checklist */}
        <div>
          <div className="mb-2 text-xs font-medium text-white/60">Checklist de produção</div>
          <div className="space-y-1.5">
            {post.checklist.map((item) => (
              <div key={item.id} className="group flex items-center gap-2.5">
                <button
                  onClick={() =>
                    updatePost(postId, {
                      checklist: post.checklist.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)),
                    })
                  }
                  className={cn(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                    item.done ? 'border-brand-400 bg-brand-500 text-white' : 'border-line text-transparent hover:border-brand-400',
                  )}
                >
                  <Check size={13} />
                </button>
                <span className={cn('flex-1 text-sm', item.done ? 'text-white/40 line-through' : 'text-white/85')}>{item.text}</span>
                <button
                  onClick={() => updatePost(postId, { checklist: post.checklist.filter((c) => c.id !== item.id) })}
                  className="text-white/20 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              value={newCk}
              onChange={(e) => setNewCk(e.target.value)}
              placeholder="Adicionar item…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCk.trim()) {
                  updatePost(postId, { checklist: [...post.checklist, { id: uid('ck'), text: newCk.trim(), done: false }] });
                  setNewCk('');
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (!newCk.trim()) return;
                updatePost(postId, { checklist: [...post.checklist, { id: uid('ck'), text: newCk.trim(), done: false }] });
                setNewCk('');
              }}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <Button variant="danger" onClick={() => { removePost(postId); onClose(); }}>
            <Trash2 size={16} /> Excluir post
          </Button>
          <Button onClick={onClose}>Concluído</Button>
        </div>
      </div>
    </Modal>
  );
}
