import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Board,
  Card,
  Client,
  Column,
  Post,
  PostStage,
  Transaction,
} from './types';
import { uid } from './utils';
import { seedData } from './seed';

interface DataState {
  clients: Client[];
  boards: Board[];
  transactions: Transaction[];
  posts: Post[];
  seeded: boolean;

  loadDemo: () => void;
  resetAll: () => void;

  // Clientes
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;

  // Quadros
  addBoard: (b: { name: string; description?: string; clientId?: string }) => Board;
  removeBoard: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
  addColumn: (boardId: string, title: string) => void;
  renameColumn: (boardId: string, colId: string, title: string) => void;
  removeColumn: (boardId: string, colId: string) => void;
  addCard: (boardId: string, colId: string, card: Partial<Card> & { title: string }) => void;
  updateCard: (boardId: string, cardId: string, patch: Partial<Card>) => void;
  removeCard: (boardId: string, colId: string, cardId: string) => void;
  moveCard: (
    boardId: string,
    cardId: string,
    toColId: string,
    toIndex: number,
  ) => void;

  // Financeiro
  addTx: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTx: (id: string, patch: Partial<Transaction>) => void;
  removeTx: (id: string) => void;

  // Posts
  addPost: (p: Omit<Post, 'id' | 'createdAt' | 'checklist'> & { checklist?: Post['checklist'] }) => void;
  updatePost: (id: string, patch: Partial<Post>) => void;
  setPostStage: (id: string, stage: PostStage) => void;
  removePost: (id: string) => void;
}

const empty = { clients: [], boards: [], transactions: [], posts: [] };

export const useData = create<DataState>()(
  persist(
    (set) => ({
      ...empty,
      seeded: false,

      loadDemo: () => set({ ...seedData(), seeded: true }),
      resetAll: () => set({ ...empty, seeded: true }),

      // ---------- Clientes ----------
      addClient: (c) => {
        const client: Client = { ...c, id: uid('cli'), createdAt: Date.now() };
        set((s) => ({ clients: [...s.clients, client] }));
        return client;
      },
      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // ---------- Quadros ----------
      addBoard: ({ name, description, clientId }) => {
        const mk = (title: string): Column => ({ id: uid('col'), title, cardIds: [] });
        const board: Board = {
          id: uid('board'),
          name,
          description,
          clientId,
          columns: [mk('A fazer'), mk('Em produção'), mk('Revisão'), mk('Concluído')],
          cards: {},
          createdAt: Date.now(),
        };
        set((s) => ({ boards: [...s.boards, board] }));
        return board;
      },
      removeBoard: (id) =>
        set((s) => ({ boards: s.boards.filter((b) => b.id !== id) })),
      renameBoard: (id, name) =>
        set((s) => ({
          boards: s.boards.map((b) => (b.id === id ? { ...b, name } : b)),
        })),
      addColumn: (boardId, title) =>
        set((s) => ({
          boards: s.boards.map((b) =>
            b.id === boardId
              ? { ...b, columns: [...b.columns, { id: uid('col'), title, cardIds: [] }] }
              : b,
          ),
        })),
      renameColumn: (boardId, colId, title) =>
        set((s) => ({
          boards: s.boards.map((b) =>
            b.id === boardId
              ? {
                  ...b,
                  columns: b.columns.map((c) => (c.id === colId ? { ...c, title } : c)),
                }
              : b,
          ),
        })),
      removeColumn: (boardId, colId) =>
        set((s) => ({
          boards: s.boards.map((b) => {
            if (b.id !== boardId) return b;
            const col = b.columns.find((c) => c.id === colId);
            const cards = { ...b.cards };
            col?.cardIds.forEach((id) => delete cards[id]);
            return { ...b, cards, columns: b.columns.filter((c) => c.id !== colId) };
          }),
        })),
      addCard: (boardId, colId, card) =>
        set((s) => ({
          boards: s.boards.map((b) => {
            if (b.id !== boardId) return b;
            const id = uid('card');
            const full: Card = {
              id,
              title: card.title,
              description: card.description,
              labels: card.labels ?? [],
              priority: card.priority,
              dueDate: card.dueDate,
              clientId: card.clientId ?? b.clientId,
              assigneeId: card.assigneeId,
              checklist: card.checklist ?? [],
              createdAt: Date.now(),
            };
            return {
              ...b,
              cards: { ...b.cards, [id]: full },
              columns: b.columns.map((c) =>
                c.id === colId ? { ...c, cardIds: [...c.cardIds, id] } : c,
              ),
            };
          }),
        })),
      updateCard: (boardId, cardId, patch) =>
        set((s) => ({
          boards: s.boards.map((b) =>
            b.id === boardId
              ? { ...b, cards: { ...b.cards, [cardId]: { ...b.cards[cardId], ...patch } } }
              : b,
          ),
        })),
      removeCard: (boardId, colId, cardId) =>
        set((s) => ({
          boards: s.boards.map((b) => {
            if (b.id !== boardId) return b;
            const cards = { ...b.cards };
            delete cards[cardId];
            return {
              ...b,
              cards,
              columns: b.columns.map((c) =>
                c.id === colId
                  ? { ...c, cardIds: c.cardIds.filter((id) => id !== cardId) }
                  : c,
              ),
            };
          }),
        })),
      moveCard: (boardId, cardId, toColId, toIndex) =>
        set((s) => ({
          boards: s.boards.map((b) => {
            if (b.id !== boardId) return b;
            const columns = b.columns.map((c) => ({
              ...c,
              cardIds: c.cardIds.filter((id) => id !== cardId),
            }));
            const target = columns.find((c) => c.id === toColId);
            if (target) {
              const idx = Math.max(0, Math.min(toIndex, target.cardIds.length));
              target.cardIds.splice(idx, 0, cardId);
            }
            return { ...b, columns };
          }),
        })),

      // ---------- Financeiro ----------
      addTx: (t) =>
        set((s) => ({
          transactions: [{ ...t, id: uid('tx'), createdAt: Date.now() }, ...s.transactions],
        })),
      updateTx: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTx: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      // ---------- Posts ----------
      addPost: (p) =>
        set((s) => ({
          posts: [
            { ...p, id: uid('post'), createdAt: Date.now(), checklist: p.checklist ?? [] },
            ...s.posts,
          ],
        })),
      updatePost: (id, patch) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      setPostStage: (id, stage) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, stage } : p)),
        })),
      removePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
    }),
    { name: 'origem.data' },
  ),
);
