"use client";

import { Card, EmptyState, Skeleton, StatusBadge } from "@/shared/ui";
import { formatTime } from "@/shared/lib/formatters";
import { useRecentAlerts } from "../hooks/use-dashboard-data";

export function AlertFeed() {
  const { data, isPending } = useRecentAlerts();

  return (
    <Card>
      <p className="mb-3 text-sm font-medium">Latest Alerts</p>
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No alerts" description="Operational events will appear here." />
      ) : (
        <ul className="space-y-3">
          {data.map((alert) => (
            <li key={alert.id} className="flex items-start gap-3">
              <StatusBadge status={alert.severity} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm">{alert.title}</p>
                <p className="text-muted text-xs">
                  {alert.source} · {formatTime(alert.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
