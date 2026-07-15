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
  CRITICAL = 'CRITICAL',
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
  [ProjectPriority.CRITICAL]: 'Crítica',
};

export enum EvaluationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION',
}