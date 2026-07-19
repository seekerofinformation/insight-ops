export const MOCK_DASHBOARD_METRICS = {
    datasets: 24,
    activePipelines: 7,
    failedJobs: 2,
    avgDataQuality: 87,
    anomaliesDetected: 14,
    liveEvents: 128,
};
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MOCK_DASHBOARD_TRENDS = {
    eventActivity: DAYS.map((label, i) => ({
        label,
        value: [820, 940, 1105, 980, 1230, 760, 690][i] ?? 0,
    })),
    qualityTrend: DAYS.map((label, i) => ({
        label,
        value: [84, 85, 83, 86, 88, 87, 87][i] ?? 0,
    })),
};
//# sourceMappingURL=dashboard.js.map