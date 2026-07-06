export interface DashboardMetrics {
  datasets: number;
  activePipelines: number;
  failedJobs: number;
  /** 0–100 */
  avgDataQuality: number;
  anomaliesDetected: number;
  liveEvents: number;
}

export interface TrendPoint {
  /** Label on the X axis, e.g. "Mon" or "09:00" */
  label: string;
  value: number;
}

export interface DashboardTrends {
  /** Events processed per day, last 7 days */
  eventActivity: TrendPoint[];
  /** Average data quality per day, last 7 days */
  qualityTrend: TrendPoint[];
}

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  datasets: 24,
  activePipelines: 7,
  failedJobs: 2,
  avgDataQuality: 87,
  anomaliesDetected: 14,
  liveEvents: 128,
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MOCK_DASHBOARD_TRENDS: DashboardTrends = {
  eventActivity: DAYS.map((label, i) => ({
    label,
    value: [820, 940, 1105, 980, 1230, 760, 690][i] ?? 0,
  })),
  qualityTrend: DAYS.map((label, i) => ({
    label,
    value: [84, 85, 83, 86, 88, 87, 87][i] ?? 0,
  })),
};
