"use client";

import { Button, Card } from "@/shared/ui";
import { useRealtimeMonitoringActions, useRealtimeMonitoringStore } from "../store/realtime-store";

export function StreamControls() {
  const isStreaming = useRealtimeMonitoringStore((s) => s.isStreaming);
  const totalEventsReceived = useRealtimeMonitoringStore((s) => s.totalEventsReceived);
  const alertCount = useRealtimeMonitoringStore((s) => s.alerts.length);
  const { start, stop, clear } = useRealtimeMonitoringActions();

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-6 text-sm">
        <div>
          <p className="text-muted text-xs">Stream</p>
          <p className="font-medium">
            <span className={isStreaming ? "text-success" : "text-muted"}>
              ● {isStreaming ? "Live" : "Stopped"}
            </span>
          </p>
        </div>
        <div>
          <p className="text-muted text-xs">Events received</p>
          <p className="font-medium tabular-nums">{totalEventsReceived}</p>
        </div>
        <div>
          <p className="text-muted text-xs">In feed</p>
          <p className="font-medium tabular-nums">{alertCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {isStreaming ? (
          <Button size="sm" variant="secondary" onClick={stop}>
            Pause stream
          </Button>
        ) : (
          <Button size="sm" onClick={start}>
            Start stream
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={clear}>
          Clear feed
        </Button>
      </div>
    </Card>
  );
}
