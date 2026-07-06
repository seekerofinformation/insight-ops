import type { Alert } from "@/shared/types";
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_DASHBOARD_TRENDS,
  getMockAlerts,
  withLatency,
  type DashboardMetrics,
  type DashboardTrends,
} from "@/shared/lib/mock-data";

export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    return withLatency(MOCK_DASHBOARD_METRICS);
  },

  async getTrends(): Promise<DashboardTrends> {
    return withLatency(MOCK_DASHBOARD_TRENDS);
  },

  async getRecentAlerts(count = 8): Promise<Alert[]> {
    return withLatency(getMockAlerts(count));
  },
};
