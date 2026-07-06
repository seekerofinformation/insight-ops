"use client";

import { Card, Skeleton, StatusBadge } from "@/shared/ui";
import { formatNumber, formatTime } from "@/shared/lib/formatters";
import { usePipelineRuns } from "../hooks/use-dashboard-data";

export function PipelineRuns() {
  const { data, isPending } = usePipelineRuns();

  return (
    <Card>
      <p className="mb-3 text-sm font-medium">Latest Pipeline Executions</p>
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted border-border border-b text-left text-xs uppercase">
              <th className="pb-2 font-medium">Pipeline</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 text-right font-medium">Rows</th>
              <th className="pb-2 text-right font-medium">Last run</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((pipeline) => {
              const rows = pipeline.nodes.at(-1)?.rowsProcessed;
              return (
                <tr key={pipeline.id} className="border-border border-b last:border-0">
                  <td className="py-2 pr-3">{pipeline.name}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge
                      status={
                        pipeline.status === "running"
                          ? "running"
                          : pipeline.status === "idle"
                            ? "idle"
                            : pipeline.status
                      }
                    />
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {rows !== undefined ? formatNumber(rows) : "—"}
                  </td>
                  <td className="text-muted py-2 text-right tabular-nums">
                    {pipeline.lastRunAt ? formatTime(pipeline.lastRunAt) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
