import type { Dataset, DatasetSchema, DataQualityMetrics } from "@/shared/types";

/** Compact context object — never the full dataset (data minimization). */
export interface AiDatasetContext {
  dataset: Dataset;
  schema: DatasetSchema;
  quality?: DataQualityMetrics;
}

export interface GenerateSqlInput {
  context: AiDatasetContext;
  prompt: string;
}

export interface SqlResultPreview {
  columns: string[];
  rows: (string | number)[][];
}

export interface GenerateSqlResult {
  sql: string;
  explanation: string;
  preview: SqlResultPreview;
}

export interface ExplainDatasetResult {
  summary: string;
  recommendations: string[];
  /** 0–1 */
  confidence: number;
}

/**
 * Provider abstraction: the app depends on this contract, not on a vendor.
 * Implementations: MockAiProvider (demo mode), later OpenAI/Anthropic via API routes.
 */
export interface AiProvider {
  generateSql(input: GenerateSqlInput): Promise<GenerateSqlResult>;
  explainDataset(context: AiDatasetContext): Promise<ExplainDatasetResult>;
}
