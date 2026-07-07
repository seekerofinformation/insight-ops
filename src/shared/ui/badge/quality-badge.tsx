import clsx from "clsx";

/** Non-color-only: shows the numeric score alongside the tone. */
export function DataQualityBadge({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 85
      ? "text-success border-success/40"
      : score >= 70
        ? "text-warning border-warning/40"
        : "text-critical border-critical/40";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs tabular-nums",
        tone,
        className,
      )}
      title="Data quality score"
    >
      {score}% quality
    </span>
  );
}
