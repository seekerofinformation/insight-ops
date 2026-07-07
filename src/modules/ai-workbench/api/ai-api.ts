import { getAiProvider, type AiDatasetContext, type GenerateSqlInput } from "@/shared/lib/ai";

/**
 * AI API facade. In demo mode this resolves to the mock provider in-process;
 * in live mode the same calls would go to /api/ai/* route handlers.
 */
export const aiApi = {
  generateSql(input: GenerateSqlInput) {
    return getAiProvider().generateSql(input);
  },
  explainDataset(context: AiDatasetContext) {
    return getAiProvider().explainDataset(context);
  },
};
