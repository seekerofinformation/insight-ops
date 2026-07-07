"use client";

import { useEffect } from "react";
import { PageHeader } from "@/shared/ui";
import { useRealtimeMonitoringActions } from "../store/realtime-store";
import { StreamControls } from "./stream-controls";
import { LiveAlertFeed } from "./live-alert-feed";

export function MonitoringView() {
  const { start, stop } = useRealtimeMonitoringActions();

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Real-Time Monitoring"
        description="Live operational events, alerts and anomalies across all pipelines."
      />
      <StreamControls />
      <LiveAlertFeed />
    </div>
  );
}
