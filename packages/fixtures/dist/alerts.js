import { createRng, pick, randomInt } from "./random.js";
const ALERT_TEMPLATES = [
    {
        severity: "critical",
        title: "Anomaly detected in Zone A",
        description: "Energy usage deviates 3.4σ from the zone baseline.",
        source: "Anomaly Detection",
    },
    {
        severity: "info",
        title: "Pipeline completed successfully",
        description: "Traffic Intelligence Pipeline finished in 19s.",
        source: "Pipeline Runner",
    },
    {
        severity: "warning",
        title: "Data quality warning",
        description: "Missing values exceeded the 5% threshold in Emergency Response Logs.",
        source: "Quality Monitor",
    },
    {
        severity: "warning",
        title: "Traffic congestion increased by 18%",
        description: "Average congestion level rising in Central district.",
        source: "Traffic Stream",
    },
    {
        severity: "critical",
        title: "Energy usage forecast exceeded baseline",
        description: "Forecast for Zone C is 12% above the seasonal baseline.",
        source: "Forecast Engine",
    },
    {
        severity: "info",
        title: "Sensor fleet check completed",
        description: "1,240 sensors reported healthy heartbeats.",
        source: "IoT Health",
    },
];
const BASE_TIME_MS = Date.parse("2026-07-06T09:00:00Z");
function buildAlert(rng, index) {
    const template = pick(rng, ALERT_TEMPLATES);
    return {
        id: `alert-${index}`,
        ...template,
        timestamp: new Date(BASE_TIME_MS - index * randomInt(rng, 2, 9) * 60_000).toISOString(),
        status: index < 3 ? "new" : pick(rng, ["new", "acknowledged", "resolved"]),
    };
}
/** Stable list of recent alerts (newest first) for dashboard/monitoring feeds. */
export function getMockAlerts(count = 12) {
    const rng = createRng(42);
    return Array.from({ length: count }, (_, i) => buildAlert(rng, i));
}
/** One-off random alert used by the mock real-time stream. */
export function createRandomAlert() {
    const rng = createRng(Date.now() & 0xffffffff);
    const template = pick(rng, ALERT_TEMPLATES);
    return {
        id: `alert-${Date.now()}-${randomInt(rng, 100, 999)}`,
        ...template,
        timestamp: new Date().toISOString(),
        status: "new",
    };
}
//# sourceMappingURL=alerts.js.map