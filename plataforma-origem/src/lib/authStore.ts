import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from './types';
import { hash, pickColor, uid } from './utils';

interface AuthState {
  accounts: Account[];
  currentId: string | null;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<Pick<Account, 'name' | 'role' | 'color'>>) => void;
  current: () => Account | null;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: [],
      currentId: null,

      signup: ({ name, email, password, role }) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!name.trim()) return { ok: false, error: 'Informe seu nome.' };
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail))
          return { ok: false, error: 'E-mail inválido.' };
        if (password.length < 4)
          return { ok: false, error: 'A senha precisa de ao menos 4 caracteres.' };
        if (get().accounts.some((a) => a.email === cleanEmail))
          return { ok: false, error: 'Já existe uma conta com este e-mail.' };

        const account: Account = {
          id: uid('user'),
          name: name.trim(),
          email: cleanEmail,
          passHash: hash(password),
          role: role?.trim() || 'Membro da equipe',
          color: pickColor(cleanEmail),
          createdAt: Date.now(),
        };
        set((s) => ({ accounts: [...s.accounts, account], currentId: account.id }));
        return { ok: true };
      },

      login: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const acc = get().accounts.find((a) => a.email === cleanEmail);
        if (!acc) return { ok: false, error: 'Conta não encontrada.' };
        if (acc.passHash !== hash(password))
          return { ok: false, error: 'Senha incorreta.' };
        set({ currentId: acc.id });
        return { ok: true };
      },

      logout: () => set({ currentId: null }),

      updateProfile: (patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === s.currentId ? { ...a, ...patch } : a,
          ),
        })),

      current: () => {
        const { accounts, currentId } = get();
        return accounts.find((a) => a.id === currentId) ?? null;
      },
    }),
    { name: 'origem.auth' },
  ),
);
