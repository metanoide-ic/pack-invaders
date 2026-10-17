import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, KanbanSquare, Wallet, CalendarCheck, Clapperboard, Zap, Library } from 'lucide-react';
import { Logo, LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const modules = [
  { icon: KanbanSquare, title: 'Quadros', desc: 'Do briefing à entrega, cada demanda visível em um fluxo só.' },
  { icon: CalendarCheck, title: 'Posts', desc: 'Da ideia ao ar, com copy por IA e aprovação no WhatsApp.' },
  { icon: Clapperboard, title: 'Vídeos', desc: 'Pipeline de edição com versões, links e pedidos de alteração.' },
  { icon: Wallet, title: 'Financeiro', desc: 'Receitas, despesas e saldo por cliente, com acesso restrito.' },
  { icon: Zap, title: 'Automações', desc: 'Aprovou no grupo, publica no feed e no story. Sozinho.' },
  { icon: Library, title: 'Biblioteca', desc: 'Modelos de legenda prontos para reaproveitar em qualquer conta.' },
];

// Diferenciais reais da plataforma (cada um existe de verdade no app) — nada
// de estatística ou percentual inventado, só o que ela faz.
const DIFERENCIAIS = [
  'Sincronização em tempo real',
  'Aprovação automática no WhatsApp',
  'Copy gerada por IA',
  'Publicação automática no Instagram',
  'Cobrança com baixa automática',
  'Tudo num só lugar',
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Linha do H1 que sobe de baixo pra cima, mascarada — nunca aparece "cortada". */
function LinhaRevelada({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: '108%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Nav transparente sobre o hero, ganha fundo + blur depois de 60px de rolagem. */
function NavFlutuante() {
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
      className={cn(
        'fixed inset-x-0 top-0 z-30 transition-[background-color,backdrop-filter,padding,box-shadow] duration-500',
        rolou ? 'bg-ink-950/85 py-3 shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl' : 'py-6',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <Logo size="sm" />
        <Link to="/entrar">
          <Button variant="outline" size="sm">Entrar</Button>
        </Link>
      </div>
    </motion.header>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NavFlutuante />

      {/* hero — tipografia editorial grande, sem foto (a marca é o protagonista) */}
      <section className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden px-6 pb-16 pt-28 sm:min-h-screen sm:pt-24">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-[0.14] blur-[120px]"
          style={{ background: 'radial-gradient(circle, var(--color-brand-500), transparent 70%)' }}
        />

        <div className="relative mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
            className="mb-7 flex items-center gap-2.5 text-[12.5px] font-medium uppercase tracking-[0.34em] text-brand-300"
          >
            <span className="h-px w-8 bg-brand-400/70" />
            Orikay, a plataforma da Origem
          </motion.div>

          <h1 className="max-w-4xl font-display text-[2.75rem] font-semibold leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-[5.5rem]">
            <LinhaRevelada delay={0.5}>Resultado tem nome.</LinhaRevelada>
            <LinhaRevelada delay={0.65}>
              Estratégia tem <em className="text-brand-300 not-italic">Origem</em>.
            </LinhaRevelada>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.05, ease: EASE }}
            className="mt-8 max-w-lg text-lg leading-relaxed text-white/55"
          >
            Quadros, posts, vídeos e financeiro no mesmo lugar, com aprovação e
            publicação automatizadas. Feita para a rotina da agência.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.25, ease: EASE }}
            className="mt-10"
          >
            {/* Plataforma interna da equipe: não existe "criar conta" — as contas
                são as oficiais da Origem, criadas pelo admin em Equipe. */}
            <Link to="/entrar">
              <Button size="lg" className="group">
                Entrar
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* bloco da marca — canto, sóbrio, sem orbe/glow chapado */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.45, ease: EASE }}
          className="relative mx-auto mt-16 w-full max-w-6xl"
        >
          <div className="card relative max-w-sm overflow-hidden">
            <div className="relative flex items-center gap-4 px-6 py-5">
              <LogoMark className="h-10 w-10 shrink-0" />
              <div>
                <div className="font-display text-base font-semibold tracking-[0.1em] text-white">ORIKAY</div>
                <div className="mt-0.5 text-[10px] tracking-[0.24em] text-white/35">POR ORIGEM COMUNICAÇÃO</div>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-line border-t border-line text-center">
              {[['Web + App', 'instale no celular'], ['3 em 1', 'gestão completa'], ['IA', 'copy automática']].map(([a, b]) => (
                <div key={a} className="px-3 py-4">
                  <div className="font-display text-sm font-semibold text-white">{a}</div>
                  <div className="mt-0.5 text-[11px] text-white/40">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* faixa de diferenciais — rolagem infinita, um acento só */}
      <div className="overflow-hidden border-y border-line bg-ink-900/60 py-5">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-0 font-display text-2xl tracking-wide sm:text-3xl">
          {[...DIFERENCIAIS, ...DIFERENCIAIS].map((d, i) => (
            <span key={i} className={cn('mx-8 whitespace-nowrap', i % 2 === 0 ? 'text-white/85' : 'text-brand-300')}>
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* módulos — grade densa, revelada em cascata na rolagem */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
          <h2 className="font-display text-2xl font-semibold text-white">Tudo o que a operação precisa</h2>
          <span className="hidden text-sm text-white/40 sm:block">6 módulos integrados</span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.12, ease: EASE }}
              className="group bg-ink-900 p-6 transition-colors duration-200 hover:bg-ink-850"
            >
              <m.icon size={20} strokeWidth={1.75} className="text-brand-300" />
              <h3 className="mt-4 font-display text-lg font-semibold text-white">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* fechamento — H2 enorme centralizado + um CTA só */}
      <section className="relative overflow-hidden border-t border-line bg-ink-900/60 px-6 py-28 text-center sm:py-36">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 opacity-[0.12] blur-[110px]"
          style={{ background: 'radial-gradient(circle, var(--color-brand-500), transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: EASE }}
          className="relative mx-auto max-w-2xl text-[11px] font-medium uppercase tracking-[0.34em] text-brand-300"
        >
          Equipe Origem
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, delay: 0.1, ease: EASE }}
          className="relative mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl"
        >
          Entre e continue de onde parou.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="relative mt-10"
        >
          <Link to="/entrar">
            <Button size="lg" className="group">
              Entrar
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs tracking-wide text-white/35">
        Orikay · Origem Comunicação &amp; Marketing
      </footer>
    </div>
  );
}
