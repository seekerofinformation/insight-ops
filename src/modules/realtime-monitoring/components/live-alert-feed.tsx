"use client";

import { Button, Card, EmptyState, StatusBadge } from "@/shared/ui";
import { formatTime } from "@/shared/lib/formatters";
import type { AlertStatus } from "@/shared/types";
import { useRealtimeMonitoringActions, useRealtimeMonitoringStore } from "../store/realtime-store";

const NEXT_STATUS: Record<AlertStatus, AlertStatus | null> = {
  new: "acknowledged",
  acknowledged: "resolved",
  resolved: null,
};

const NEXT_STATUS_LABEL: Record<AlertStatus, string> = {
  new: "Acknowledge",
  acknowledged: "Resolve",
  resolved: "Resolved",
};

export function LiveAlertFeed() {
  const alerts = useRealtimeMonitoringStore((s) => s.alerts);
  const { setStatus } = useRealtimeMonitoringActions();

  if (alerts.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No live events yet"
          description="Start the stream to see operational events as they arrive."
        />
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <ul className="divide-border divide-y">
        {alerts.map((alert) => {
          const next = NEXT_STATUS[alert.status];
          return (
            <li key={alert.id} className="flex items-start gap-3 px-4 py-3">
              <StatusBadge status={alert.severity} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{alert.title}</p>
                <p className="text-muted truncate text-xs">{alert.description}</p>
                <p className="text-muted mt-1 text-xs">
                  {alert.source} · {formatTime(alert.timestamp)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-muted text-xs capitalize">{alert.status}</span>
                {next && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(alert.id, next)}>
                    {NEXT_STATUS_LABEL[alert.status]}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
