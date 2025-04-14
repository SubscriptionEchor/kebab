import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  title,
  message,
  icon: Icon,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      )}
      <p className="text-gray-500 mb-4">{title}</p>
      {message && (
        <p className="text-sm text-gray-400 mb-4">{message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-brand-primary hover:text-brand-primary/80 font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}