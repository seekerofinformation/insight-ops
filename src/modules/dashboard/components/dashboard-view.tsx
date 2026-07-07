"use client";

import { PageHeader } from "@/shared/ui";
import { MetricsGrid } from "./metrics-grid";
import { TrendCharts } from "./trend-charts";
import { AlertFeed } from "./alert-feed";
import { PipelineRuns } from "./pipeline-runs";

export function DashboardView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Platform overview: datasets, pipelines, quality, anomalies and live events."
      />
      <MetricsGrid />
      <TrendCharts />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PipelineRuns />
        <AlertFeed />
      </div>
    </div>
  );
}
