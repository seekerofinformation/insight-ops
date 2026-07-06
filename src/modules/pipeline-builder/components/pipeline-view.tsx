"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, ErrorState, PageHeader, Skeleton, StatusBadge } from "@/shared/ui";
import { usePipelines } from "../hooks/use-pipelines";
import { usePipelineActions, usePipelineBuilderStore } from "../store/pipeline-store";
import { NodeConfigPanel } from "./node-config-panel";
import { ExecutionLogs } from "./execution-logs";

// ReactFlow is heavy — load only on the client when this route opens.
const PipelineCanvas = dynamic(() => import("./pipeline-canvas"), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

export function PipelineView() {
  const { data: pipelines, isPending, isError, refetch } = usePipelines();
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const isRunning = usePipelineBuilderStore((s) => s.isRunning);
  const { loadPipeline, runSimulation, resetRun } = usePipelineActions();

  // Load the first pipeline into the store once the list arrives.
  useEffect(() => {
    if (pipelines && pipelines.length > 0 && !pipeline) {
      const first = pipelines[0];
      if (first) loadPipeline(first);
    }
  }, [pipelines, pipeline, loadPipeline]);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load pipelines"
        action={
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pipeline Builder"
        description="Visual low-code data pipelines with execution simulation."
        actions={
          <>
            <select
              value={pipeline?.id ?? ""}
              onChange={(e) => {
                const next = pipelines?.find((p) => p.id === e.target.value);
                if (next) loadPipeline(next);
              }}
              aria-label="Select pipeline"
              className="border-border bg-surface focus-visible:ring-accent h-9 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {(pipelines ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button variant="secondary" size="sm" onClick={resetRun} disabled={isRunning}>
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => void runSimulation()}
              disabled={isRunning || !pipeline}
            >
              {isRunning ? "Running…" : "Run pipeline"}
            </Button>
          </>
        }
      />

      {pipeline && (
        <div className="text-muted flex items-center gap-2 text-xs">
          <span>{pipeline.description}</span>
          {isRunning && <StatusBadge status="running" />}
        </div>
      )}

      {isPending && !pipeline ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
          <div className="h-[430px]">
            <PipelineCanvas />
          </div>
          <NodeConfigPanel />
        </div>
      )}

      <ExecutionLogs />
    </div>
  );
}
