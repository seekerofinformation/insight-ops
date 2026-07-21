import {
  listDatasetRowsResponseSchema,
  type ListDatasetRowsQuery,
  type ListDatasetRowsResponse,
} from "@insightops/contracts";
import { MOCK_SCHEMAS, generateRows, withLatency } from "@/shared/lib/mock-data";
import { resolveDataSource } from "@/shared/lib/api/data-source";
import { fetchApi } from "@/shared/lib/api/http-client";

export const DEFAULT_ROWS_PAGE_SIZE = 100;

function getMockRows(datasetId: string, query: ListDatasetRowsQuery): ListDatasetRowsResponse {
  const schema = MOCK_SCHEMAS[datasetId];
  if (!schema) throw new Error(`Schema not found for dataset: ${datasetId}`);
  const datasetSize = 500;
  const rows = generateRows(schema, datasetSize);
  const ordered = query.sortOrder === "desc" ? [...rows].reverse() : rows;
  const start = (query.page - 1) * query.pageSize;
  return listDatasetRowsResponseSchema.parse({
    data: ordered.slice(start, start + query.pageSize),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: datasetSize,
      totalPages: Math.ceil(datasetSize / query.pageSize),
    },
  });
}

export const datasetRowsApi = {
  async getRows(datasetId: string, query: ListDatasetRowsQuery): Promise<ListDatasetRowsResponse> {
    const params = new URLSearchParams({
      page: String(query.page),
      pageSize: String(query.pageSize),
      sortOrder: query.sortOrder,
    });
    return resolveDataSource(
      () =>
        fetchApi(
          `/datasets/${encodeURIComponent(datasetId)}/rows?${params}`,
          listDatasetRowsResponseSchema,
        ),
      () => withLatency(getMockRows(datasetId, query), 300),
    );
  },
};
