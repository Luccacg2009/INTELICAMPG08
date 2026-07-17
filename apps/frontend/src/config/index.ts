// Por padrão usa caminho relativo '/api', que o dev server do Vite redireciona
// para o backend (ver proxy em vite.config.ts). Isso funciona tanto localmente
// quanto no GitHub Codespaces sem precisar expor a porta 3000 nem lidar com CORS.
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const VERTICALS = [
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'PRODUCT', label: 'Produto' },
  { value: 'SALES', label: 'Vendas' },
  { value: 'ENGINEERING', label: 'Engenharia' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'OPERATIONS', label: 'Operações' },
  { value: 'FINANCE', label: 'Finanças' },
  { value: 'HR', label: 'RH' },
  { value: 'LEGAL', label: 'Jurídico' },
  { value: 'OTHER', label: 'Outro' },
] as const;

export const IDEA_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Aguardando Análise',
  UNDER_REVIEW: 'Em Análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  IN_DEVELOPMENT: 'Em Desenvolvimento',
  LAUNCHED: 'Lançada',
  ARCHIVED: 'Arquivada',
  AI_DELETION_REQUESTED: 'Exclusão por IA Solicitada',
  DELETED_BY_AI: 'Excluída por IA',
};

export const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  POSITIVE: 'Positivo',
  NEGATIVE: 'Negativo',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  ANALYST: 'Analista',
  WORKER: 'Colaborador',
};