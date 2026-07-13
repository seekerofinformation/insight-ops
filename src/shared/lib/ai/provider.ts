import type {
  AiDatasetContext,
  ExplainDatasetResult,
  GenerateSqlInput,
  GenerateSqlResult,
  SqlResultPreview,
} from "@insightops/contracts";

export type {
  AiDatasetContext,
  ExplainDatasetResult,
  GenerateSqlInput,
  GenerateSqlResult,
  SqlResultPreview,
};

/**
 * Provider abstraction: the app depends on this contract, not on a vendor.
 * Implementations: MockAiProvider (demo mode), later OpenAI/Anthropic via API routes.
 */
export interface AiProvider {
  generateSql(input: GenerateSqlInput): Promise<GenerateSqlResult>;
  explainDataset(context: AiDatasetContext): Promise<ExplainDatasetResult>;
}
