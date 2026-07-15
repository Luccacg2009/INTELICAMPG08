import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, className = '', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-600',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 font-medium rounded-full
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' && 'bg-green-500'} ${variant === 'warning' && 'bg-yellow-500'} ${variant === 'danger' && 'bg-red-500'} ${variant === 'info' && 'bg-blue-500'} ${variant === 'default' && 'bg-gray-500'} ${variant === 'gray' && 'bg-gray-500'}`} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    // Idea statuses
    PENDING_REVIEW: { label: 'Aguardando Análise', variant: 'warning' },
    UNDER_REVIEW: { label: 'Em Análise', variant: 'info' },
    APPROVED: { label: 'Aprovada', variant: 'success' },
    REJECTED: { label: 'Rejeitada', variant: 'danger' },
    IN_DEVELOPMENT: { label: 'Em Desenvolvimento', variant: 'info' },
    LAUNCHED: { label: 'Lançada', variant: 'success' },
    ARCHIVED: { label: 'Arquivada', variant: 'gray' },
    AI_DELETION_REQUESTED: { label: 'Exclusão por IA Solicitada', variant: 'danger' },
    DELETED_BY_AI: { label: 'Excluída por IA', variant: 'gray' },
    // Feedback types
    POSITIVE: { label: 'Positivo', variant: 'success' },
    NEGATIVE: { label: 'Negativo', variant: 'danger' },
    // AI Deletion statuses
    PENDING: { label: 'Pendente', variant: 'warning' },
    APPROVED_AI: { label: 'Aprovada', variant: 'success' },
    REJECTED_AI: { label: 'Rejeitada', variant: 'danger' },
    EXECUTED: { label: 'Executada', variant: 'gray' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };

  return <Badge variant={config.variant} dot>{config.label}</Badge>;
};