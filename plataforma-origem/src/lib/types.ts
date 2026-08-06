export type ID = string;

export interface Account {
  id: ID;
  name: string;
  email: string;
  /** Hash simples — armazenamento local, sem servidor. */
  passHash: string;
  role: string;
  color: string;
  createdAt: number;
}

export interface Client {
  id: ID;
  name: string;
  color: string;
  contact?: string;
  monthlyFee?: number;
  createdAt: number;
}

export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ChecklistItem {
  id: ID;
  text: string;
  done: boolean;
}

export interface Card {
  id: ID;
  title: string;
  description?: string;
  labels: string[];
  priority?: Priority;
  dueDate?: string; // ISO date
  clientId?: ID;
  assigneeId?: ID;
  checklist: ChecklistItem[];
  createdAt: number;
}

export interface Column {
  id: ID;
  title: string;
  cardIds: ID[];
}

export interface Board {
  id: ID;
  name: string;
  description?: string;
  clientId?: ID;
  columns: Column[];
  cards: Record<ID, Card>;
  createdAt: number;
}

export type TxType = 'receita' | 'despesa';
export type TxStatus = 'pago' | 'pendente';

export interface Transaction {
  id: ID;
  type: TxType;
  description: string;
  amount: number;
  category: string;
  clientId?: ID;
  date: string; // ISO date
  status: TxStatus;
  createdAt: number;
}

export type PostPlatform =
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'LinkedIn'
  | 'Facebook'
  | 'Blog';

export type PostStage =
  | 'ideia'
  | 'roteiro'
  | 'producao'
  | 'edicao'
  | 'aprovacao'
  | 'agendado'
  | 'publicado';

export interface Post {
  id: ID;
  title: string;
  platform: PostPlatform;
  clientId?: ID;
  stage: PostStage;
  scheduledDate?: string; // ISO date
  caption?: string;
  notes?: string;
  checklist: ChecklistItem[];
  createdAt: number;
}

export interface WorkspaceData {
  clients: Client[];
  boards: Board[];
  transactions: Transaction[];
  posts: Post[];
}
