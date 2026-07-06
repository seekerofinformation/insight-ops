import { MOCK_SCHEMAS, generateRows, withLatency, type DatasetRow } from "@/shared/lib/mock-data";

export const DEFAULT_ROW_COUNT = 30_000;

export const datasetRowsApi = {
  /**
   * Returns the full mock row set for a dataset. Rows are generated once
   * per dataset (seeded + cached), so refetches keep the same data.
   */
  async getRows(datasetId: string, count = DEFAULT_ROW_COUNT): Promise<DatasetRow[]> {
    const schema = MOCK_SCHEMAS[datasetId];
    if (!schema) throw new Error(`Schema not found for dataset: ${datasetId}`);
    // Generation of 30k rows takes ~10ms; latency dominates like a real API.
    return withLatency(generateRows(schema, count), 600);
  },
};
