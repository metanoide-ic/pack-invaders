import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/lib/authStore';
import { useData } from '@/lib/dataStore';

export default function Auth() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = useAuth((s) => s.signup);
  const login = useAuth((s) => s.login);
  const hasAccounts = useAuth((s) => s.accounts.length > 0);
  const data = useData();
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res =
      mode === 'signup'
        ? signup({ name, email, password, role })
        : login(email, password);

    setTimeout(() => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error || 'Algo deu errado.');
        return;
      }
      // Primeira conta criada: já popula com dados de exemplo para ilustrar.
      if (mode === 'signup' && !data.seeded) data.loadDemo();
      navigate('/app');
    }, 350);
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Painel lateral (marca) */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 grid-noise opacity-30" />
        <div className="absolute -bottom-32 -left-24 h-[32rem] w-[32rem] rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              A operação da agência,
              <br />
              <span className="text-gradient">num só lugar.</span>
            </h2>
            <p className="mt-4 max-w-sm text-white/55">
              Quadros, posts e financeiro conectados. Entre e leve a Origem para o
              próximo nível.
            </p>
          </div>
          <p className="text-xs text-white/40">
            Estratégia · Criatividade · Resultados
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="relative flex items-center justify-center p-6">
        <Link
          to="/"
          className="absolute left-5 top-5 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-2xl font-semibold text-white">
            {mode === 'signup' ? 'Criar conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            {mode === 'signup'
              ? 'É rápido — leva menos de um minuto.'
              : 'Entre para continuar de onde parou.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'signup' && (
              <>
                <Field label="Nome completo">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex.: Ana Ribeiro"
                    autoFocus
                  />
                </Field>
                <Field label="Cargo na agência (opcional)">
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ex.: Social Media"
                  />
                </Field>
              </>
            )}
            <Field label="E-mail">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@origem.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Senha">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </Field>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 size={18} className="animate-spin" />}
              {mode === 'signup' ? 'Criar conta e entrar' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/50">
            {mode === 'signup' ? (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="font-medium text-brand-300 hover:text-brand-200"
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Novo por aqui?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="font-medium text-brand-300 hover:text-brand-200"
                >
                  Criar conta
                </button>
              </>
            )}
          </div>

          {mode === 'login' && !hasAccounts && (
            <p className="mt-4 rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-center text-xs text-white/45">
              Nenhuma conta ainda neste dispositivo. Crie a primeira conta para começar.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
