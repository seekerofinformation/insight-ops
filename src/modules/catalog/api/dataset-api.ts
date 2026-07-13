import {
  dataQualityMetricsSchema,
  datasetSchema,
  datasetStructureSchema,
  type DataQualityMetrics,
  type Dataset,
  type DatasetSchema,
} from "@insightops/contracts";
import { MOCK_DATASETS, MOCK_QUALITY, MOCK_SCHEMAS, withLatency } from "@/shared/lib/mock-data";

/**
 * Dataset API facade. The UI never knows data is mocked — swapping this
 * for real HTTP calls later does not touch any component.
 */
export const datasetApi = {
  async getDatasets(): Promise<Dataset[]> {
    return withLatency(MOCK_DATASETS.map((dataset) => datasetSchema.parse(dataset)));
  },

  async getDatasetById(id: string): Promise<Dataset> {
    const dataset = MOCK_DATASETS.find((d) => d.id === id);
    if (!dataset) throw new Error(`Dataset not found: ${id}`);
    return withLatency(datasetSchema.parse(dataset));
  },

  async getDatasetSchema(id: string): Promise<DatasetSchema> {
    const schema = MOCK_SCHEMAS[id];
    if (!schema) throw new Error(`Schema not found for dataset: ${id}`);
    return withLatency(datasetStructureSchema.parse(schema));
  },

  async getQualityMetrics(id: string): Promise<DataQualityMetrics> {
    const metrics = MOCK_QUALITY[id];
    if (!metrics) throw new Error(`Quality metrics not found for dataset: ${id}`);
    return withLatency(dataQualityMetricsSchema.parse(metrics));
  },
};
