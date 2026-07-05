import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions, e.g. buttons or filters */
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="text-muted mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
