"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { Card, Skeleton } from "@/shared/ui";
import { useDashboardTrends } from "../hooks/use-dashboard-data";

// ECharts is heavy — load it lazily on the client only.
const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const AXIS_COLOR = "#9ca3af";
const GRID_COLOR = "#1f2937";

function baseOption(labels: string[]): EChartsOption {
  return {
    backgroundColor: "transparent",
    grid: { left: 40, right: 16, top: 24, bottom: 28 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: GRID_COLOR } },
      axisLabel: { color: AXIS_COLOR },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: GRID_COLOR } },
      axisLabel: { color: AXIS_COLOR },
    },
  };
}

export function TrendCharts() {
  const { data, isPending, isError } = useDashboardTrends();

  const eventOption = useMemo<EChartsOption | null>(() => {
    if (!data) return null;
    return {
      ...baseOption(data.eventActivity.map((p) => p.label)),
      series: [
        {
          name: "Events",
          type: "bar",
          data: data.eventActivity.map((p) => p.value),
          itemStyle: { color: "#38bdf8", borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [data]);

  const qualityOption = useMemo<EChartsOption | null>(() => {
    if (!data) return null;
    return {
      ...baseOption(data.qualityTrend.map((p) => p.label)),
      yAxis: {
        type: "value",
        min: 70,
        max: 100,
        splitLine: { lineStyle: { color: GRID_COLOR } },
        axisLabel: { color: AXIS_COLOR, formatter: "{value}%" },
      },
      series: [
        {
          name: "Quality",
          type: "line",
          smooth: true,
          data: data.qualityTrend.map((p) => p.value),
          itemStyle: { color: "#34d399" },
          areaStyle: { opacity: 0.15 },
        },
      ],
    };
  }, [data]);

  if (isError) return null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <p className="mb-2 text-sm font-medium">Event Activity</p>
        {isPending || !eventOption ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ReactECharts option={eventOption} style={{ height: 256 }} notMerge />
        )}
      </Card>
      <Card>
        <p className="mb-2 text-sm font-medium">Data Quality Trend</p>
        {isPending || !qualityOption ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ReactECharts option={qualityOption} style={{ height: 256 }} notMerge />
        )}
      </Card>
    </div>
  );
}
