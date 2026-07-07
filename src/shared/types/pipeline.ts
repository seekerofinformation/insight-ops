import type { IsoDateTime } from "./common";

export type PipelineNodeType =
  | "source"
  | "cleaning"
  | "filter"
  | "join"
  | "validation"
  | "transformation"
  | "anomaly"
  | "output";

export type PipelineNodeStatus = "idle" | "running" | "success" | "warning" | "failed";

export interface PipelineNode {
  id: string;
  type: PipelineNodeType;
  label: string;
  status: PipelineNodeStatus;
  rowsProcessed?: number;
  durationMs?: number;
  config?: Record<string, unknown>;
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
}

export type PipelineStatus = "idle" | "running" | "success" | "failed";

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: PipelineStatus;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  lastRunAt?: IsoDateTime;
  updatedAt: IsoDateTime;
}

export type LogLevel = "info" | "warn" | "error";

export interface PipelineLogEntry {
  id: string;
  nodeId?: string;
  level: LogLevel;
  message: string;
  timestamp: IsoDateTime;
}
