import {
  alertSchema,
  dashboardMetricsSchema,
  dashboardTrendsSchema,
  type Alert,
  type DashboardMetrics,
  type DashboardTrends,
} from "@insightops/contracts";
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_DASHBOARD_TRENDS,
  getMockAlerts,
  withLatency,
} from "@/shared/lib/mock-data";

export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    return withLatency(dashboardMetricsSchema.parse(MOCK_DASHBOARD_METRICS));
  },

  async getTrends(): Promise<DashboardTrends> {
    return withLatency(dashboardTrendsSchema.parse(MOCK_DASHBOARD_TRENDS));
  },

  async getRecentAlerts(count = 8): Promise<Alert[]> {
    return withLatency(getMockAlerts(count).map((alert) => alertSchema.parse(alert)));
  },
};
