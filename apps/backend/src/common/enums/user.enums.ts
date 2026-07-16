export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  WORKER = 'WORKER',
}

export enum UserVertical {
  MARKETING = 'MARKETING',
  PRODUCT = 'PRODUCT',
  SALES = 'SALES',
  ENGINEERING = 'ENGINEERING',
  DESIGN = 'DESIGN',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  HR = 'HR',
  LEGAL = 'LEGAL',
  OTHER = 'OTHER',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  LAUNCHED = 'LAUNCHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum PriorityColor {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export const VERTICAL_LABELS: Record<UserVertical, string> = {
  [UserVertical.MARKETING]: 'Marketing',
  [UserVertical.PRODUCT]: 'Produto',
  [UserVertical.SALES]: 'Vendas',
  [UserVertical.ENGINEERING]: 'Engenharia',
  [UserVertical.DESIGN]: 'Design',
  [UserVertical.OPERATIONS]: 'Operações',
  [UserVertical.FINANCE]: 'Finanças',
  [UserVertical.HR]: 'RH',
  [UserVertical.LEGAL]: 'Jurídico',
  [UserVertical.OTHER]: 'Outro',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.ANALYST]: 'Analista de Marketing',
  [UserRole.WORKER]: 'Colaborador',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Rascunho',
  [ProjectStatus.PENDING_REVIEW]: 'Em Análise',
  [ProjectStatus.APPROVED]: 'Aprovado',
  [ProjectStatus.REJECTED]: 'Rejeitado',
  [ProjectStatus.IN_DEVELOPMENT]: 'Em Desenvolvimento',
  [ProjectStatus.LAUNCHED]: 'Lançado',
  [ProjectStatus.ARCHIVED]: 'Arquivado',
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  [ProjectPriority.LOW]: 'Baixa',
  [ProjectPriority.MEDIUM]: 'Média',
  [ProjectPriority.HIGH]: 'Alta',
};

export const PRIORITY_COLOR_LABELS: Record<PriorityColor, string> = {
  [PriorityColor.GREEN]: 'Verde (Alta prioridade)',
  [PriorityColor.YELLOW]: 'Amarelo (Média prioridade)',
  [PriorityColor.RED]: 'Vermelho (Baixa prioridade)',
};

export const PRIORITY_TO_COLOR: Record<ProjectPriority, PriorityColor> = {
  [ProjectPriority.HIGH]: PriorityColor.GREEN,
  [ProjectPriority.MEDIUM]: PriorityColor.YELLOW,
  [ProjectPriority.LOW]: PriorityColor.RED,
};

export enum EvaluationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION',
}