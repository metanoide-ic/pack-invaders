export type ID = string;

export interface Account {
  id: ID;
  name: string;
  /** Identificador de login (nome de usuário). */
  login: string;
  email?: string;
  /** Hash simples — armazenamento local, sem servidor. */
  passHash: string;
  role: string;
  color: string;
  /** Permissão especial para ver o Financeiro. */
  canFinance: boolean;
  /** Pode gerenciar contas e permissões. */
  admin: boolean;
  createdAt: number;
}

/** Cadência semanal: para cada dia da semana (0=Dom..6=Sáb), tipos de conteúdo. */
export type WeeklyPlan = Record<number, string[]>;

export interface Client {
  id: ID;
  name: string;
  color: string;
  contact?: string;
  monthlyFee?: number;
  /** Briefing do cliente — contexto para a IA gerar conteúdo. */
  briefing?: string;
  /** Cidade — usada para datas comemorativas locais. */
  city?: string;
  /** Cadência semanal de entregas. */
  weeklyPlan?: WeeklyPlan;
  /** ID/nome do grupo de WhatsApp deste cliente. */
  whatsappGroup?: string;
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
  | 'alteracao'
  | 'agendado'
  | 'publicado';

/** Pedido de alteração — empilhados separadamente. */
export interface Revision {
  id: ID;
  text: string;
  resolved: boolean;
  createdAt: number;
}

export interface Post {
  id: ID;
  title: string;
  platform: PostPlatform;
  clientId?: ID;
  stage: PostStage;
  scheduledDate?: string; // ISO date
  caption?: string;
  /** Copy gerada (IA ou template). */
  copy?: string;
  notes?: string;
  /** Imagem/mídia de referência (data URL). */
  mediaUrl?: string;
  checklist: ChecklistItem[];
  revisions: Revision[];
  /** true quando foi enviado ao grupo para aprovação. */
  sentForApproval?: boolean;
  /** true quando publicado automaticamente. */
  published?: boolean;
  createdAt: number;
}

// -------------------------- Edição de vídeo ---------------------------
export type VideoStage =
  | 'briefing'
  | 'gravacao'
  | 'decupagem'
  | 'edicao'
  | 'revisao'
  | 'aprovacao'
  | 'alteracao'
  | 'entregue';

export interface VideoLink {
  id: ID;
  label: string;
  url: string;
}

export interface VideoProject {
  id: ID;
  title: string;
  clientId?: ID;
  stage: VideoStage;
  dueDate?: string;
  editor?: string;
  notes?: string;
  links: VideoLink[];
  checklist: ChecklistItem[];
  revisions: Revision[];
  createdAt: number;
}

// -------------------------- Biblioteca --------------------------------
export interface LibraryItem {
  id: ID;
  title: string;
  platform?: PostPlatform;
  category: string;
  caption: string;
  hashtags?: string;
  mediaUrl?: string;
  createdAt: number;
}

// -------------------------- Automações --------------------------------
export type EventChannel = 'whatsapp' | 'instagram' | 'sistema' | 'ia';
export type EventStatus = 'ok' | 'simulado' | 'erro';

export interface AutomationEvent {
  id: ID;
  channel: EventChannel;
  title: string;
  detail?: string;
  status: EventStatus;
  postId?: ID;
  createdAt: number;
}

export interface WorkspaceData {
  clients: Client[];
  boards: Board[];
  transactions: Transaction[];
  posts: Post[];
  videos: VideoProject[];
  library: LibraryItem[];
  events: AutomationEvent[];
}
