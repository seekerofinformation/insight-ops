"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import clsx from "clsx";
import type { PipelineNode as PipelineNodeModel } from "@/shared/types";
import { StatusBadge } from "@/shared/ui";
import { formatDurationMs, formatNumber } from "@/shared/lib/formatters";
import type { NodeRuntime } from "../store/pipeline-store";

export interface PipelineNodeData {
  node: PipelineNodeModel;
  runtime: NodeRuntime;
  selected: boolean;
}

const TYPE_LABELS: Record<PipelineNodeModel["type"], string> = {
  source: "Source",
  cleaning: "Cleaning",
  filter: "Filter",
  join: "Join",
  validation: "Validation",
  transformation: "Transformation",
  anomaly: "Anomaly Detection",
  output: "Output",
};

function PipelineNodeComponent({ data }: NodeProps<PipelineNodeData>) {
  const { node, runtime, selected } = data;
  return (
    <div
      className={clsx(
        "bg-surface w-52 rounded-lg border p-3 text-left shadow-sm transition-colors",
        selected ? "border-accent" : "border-border",
        runtime.status === "failed" && "border-critical/60",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-accent !border-0" />
      <p className="text-muted text-[10px] tracking-wide uppercase">{TYPE_LABELS[node.type]}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{node.label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusBadge status={runtime.status} />
        <span className="text-muted text-[10px] tabular-nums">
          {runtime.status === "running"
            ? "…"
            : runtime.rowsProcessed !== undefined
              ? `${formatNumber(runtime.rowsProcessed)} rows`
              : runtime.durationMs !== undefined
                ? formatDurationMs(runtime.durationMs)
                : ""}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-accent !border-0" />
    </div>
  );
}

export const PipelineNodeView = memo(PipelineNodeComponent);
