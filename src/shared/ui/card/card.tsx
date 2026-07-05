import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("border-border bg-surface rounded-lg border p-4", className)} {...props} />
  );
}

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  /** e.g. "+12% vs last week"; tone controls its color */
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  hint?: string;
}

const deltaToneClasses = {
  positive: "text-success",
  negative: "text-critical",
  neutral: "text-muted",
} as const;

export function MetricCard({ label, value, delta, deltaTone = "neutral", hint }: MetricCardProps) {
  return (
    <Card>
      <p className="text-muted text-xs tracking-wide uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {(delta || hint) && (
        <p className="mt-1 flex items-baseline gap-2 text-xs">
          {delta && <span className={deltaToneClasses[deltaTone]}>{delta}</span>}
          {hint && <span className="text-muted">{hint}</span>}
        </p>
      )}
    </Card>
  );
}
