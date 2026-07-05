import type { Metadata } from "next";

export const metadata: Metadata = { title: "Monitoring" };

export default function MonitoringPage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Real-Time Monitoring</h1>
      <p className="text-muted mt-2 text-sm">Live operational events, alerts and anomalies.</p>
    </section>
  );
}
