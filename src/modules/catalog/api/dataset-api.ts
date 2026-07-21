import {
  dataQualityMetricsSchema,
  datasetSchema,
  datasetStructureSchema,
  getDatasetQualityResponseSchema,
  getDatasetResponseSchema,
  getDatasetSchemaResponseSchema,
  listDatasetsResponseSchema,
  type DataQualityMetrics,
  type Dataset,
  type DatasetSchema,
  type ListDatasetsQuery,
  type ListDatasetsResponse,
} from "@insightops/contracts";
import { MOCK_DATASETS, MOCK_QUALITY, MOCK_SCHEMAS, withLatency } from "@/shared/lib/mock-data";
import { resolveDataSource } from "@/shared/lib/api/data-source";
import { fetchApi } from "@/shared/lib/api/http-client";

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

function getMockDatasets(query: ListDatasetsQuery): ListDatasetsResponse {
  const search = query.q?.toLowerCase();
  const filtered = MOCK_DATASETS.filter((dataset) => {
    if (query.domain && dataset.domain !== query.domain) return false;
    if (query.sourceType && dataset.sourceType !== query.sourceType) return false;
    if (query.accessLevel && dataset.accessLevel !== query.accessLevel) return false;
    if (query.minQuality !== undefined && dataset.qualityScore < query.minQuality) return false;
    if (
      search &&
      !`${dataset.name} ${dataset.description} ${dataset.owner} ${dataset.tags.join(" ")}`
        .toLowerCase()
        .includes(search)
    )
      return false;
    return true;
  }).sort((left, right) => {
    const leftValue = left[query.sortBy];
    const rightValue = right[query.sortBy];
    const result =
      typeof leftValue === "string"
        ? leftValue.localeCompare(String(rightValue))
        : Number(leftValue) - Number(rightValue);
    const directed = query.sortOrder === "asc" ? result : -result;
    return directed || left.id.localeCompare(right.id);
  });
  const start = (query.page - 1) * query.pageSize;

  return listDatasetsResponseSchema.parse({
    data: filtered.slice(start, start + query.pageSize),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / query.pageSize),
    },
  });
}

export const datasetApi = {
  async getDatasets(query: ListDatasetsQuery): Promise<ListDatasetsResponse> {
    return resolveDataSource(
      () => fetchApi(`/datasets?${queryString(query)}`, listDatasetsResponseSchema),
      () => withLatency(getMockDatasets(query)),
    );
  },

  async getDatasetById(id: string): Promise<Dataset> {
    return resolveDataSource(
      async () =>
        (await fetchApi(`/datasets/${encodeURIComponent(id)}`, getDatasetResponseSchema)).data,
      async () => {
        const dataset = MOCK_DATASETS.find((candidate) => candidate.id === id);
        if (!dataset) throw new Error(`Dataset not found: ${id}`);
        return withLatency(datasetSchema.parse(dataset));
      },
    );
  },

  async getDatasetSchema(id: string): Promise<DatasetSchema> {
    return resolveDataSource(
      async () =>
        (
          await fetchApi(
            `/datasets/${encodeURIComponent(id)}/schema`,
            getDatasetSchemaResponseSchema,
          )
        ).data,
      async () => {
        const schema = MOCK_SCHEMAS[id];
        if (!schema) throw new Error(`Schema not found for dataset: ${id}`);
        return withLatency(datasetStructureSchema.parse(schema));
      },
    );
  },

  async getQualityMetrics(id: string): Promise<DataQualityMetrics> {
    return resolveDataSource(
      async () =>
        (
          await fetchApi(
            `/datasets/${encodeURIComponent(id)}/quality`,
            getDatasetQualityResponseSchema,
          )
        ).data,
      async () => {
        const metrics = MOCK_QUALITY[id];
        if (!metrics) throw new Error(`Quality metrics not found for dataset: ${id}`);
        return withLatency(dataQualityMetricsSchema.parse(metrics));
      },
    );
  },
};
