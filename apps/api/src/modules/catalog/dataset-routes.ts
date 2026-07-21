import type { FastifyInstance } from "fastify";
import {
  datasetIdParamsSchema,
  getDatasetQualityResponseSchema,
  getDatasetResponseSchema,
  getDatasetSchemaResponseSchema,
  listDatasetRowsQuerySchema,
  listDatasetRowsResponseSchema,
  listDatasetsQuerySchema,
  listDatasetsResponseSchema,
} from "@insightops/contracts";
import { HttpError } from "../../http/errors.js";
import { parseInput } from "../../http/validation.js";
import type { DatasetRepository } from "./dataset-repository.js";

function requireResource<T>(resource: T | null, datasetId: string): T {
  if (resource) return resource;
  throw new HttpError(404, "NOT_FOUND", `Dataset '${datasetId}' was not found`);
}

export function registerDatasetRoutes(app: FastifyInstance, repository: DatasetRepository): void {
  app.get("/v1/datasets", async (request) => {
    const query = parseInput(listDatasetsQuerySchema, request.query);
    return listDatasetsResponseSchema.parse(await repository.list(query));
  });

  app.get("/v1/datasets/:datasetId", async (request) => {
    const { datasetId } = parseInput(datasetIdParamsSchema, request.params);
    const dataset = requireResource(await repository.findById(datasetId), datasetId);
    return getDatasetResponseSchema.parse({ data: dataset });
  });

  app.get("/v1/datasets/:datasetId/schema", async (request) => {
    const { datasetId } = parseInput(datasetIdParamsSchema, request.params);
    const schema = requireResource(await repository.findSchema(datasetId), datasetId);
    return getDatasetSchemaResponseSchema.parse({ data: schema });
  });

  app.get("/v1/datasets/:datasetId/quality", async (request) => {
    const { datasetId } = parseInput(datasetIdParamsSchema, request.params);
    const quality = requireResource(await repository.findQuality(datasetId), datasetId);
    return getDatasetQualityResponseSchema.parse({ data: quality });
  });

  app.get("/v1/datasets/:datasetId/rows", async (request) => {
    const { datasetId } = parseInput(datasetIdParamsSchema, request.params);
    const query = parseInput(listDatasetRowsQuerySchema, request.query);
    const rows = requireResource(await repository.listRows(datasetId, query), datasetId);
    return listDatasetRowsResponseSchema.parse(rows);
  });
}
