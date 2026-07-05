import type { ReactNode } from "react";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Usually a retry button */
  action?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="border-critical/30 bg-critical/5 flex flex-col items-center justify-center rounded-lg border px-6 py-12 text-center"
    >
      <p className="text-critical text-sm font-medium">{title}</p>
      {description && <p className="text-muted mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
