import type { Metadata } from "next";
import { MonitoringView } from "@/modules/realtime-monitoring/components/monitoring-view";

export const metadata: Metadata = { title: "Monitoring" };

export default function MonitoringPage() {
  return <MonitoringView />;
}
