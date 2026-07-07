import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={clsx("bg-surface-hover animate-pulse rounded-md", className)} />
  );
}

/** Placeholder for a MetricCard while data is loading. */
export function MetricCardSkeleton() {
  return (
    <div className="border-border bg-surface rounded-lg border p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}
