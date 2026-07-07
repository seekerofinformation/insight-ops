"use client";

import type { DataQualityMetrics } from "@/shared/types";
import { Card, DataQualityBadge, Skeleton } from "@/shared/ui";
import { formatNumber } from "@/shared/lib/formatters";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums">{value}</span>
    </li>
  );
}

export function QualityPanel({ quality }: { quality: DataQualityMetrics | undefined }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Data Quality</p>
        {quality && <DataQualityBadge score={quality.qualityScore} />}
      </div>
      {!quality ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          <Row label="Missing values" value={`${quality.missingValuesPct}%`} />
          <Row label="Duplicate rows" value={formatNumber(quality.duplicateRows)} />
          <Row label="Invalid records" value={formatNumber(quality.invalidRecords)} />
          <Row label="Freshness score" value={`${quality.freshnessScore}%`} />
          <Row label="Schema consistency" value={`${quality.schemaConsistencyScore}%`} />
          <Row label="Anomaly score" value={`${quality.anomalyScore}`} />
        </ul>
      )}
    </Card>
  );
}
