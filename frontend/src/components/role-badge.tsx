import { CheckCircle2 } from 'lucide-react';

interface RoleBadgeProps {
  role: string | null | undefined;
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  if (!role) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium w-fit ${className}`}>
      <CheckCircle2 className="w-3 h-3 shrink-0" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}
