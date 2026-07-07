"use client";

import { ErrorState, MetricCard, MetricCardSkeleton } from "@/shared/ui";
import { formatNumber } from "@/shared/lib/formatters";
import { useDashboardMetrics } from "../hooks/use-dashboard-data";

export function MetricsGrid() {
  const { data, isPending, isError, refetch } = useDashboardMetrics();

  if (isError) {
    return (
      <ErrorState
        title="Failed to load metrics"
        action={
          <button className="text-accent text-sm underline" onClick={() => refetch()}>
            Retry
          </button>
        }
      />
    );
  }

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard label="Datasets" value={formatNumber(data.datasets)} />
      <MetricCard label="Active Pipelines" value={data.activePipelines} />
      <MetricCard
        label="Failed Jobs"
        value={data.failedJobs}
        delta={data.failedJobs > 0 ? `${data.failedJobs} need attention` : "all green"}
        deltaTone={data.failedJobs > 0 ? "negative" : "positive"}
      />
      <MetricCard label="Avg Data Quality" value={`${data.avgDataQuality}%`} />
      <MetricCard label="Anomalies" value={data.anomaliesDetected} hint="last 24h" />
      <MetricCard label="Live Events" value={formatNumber(data.liveEvents)} hint="per minute" />
    </div>
  );
}
