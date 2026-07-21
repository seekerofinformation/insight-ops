// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiErrorSchema,
  listDatasetRowsResponseSchema,
  listDatasetsResponseSchema,
  type DataQualityMetrics,
  type Dataset,
  type DatasetSchema,
  type ListDatasetRowsQuery,
  type ListDatasetsQuery,
} from "@insightops/contracts";
import { createApp } from "../src/app.js";
import type { DatasetRepository } from "../src/modules/catalog/dataset-repository.js";

const dataset: Dataset = {
  id: "energy-consumption-telemetry",
  name: "Energy Consumption Telemetry",
  description: "Energy telemetry",
  domain: "Energy",
  sourceType: "API",
  owner: "Energy Platform",
  rowCount: 50_000,
  qualityScore: 91,
  freshness: "Updated 5 minutes ago",
  sensitivity: "Medium",
  accessLevel: "Restricted",
  tags: ["energy"],
  updatedAt: "2026-07-06T08:52:00.000Z",
};
const schema: DatasetSchema = {
  datasetId: dataset.id,
  columns: [{ name: "meter_id", type: "string", nullable: false }],
};
const quality: DataQualityMetrics = {
  datasetId: dataset.id,
  qualityScore: 91,
  missingValuesPct: 2.4,
  duplicateRows: 41,
  invalidRecords: 19,
  freshnessScore: 97,
  schemaConsistencyScore: 96,
  anomalyScore: 31,
};

function createRepository(): DatasetRepository {
  return {
    list: vi.fn(async (query: ListDatasetsQuery) => ({
      data: [dataset],
      meta: { page: query.page, pageSize: query.pageSize, total: 1, totalPages: 1 },
    })),
    findById: vi.fn(async (id: string) => (id === dataset.id ? dataset : null)),
    findSchema: vi.fn(async (id: string) => (id === dataset.id ? schema : null)),
    findQuality: vi.fn(async (id: string) => (id === dataset.id ? quality : null)),
    listRows: vi.fn(async (id: string, query: ListDatasetRowsQuery) =>
      id === dataset.id
        ? {
            data: [{ meter_id: "meter-100000" }],
            meta: { page: query.page, pageSize: query.pageSize, total: 1, totalPages: 1 },
          }
        : null,
    ),
  };
}

describe("dataset REST API", () => {
  let repository: DatasetRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = createRepository();
    app = createApp({
      datasetRepository: repository,
      allowedOrigins: ["http://127.0.0.1:3000"],
      logger: false,
    });
  });

  afterEach(async () => app.close());

  it("coerces and forwards pagination, filters and sorting", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/datasets?page=2&pageSize=5&domain=Energy&minQuality=80&sortBy=name&sortOrder=asc",
      headers: {
        origin: "http://127.0.0.1:3000",
        "x-request-id": "252751c8-28d1-4b9d-96e4-8669eaf0651b",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBe("252751c8-28d1-4b9d-96e4-8669eaf0651b");
    expect(response.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:3000");
    expect(listDatasetsResponseSchema.parse(response.json()).data).toEqual([dataset]);
    expect(repository.list).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 5,
        domain: "Energy",
        minQuality: 80,
        sortBy: "name",
        sortOrder: "asc",
      }),
    );
  });

  it("serves details, schema, quality and paginated rows", async () => {
    const base = `/v1/datasets/${dataset.id}`;
    const [detailsResponse, schemaResponse, qualityResponse, rowsResponse] = await Promise.all([
      app.inject({ method: "GET", url: base }),
      app.inject({ method: "GET", url: `${base}/schema` }),
      app.inject({ method: "GET", url: `${base}/quality` }),
      app.inject({ method: "GET", url: `${base}/rows?page=1&pageSize=25` }),
    ]);

    expect(detailsResponse.statusCode).toBe(200);
    expect(schemaResponse.json()).toEqual({ data: schema });
    expect(qualityResponse.json()).toEqual({ data: quality });
    expect(listDatasetRowsResponseSchema.parse(rowsResponse.json()).meta.pageSize).toBe(25);
  });

  it("returns the shared validation error contract for invalid or unknown query fields", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/datasets?pageSize=1000&unexpected=true",
    });
    const body = apiErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details?.length).toBeGreaterThan(0);
  });

  it("returns NOT_FOUND without leaking repository details", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/datasets/missing-dataset" });
    const body = apiErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("keeps framework 404 responses inside the shared error contract", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/unknown" });
    const body = apiErrorSchema.parse(response.json());
    expect(response.statusCode).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("rejects browser origins outside the allowlist", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/datasets",
      headers: { origin: "https://evil.example" },
    });
    expect(response.statusCode).toBe(403);
    expect(apiErrorSchema.parse(response.json()).error.code).toBe("FORBIDDEN");
  });
});
