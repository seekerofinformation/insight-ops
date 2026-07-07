"use client";

import { create } from "zustand";
import type { Pipeline, PipelineLogEntry, PipelineNodeStatus } from "@/shared/types";

export interface NodeRuntime {
  status: PipelineNodeStatus;
  rowsProcessed?: number;
  durationMs?: number;
}

interface PipelineBuilderState {
  pipeline: Pipeline | null;
  /** Live execution state per node; source of truth during simulation */
  nodeRuntime: Record<string, NodeRuntime>;
  selectedNodeId: string | null;
  logs: PipelineLogEntry[];
  isRunning: boolean;
  actions: {
    loadPipeline: (pipeline: Pipeline) => void;
    selectNode: (nodeId: string | null) => void;
    runSimulation: () => Promise<void>;
    resetRun: () => void;
  };
}

const STEP_MS = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initialRuntime(pipeline: Pipeline): Record<string, NodeRuntime> {
  return Object.fromEntries(
    pipeline.nodes.map((node) => [
      node.id,
      { status: node.status, rowsProcessed: node.rowsProcessed, durationMs: node.durationMs },
    ]),
  );
}

function idleRuntime(pipeline: Pipeline): Record<string, NodeRuntime> {
  return Object.fromEntries(pipeline.nodes.map((node) => [node.id, { status: "idle" as const }]));
}

let logSeq = 0;
function makeLog(
  level: PipelineLogEntry["level"],
  message: string,
  nodeId?: string,
): PipelineLogEntry {
  return {
    id: `log-${++logSeq}`,
    nodeId,
    level,
    message,
    timestamp: new Date().toISOString(),
  };
}

export const usePipelineBuilderStore = create<PipelineBuilderState>((set, get) => ({
  pipeline: null,
  nodeRuntime: {},
  selectedNodeId: null,
  logs: [],
  isRunning: false,
  actions: {
    loadPipeline: (pipeline) =>
      set({
        pipeline,
        nodeRuntime: initialRuntime(pipeline),
        selectedNodeId: null,
        logs: [],
        isRunning: false,
      }),

    selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

    resetRun: () => {
      const { pipeline } = get();
      if (!pipeline) return;
      set({ nodeRuntime: initialRuntime(pipeline), logs: [], isRunning: false });
    },

    runSimulation: async () => {
      const { pipeline, isRunning } = get();
      if (!pipeline || isRunning) return;

      set({
        isRunning: true,
        nodeRuntime: idleRuntime(pipeline),
        logs: [makeLog("info", `Pipeline "${pipeline.name}" started`)],
      });

      for (const node of pipeline.nodes) {
        set((state) => ({
          nodeRuntime: { ...state.nodeRuntime, [node.id]: { status: "running" } },
          logs: [...state.logs, makeLog("info", `${node.label}: started`, node.id)],
        }));

        await sleep(STEP_MS);

        // Mock data encodes the outcome: nodes marked failed/warning reproduce it.
        const outcome: PipelineNodeStatus =
          node.status === "failed" ? "failed" : node.status === "warning" ? "warning" : "success";

        set((state) => ({
          nodeRuntime: {
            ...state.nodeRuntime,
            [node.id]: {
              status: outcome,
              rowsProcessed: outcome === "failed" ? undefined : node.rowsProcessed,
              durationMs: node.durationMs,
            },
          },
          logs: [
            ...state.logs,
            outcome === "failed"
              ? makeLog("error", `${node.label}: failed — aborting pipeline`, node.id)
              : outcome === "warning"
                ? makeLog("warn", `${node.label}: completed with warnings`, node.id)
                : makeLog(
                    "info",
                    `${node.label}: completed${node.rowsProcessed ? ` (${node.rowsProcessed.toLocaleString("en-US")} rows)` : ""}`,
                    node.id,
                  ),
          ],
        }));

        if (outcome === "failed") {
          set((state) => ({
            isRunning: false,
            logs: [...state.logs, makeLog("error", `Pipeline "${pipeline.name}" failed`)],
          }));
          return;
        }
      }

      set((state) => ({
        isRunning: false,
        logs: [...state.logs, makeLog("info", `Pipeline "${pipeline.name}" completed`)],
      }));
    },
  },
}));

/** Dispatchers only — stable reference, never causes re-renders. */
export const usePipelineActions = () => usePipelineBuilderStore((s) => s.actions);
