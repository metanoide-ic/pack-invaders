import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  KanbanSquare,
  Wallet,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Logo, LogoMark } from './Logo';
import { Avatar } from './ui';
import { useAuth } from '@/lib/authStore';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/app', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/app/quadros', label: 'Quadros', icon: KanbanSquare },
  { to: '/app/posts', label: 'Posts', icon: CalendarCheck },
  { to: '/app/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/app/clientes', label: 'Clientes', icon: Users },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-500/15 text-white'
                : 'text-white/55 hover:text-white hover:bg-white/5',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-brand-400"
                />
              )}
              <Icon size={18} className={isActive ? 'text-brand-300' : ''} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserCard() {
  const user = useAuth((s) => s.current());
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} color={user.color} size={38} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{user.name}</div>
          <div className="truncate text-xs text-white/45">{user.role}</div>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        <button
          onClick={() => navigate('/app/config')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white"
        >
          <Settings size={14} /> Ajustes
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/60 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-ink-900/60 p-4 backdrop-blur-xl lg:flex">
        <div className="px-2 py-2">
          <Logo size="sm" />
        </div>
        <div className="mt-6 flex-1">
          <NavItems />
        </div>
        <UserCard />
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink-900/70 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo size="sm" showTagline={false} />
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl text-white/70 hover:bg-white/5"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-ink-900 p-4"
          >
            <div className="mb-6 flex items-center justify-between">
              <LogoMark className="h-8 w-8" />
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-white/70 hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
            <UserCard />
          </motion.div>
        </div>
      )}

      {/* Conteúdo */}
      <main className="lg:pl-64">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
