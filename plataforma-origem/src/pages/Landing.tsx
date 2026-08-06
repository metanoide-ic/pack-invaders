import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  KanbanSquare,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Logo, LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui';

const features = [
  {
    icon: KanbanSquare,
    title: 'Quadros',
    desc: 'Organize demandas em colunas arrastáveis. Do briefing à entrega, tudo visível em um só lugar.',
  },
  {
    icon: CalendarCheck,
    title: 'Checklist de posts',
    desc: 'Acompanhe cada publicação da ideia ao ar: roteiro, produção, edição, aprovação e agendamento.',
  },
  {
    icon: Wallet,
    title: 'Financeiro',
    desc: 'Receitas, despesas e saldo por cliente. Saiba exatamente quanto cada conta gera para a agência.',
  },
];

const stat = [
  { n: '3 em 1', l: 'Gestão, conteúdo e finanças' },
  { n: '100%', l: 'A sua identidade' },
  { n: 'Web + App', l: 'Instale no celular' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[36rem] w-[36rem] rounded-full bg-brand-600/25 blur-[120px]" />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Logo size="sm" />
        <Link to="/entrar">
          <Button variant="outline" size="sm">
            Entrar
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-white/60"
            >
              <Sparkles size={14} className="text-brand-300" />
              A plataforma interna da Origem
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 font-display text-4xl font-bold leading-[1.05] text-white sm:text-6xl"
            >
              Resultado tem nome.
              <br />
              <span className="text-gradient">Estratégia tem Origem.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 max-w-lg text-lg text-white/60"
            >
              Quadros, checklist de posts e financeiro reunidos em um só lugar. Uma
              ferramenta feita para a rotina da nossa agência — moderna, completa e
              simples de usar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/entrar">
                <Button size="lg" className="group">
                  Criar minha conta
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/entrar">
                <Button size="lg" variant="outline">
                  Já tenho conta
                </Button>
              </Link>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {stat.map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold text-white">{s.n}</div>
                  <div className="text-xs text-white/45">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="animate-float relative mx-auto grid aspect-square max-w-md place-items-center">
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="card relative grid h-full w-full place-items-center overflow-hidden p-10">
                <div className="grid-noise absolute inset-0 opacity-30" />
                <LogoMark className="relative h-40 w-40 drop-shadow-[0_0_40px_rgba(124,58,237,0.6)]" />
                <div className="relative mt-8 text-center">
                  <div className="font-display text-2xl font-semibold tracking-[0.3em] text-white">
                    ORIGEM
                  </div>
                  <div className="mt-1 text-[10px] tracking-[0.34em] text-white/40">
                    COMUNICAÇÃO &amp; MARKETING
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Zap, t: 'Rápida e fluida', d: 'Interface leve, com atalhos e arrastar-e-soltar.' },
            { icon: ShieldCheck, t: 'Seus dados, seu navegador', d: 'Tudo salvo localmente no dispositivo.' },
            { icon: Sparkles, t: 'Cara de Origem', d: 'Identidade visual da agência em cada tela.' },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3 rounded-2xl border border-line p-5">
              <f.icon size={18} className="mt-0.5 text-brand-300" />
              <div>
                <div className="text-sm font-semibold text-white">{f.t}</div>
                <div className="text-xs text-white/50">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <div className="glow card relative overflow-hidden p-10 text-center">
          <div className="grid-noise absolute inset-0 opacity-20" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/60">
            Crie sua conta em segundos e traga toda a operação da agência para a
            Plataforma Origem.
          </p>
          <Link to="/entrar" className="relative mt-7 inline-block">
            <Button size="lg" className="group">
              Criar conta grátis
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-line py-8 text-center text-xs text-white/40">
        Plataforma Origem · Estratégia · Criatividade · Resultados
      </footer>
    </div>
  );
}
