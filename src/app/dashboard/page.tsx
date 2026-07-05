import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Executive Dashboard</h1>
      <p className="text-muted mt-2 text-sm">
        Platform overview: datasets, pipelines, quality, anomalies and live events.
      </p>
    </section>
  );
}
