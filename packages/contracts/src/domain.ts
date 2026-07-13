import { z } from "zod";

export const isoDateTimeSchema = z.iso.datetime({ offset: true });
export const severitySchema = z.enum(["info", "warning", "critical"]);
export const timeRangeSchema = z.object({ from: isoDateTimeSchema, to: isoDateTimeSchema });
export const datasetDomainSchema = z.enum([
  "Smart City",
  "Energy",
  "Finance",
  "Public Safety",
  "IoT",
]);
export const datasetSourceTypeSchema = z.enum(["API", "CSV", "Database", "Stream", "Data Lake"]);
export const datasetSensitivitySchema = z.enum(["Low", "Medium", "High"]);
export const datasetAccessLevelSchema = z.enum(["Open", "Restricted", "Private"]);
export const columnTypeSchema = z.enum(["string", "number", "boolean", "datetime"]);

export const datasetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  domain: datasetDomainSchema,
  sourceType: datasetSourceTypeSchema,
  owner: z.string().min(1),
  rowCount: z.number().int().nonnegative(),
  qualityScore: z.number().min(0).max(100),
  freshness: z.string().min(1),
  sensitivity: datasetSensitivitySchema,
  accessLevel: datasetAccessLevelSchema,
  tags: z.array(z.string()),
  updatedAt: isoDateTimeSchema,
});

export const datasetColumnSchema = z.object({
  name: z.string().min(1),
  type: columnTypeSchema,
  nullable: z.boolean(),
  description: z.string().optional(),
});

export const datasetStructureSchema = z.object({
  datasetId: z.string().min(1),
  columns: z.array(datasetColumnSchema),
});

export const dataQualityMetricsSchema = z.object({
  datasetId: z.string().min(1),
  qualityScore: z.number().min(0).max(100),
  missingValuesPct: z.number().min(0).max(100),
  duplicateRows: z.number().int().nonnegative(),
  invalidRecords: z.number().int().nonnegative(),
  freshnessScore: z.number().min(0).max(100),
  schemaConsistencyScore: z.number().min(0).max(100),
  anomalyScore: z.number().min(0).max(100),
});

export const alertStatusSchema = z.enum(["new", "acknowledged", "resolved"]);
export const alertSchema = z.object({
  id: z.string().min(1),
  severity: severitySchema,
  title: z.string().min(1),
  description: z.string(),
  source: z.string().min(1),
  timestamp: isoDateTimeSchema,
  status: alertStatusSchema,
});

export const aiInsightTypeSchema = z.enum(["dataset", "chart", "pipeline", "alert"]);
export const aiInsightSchema = z.object({
  id: z.string().min(1),
  type: aiInsightTypeSchema,
  title: z.string().min(1),
  summary: z.string(),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  createdAt: isoDateTimeSchema,
});

export const pipelineNodeTypeSchema = z.enum([
  "source",
  "cleaning",
  "filter",
  "join",
  "validation",
  "transformation",
  "anomaly",
  "output",
]);
export const pipelineNodeStatusSchema = z.enum(["idle", "running", "success", "warning", "failed"]);
export const pipelineNodeSchema = z.object({
  id: z.string().min(1),
  type: pipelineNodeTypeSchema,
  label: z.string().min(1),
  status: pipelineNodeStatusSchema,
  rowsProcessed: z.number().int().nonnegative().optional(),
  durationMs: z.number().nonnegative().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});
export const pipelineEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
});
export const pipelineStatusSchema = z.enum(["idle", "running", "success", "failed"]);
export const pipelineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  status: pipelineStatusSchema,
  nodes: z.array(pipelineNodeSchema),
  edges: z.array(pipelineEdgeSchema),
  lastRunAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema,
});
export const logLevelSchema = z.enum(["info", "warn", "error"]);
export const pipelineLogEntrySchema = z.object({
  id: z.string().min(1),
  nodeId: z.string().min(1).optional(),
  level: logLevelSchema,
  message: z.string(),
  timestamp: isoDateTimeSchema,
});

export type IsoDateTime = z.infer<typeof isoDateTimeSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type TimeRange = z.infer<typeof timeRangeSchema>;
export type DatasetDomain = z.infer<typeof datasetDomainSchema>;
export type DatasetSourceType = z.infer<typeof datasetSourceTypeSchema>;
export type DatasetSensitivity = z.infer<typeof datasetSensitivitySchema>;
export type DatasetAccessLevel = z.infer<typeof datasetAccessLevelSchema>;
export type ColumnType = z.infer<typeof columnTypeSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export type DatasetColumn = z.infer<typeof datasetColumnSchema>;
export type DatasetSchema = z.infer<typeof datasetStructureSchema>;
export type DataQualityMetrics = z.infer<typeof dataQualityMetricsSchema>;
export type AlertStatus = z.infer<typeof alertStatusSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type AiInsightType = z.infer<typeof aiInsightTypeSchema>;
export type AiInsight = z.infer<typeof aiInsightSchema>;
export type PipelineNodeType = z.infer<typeof pipelineNodeTypeSchema>;
export type PipelineNodeStatus = z.infer<typeof pipelineNodeStatusSchema>;
export type PipelineNode = z.infer<typeof pipelineNodeSchema>;
export type PipelineEdge = z.infer<typeof pipelineEdgeSchema>;
export type PipelineStatus = z.infer<typeof pipelineStatusSchema>;
export type Pipeline = z.infer<typeof pipelineSchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;
export type PipelineLogEntry = z.infer<typeof pipelineLogEntrySchema>;
