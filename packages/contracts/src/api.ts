import { z } from "zod";
import {
  alertSchema,
  dataQualityMetricsSchema,
  datasetSchema,
  datasetStructureSchema,
  pipelineSchema,
} from "./domain";

export const listDatasetsResponseSchema = z.object({ data: z.array(datasetSchema) });
export const getDatasetResponseSchema = z.object({ data: datasetSchema });
export const getDatasetSchemaResponseSchema = z.object({ data: datasetStructureSchema });
export const getDatasetQualityResponseSchema = z.object({ data: dataQualityMetricsSchema });
export const listPipelinesResponseSchema = z.object({ data: z.array(pipelineSchema) });
export const getPipelineResponseSchema = z.object({ data: pipelineSchema });
export const listAlertsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(8),
});
export const listAlertsResponseSchema = z.object({ data: z.array(alertSchema) });
export const dashboardMetricsSchema = z.object({
  datasets: z.number().int().nonnegative(),
  activePipelines: z.number().int().nonnegative(),
  failedJobs: z.number().int().nonnegative(),
  avgDataQuality: z.number().min(0).max(100),
  anomaliesDetected: z.number().int().nonnegative(),
  liveEvents: z.number().int().nonnegative(),
});
export const trendPointSchema = z.object({ label: z.string().min(1), value: z.number() });
export const dashboardTrendsSchema = z.object({
  eventActivity: z.array(trendPointSchema),
  qualityTrend: z.array(trendPointSchema),
});
export const getDashboardMetricsResponseSchema = z.object({ data: dashboardMetricsSchema });
export const getDashboardTrendsResponseSchema = z.object({ data: dashboardTrendsSchema });
export const datasetRowSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);
export const listDatasetRowsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100_000).default(30_000),
});
export const listDatasetRowsResponseSchema = z.object({ data: z.array(datasetRowSchema) });
export const aiDatasetContextSchema = z.object({
  dataset: datasetSchema,
  schema: datasetStructureSchema,
  quality: dataQualityMetricsSchema.optional(),
});
export const generateSqlRequestSchema = z.object({
  context: aiDatasetContextSchema,
  prompt: z.string().min(1).max(10_000),
});
export const sqlResultPreviewSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.array(z.union([z.string(), z.number()]))),
});
export const generateSqlResponseSchema = z.object({
  sql: z.string(),
  explanation: z.string(),
  preview: sqlResultPreviewSchema,
});
export const explainDatasetResponseSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type ListDatasetsResponse = z.infer<typeof listDatasetsResponseSchema>;
export type GetDatasetResponse = z.infer<typeof getDatasetResponseSchema>;
export type GetDatasetSchemaResponse = z.infer<typeof getDatasetSchemaResponseSchema>;
export type GetDatasetQualityResponse = z.infer<typeof getDatasetQualityResponseSchema>;
export type ListPipelinesResponse = z.infer<typeof listPipelinesResponseSchema>;
export type GetPipelineResponse = z.infer<typeof getPipelineResponseSchema>;
export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
export type ListAlertsResponse = z.infer<typeof listAlertsResponseSchema>;
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export type TrendPoint = z.infer<typeof trendPointSchema>;
export type DashboardTrends = z.infer<typeof dashboardTrendsSchema>;
export type GetDashboardMetricsResponse = z.infer<typeof getDashboardMetricsResponseSchema>;
export type GetDashboardTrendsResponse = z.infer<typeof getDashboardTrendsResponseSchema>;
export type DatasetRow = z.infer<typeof datasetRowSchema>;
export type ListDatasetRowsQuery = z.infer<typeof listDatasetRowsQuerySchema>;
export type ListDatasetRowsResponse = z.infer<typeof listDatasetRowsResponseSchema>;
export type AiDatasetContext = z.infer<typeof aiDatasetContextSchema>;
export type GenerateSqlInput = z.infer<typeof generateSqlRequestSchema>;
export type SqlResultPreview = z.infer<typeof sqlResultPreviewSchema>;
export type GenerateSqlResult = z.infer<typeof generateSqlResponseSchema>;
export type ExplainDatasetResult = z.infer<typeof explainDatasetResponseSchema>;
