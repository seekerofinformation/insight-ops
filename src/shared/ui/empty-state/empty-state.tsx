import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-muted mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
