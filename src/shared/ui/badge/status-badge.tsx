import clsx from "clsx";
import type { PipelineNodeStatus } from "@/shared/types";
import type { Severity } from "@/shared/types";

export type StatusTone = "neutral" | "info" | "running" | "success" | "warning" | "critical";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-border text-muted",
  info: "border-accent/40 text-accent",
  running: "border-accent/40 text-accent",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  critical: "border-critical/40 text-critical",
};

const statusToTone: Record<PipelineNodeStatus | Severity, StatusTone> = {
  idle: "neutral",
  running: "running",
  success: "success",
  warning: "warning",
  failed: "critical",
  info: "info",
  critical: "critical",
};

export interface StatusBadgeProps {
  /** Pipeline status or alert severity; label defaults to this value */
  status: PipelineNodeStatus | Severity;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const tone = statusToTone[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs",
        toneClasses[tone],
        className,
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "size-1.5 rounded-full bg-current",
          status === "running" && "animate-pulse",
        )}
      />
      {label ?? status}
    </span>
  );
}
