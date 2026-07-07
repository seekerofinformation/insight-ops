"use client";

import { Button, Card, StatusBadge } from "@/shared/ui";
import { formatDurationMs, formatNumber } from "@/shared/lib/formatters";
import { usePipelineActions, usePipelineBuilderStore } from "../store/pipeline-store";

export function NodeConfigPanel() {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const selectedNodeId = usePipelineBuilderStore((s) => s.selectedNodeId);
  const runtime = usePipelineBuilderStore((s) =>
    s.selectedNodeId ? s.nodeRuntime[s.selectedNodeId] : undefined,
  );
  const { selectNode } = usePipelineActions();

  const node = pipeline?.nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <Card>
        <p className="text-sm font-medium">Node Configuration</p>
        <p className="text-muted mt-2 text-sm">Select a node to inspect its configuration.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-muted text-[10px] tracking-wide uppercase">{node.type}</p>
          <p className="text-sm font-medium">{node.label}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => selectNode(null)} aria-label="Close panel">
          ✕
        </Button>
      </div>

      <ul className="space-y-1.5 text-sm">
        <li className="flex items-center justify-between">
          <span className="text-muted">Status</span>
          <StatusBadge status={runtime?.status ?? "idle"} />
        </li>
        <li className="flex items-center justify-between">
          <span className="text-muted">Rows processed</span>
          <span className="tabular-nums">
            {runtime?.rowsProcessed !== undefined ? formatNumber(runtime.rowsProcessed) : "—"}
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-muted">Duration</span>
          <span className="tabular-nums">
            {runtime?.durationMs !== undefined ? formatDurationMs(runtime.durationMs) : "—"}
          </span>
        </li>
      </ul>

      <p className="text-muted mt-4 mb-1 text-xs uppercase">Configuration</p>
      <pre className="bg-background border-border overflow-x-auto rounded-md border p-2 font-mono text-xs">
        {JSON.stringify(node.config ?? { mode: "default" }, null, 2)}
      </pre>
    </Card>
  );
}
