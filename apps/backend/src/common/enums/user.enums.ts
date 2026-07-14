export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
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

export enum IdeaStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  LAUNCHED = 'LAUNCHED',
  ARCHIVED = 'ARCHIVED',
}

export enum FeedbackType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
}

export enum AIDeletionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
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
  [UserRole.ANALYST]: 'Analista',
};