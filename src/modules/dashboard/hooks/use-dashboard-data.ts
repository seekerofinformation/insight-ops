"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard-api";
import { pipelineApi } from "@/modules/pipeline-builder/api/pipeline-api";

export function useDashboardMetrics() {
  return useQuery({ queryKey: ["dashboard", "metrics"], queryFn: dashboardApi.getMetrics });
}

export function useDashboardTrends() {
  return useQuery({ queryKey: ["dashboard", "trends"], queryFn: dashboardApi.getTrends });
}

export function useRecentAlerts() {
  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => dashboardApi.getRecentAlerts(6),
  });
}

export function usePipelineRuns() {
  return useQuery({ queryKey: ["pipelines", "list"], queryFn: pipelineApi.getPipelines });
}
