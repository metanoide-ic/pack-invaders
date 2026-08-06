import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Palette, Database, LogOut, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Field, Input, Avatar, Modal } from '@/components/ui';
import { useAuth } from '@/lib/authStore';
import { useData } from '@/lib/dataStore';
import { AVATAR_COLORS, cn } from '@/lib/utils';

export default function Settings() {
  const user = useAuth((s) => s.current());
  const updateProfile = useAuth((s) => s.updateProfile);
  const logout = useAuth((s) => s.logout);
  const data = useData();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState(user?.role ?? '');
  const [color, setColor] = useState(user?.color ?? AVATAR_COLORS[0]);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!user) return null;

  function save() {
    updateProfile({ name: name.trim() || user!.name, role: role.trim(), color });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Gerencie seu perfil e os dados da plataforma." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Perfil */}
          <section className="card p-6">
            <div className="mb-5 flex items-center gap-2 text-white">
              <User size={18} className="text-brand-300" />
              <h3 className="font-semibold">Perfil</h3>
            </div>
            <div className="flex items-center gap-4">
              <Avatar name={name || user.name} color={color} size={64} />
              <div className="text-sm text-white/50">
                Sua inicial e cor aparecem no menu e nas atribuições.
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nome">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Cargo">
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex.: Diretor de arte" />
              </Field>
            </div>
            <Field label="E-mail">
              <Input value={user.email} disabled className="mt-4 opacity-60" />
            </Field>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/60">
                <Palette size={14} /> Cor do avatar
              </div>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn('h-8 w-8 rounded-full transition', color === c && 'ring-2 ring-white ring-offset-2 ring-offset-ink-850')}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={save}>{saved ? <><Check size={16} /> Salvo</> : 'Salvar alterações'}</Button>
            </div>
          </section>

          {/* Dados */}
          <section className="card p-6">
            <div className="mb-4 flex items-center gap-2 text-white">
              <Database size={18} className="text-brand-300" />
              <h3 className="font-semibold">Dados da plataforma</h3>
            </div>
            <p className="text-sm text-white/50">
              Os dados ficam salvos localmente neste navegador/dispositivo. Você pode
              recarregar o conteúdo de exemplo ou limpar tudo para começar do zero.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => data.loadDemo()}>
                Recarregar dados de exemplo
              </Button>
              <Button variant="danger" onClick={() => setConfirmReset(true)}>
                Limpar todos os dados
              </Button>
            </div>
          </section>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          <section className="card p-6">
            <h3 className="font-semibold text-white">Sessão</h3>
            <p className="mt-1 text-sm text-white/50">
              Conectado como <span className="text-white">{user.email}</span>.
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut size={16} /> Sair da conta
            </Button>
          </section>

          <section className="card p-6 text-sm text-white/50">
            <h3 className="mb-2 font-semibold text-white">Sobre</h3>
            <p>
              Plataforma Origem — quadros, checklist de posts e financeiro para a
              rotina da agência.
            </p>
            <p className="mt-3 text-xs text-white/35">Versão 1.0 · Web &amp; App (PWA)</p>
          </section>
        </div>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Limpar todos os dados?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { data.resetAll(); setConfirmReset(false); }}>
              Sim, limpar tudo
            </Button>
          </>
        }
      >
        <p className="text-sm text-white/60">
          Esta ação remove todos os quadros, posts, lançamentos financeiros e clientes
          deste dispositivo. Sua conta de acesso é mantida. Não é possível desfazer.
        </p>
      </Modal>
    </div>
  );
}
