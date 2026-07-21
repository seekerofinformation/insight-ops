import type {
  DataQualityMetrics,
  Dataset,
  DatasetRow,
  DatasetSchema,
  ListDatasetRowsQuery,
  ListDatasetRowsResponse,
  ListDatasetsQuery,
  ListDatasetsResponse,
} from "@insightops/contracts";
import type {
  Dataset as DatabaseDataset,
  Prisma,
  PrismaClient,
} from "../../generated/prisma/client.js";

const domainToDatabase = {
  "Smart City": "SMART_CITY",
  Energy: "ENERGY",
  Finance: "FINANCE",
  "Public Safety": "PUBLIC_SAFETY",
  IoT: "IOT",
} as const;
const sourceTypeToDatabase = {
  API: "API",
  CSV: "CSV",
  Database: "DATABASE",
  Stream: "STREAM",
  "Data Lake": "DATA_LAKE",
} as const;
const accessLevelToDatabase = {
  Open: "OPEN",
  Restricted: "RESTRICTED",
  Private: "PRIVATE",
} as const;
const databaseDomain = {
  SMART_CITY: "Smart City",
  ENERGY: "Energy",
  FINANCE: "Finance",
  PUBLIC_SAFETY: "Public Safety",
  IOT: "IoT",
} as const;
const databaseSourceType = {
  API: "API",
  CSV: "CSV",
  DATABASE: "Database",
  STREAM: "Stream",
  DATA_LAKE: "Data Lake",
} as const;
const databaseSensitivity = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" } as const;
const databaseAccessLevel = {
  OPEN: "Open",
  RESTRICTED: "Restricted",
  PRIVATE: "Private",
} as const;
const databaseColumnType = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  DATETIME: "datetime",
} as const;

export interface DatasetRepository {
  list(query: ListDatasetsQuery): Promise<ListDatasetsResponse>;
  findById(datasetId: string): Promise<Dataset | null>;
  findSchema(datasetId: string): Promise<DatasetSchema | null>;
  findQuality(datasetId: string): Promise<DataQualityMetrics | null>;
  listRows(datasetId: string, query: ListDatasetRowsQuery): Promise<ListDatasetRowsResponse | null>;
}

export function buildDatasetWhere(query: ListDatasetsQuery): Prisma.DatasetWhereInput {
  const search = query.q?.trim();
  return {
    ...(query.domain && { domain: domainToDatabase[query.domain] }),
    ...(query.sourceType && { sourceType: sourceTypeToDatabase[query.sourceType] }),
    ...(query.accessLevel && { accessLevel: accessLevelToDatabase[query.accessLevel] }),
    ...(query.minQuality !== undefined && { qualityScore: { gte: query.minQuality } }),
    ...(search && {
      searchText: { contains: search.toLowerCase() },
    }),
  };
}

export function buildDatasetOrderBy(
  query: ListDatasetsQuery,
): Prisma.DatasetOrderByWithRelationInput[] {
  return [{ [query.sortBy]: query.sortOrder }, { id: "asc" }];
}

export function mapDataset(dataset: DatabaseDataset): Dataset {
  return {
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    domain: databaseDomain[dataset.domain],
    sourceType: databaseSourceType[dataset.sourceType],
    owner: dataset.owner,
    rowCount: dataset.rowCount,
    qualityScore: dataset.qualityScore,
    freshness: dataset.freshness,
    sensitivity: databaseSensitivity[dataset.sensitivity],
    accessLevel: databaseAccessLevel[dataset.accessLevel],
    tags: dataset.tags,
    updatedAt: dataset.updatedAt.toISOString(),
  };
}

export class PrismaDatasetRepository implements DatasetRepository {
  constructor(private readonly client: PrismaClient) {}

  async list(query: ListDatasetsQuery): Promise<ListDatasetsResponse> {
    const where = buildDatasetWhere(query);
    const [total, datasets] = await this.client.$transaction([
      this.client.dataset.count({ where }),
      this.client.dataset.findMany({
        where,
        orderBy: buildDatasetOrderBy(query),
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      data: datasets.map(mapDataset),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findById(datasetId: string): Promise<Dataset | null> {
    const dataset = await this.client.dataset.findUnique({ where: { id: datasetId } });
    return dataset ? mapDataset(dataset) : null;
  }

  async findSchema(datasetId: string): Promise<DatasetSchema | null> {
    const dataset = await this.client.dataset.findUnique({
      where: { id: datasetId },
      select: {
        id: true,
        columns: { orderBy: { ordinal: "asc" } },
      },
    });
    if (!dataset) return null;

    return {
      datasetId: dataset.id,
      columns: dataset.columns.map(({ name, type, nullable, description }) => ({
        name,
        type: databaseColumnType[type],
        nullable,
        ...(description && { description }),
      })),
    };
  }

  async findQuality(datasetId: string): Promise<DataQualityMetrics | null> {
    return this.client.datasetQuality.findUnique({ where: { datasetId } });
  }

  async listRows(
    datasetId: string,
    query: ListDatasetRowsQuery,
  ): Promise<ListDatasetRowsResponse | null> {
    const dataset = await this.client.dataset.findUnique({
      where: { id: datasetId },
      select: { id: true },
    });
    if (!dataset) return null;

    const [total, records] = await this.client.$transaction([
      this.client.datasetRecord.count({ where: { datasetId } }),
      this.client.datasetRecord.findMany({
        where: { datasetId },
        orderBy: { ordinal: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: { data: true },
      }),
    ]);

    return {
      data: records.map((record) => record.data as DatasetRow),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }
}
