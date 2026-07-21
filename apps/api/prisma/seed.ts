import "dotenv/config";
import {
  MOCK_DATASETS,
  MOCK_PIPELINES,
  MOCK_QUALITY,
  MOCK_SCHEMAS,
  generateRows,
  getMockAlerts,
} from "@insightops/fixtures";
import {
  AlertSeverity,
  AlertStatus,
  ColumnType,
  DatasetAccessLevel,
  DatasetDomain,
  DatasetSensitivity,
  DatasetSourceType,
  PipelineNodeStatus,
  PipelineNodeType,
  PipelineStatus,
  type Prisma,
} from "../src/generated/prisma/client.js";
import type { prisma as PrismaClientInstance } from "../src/prisma.js";

let prismaClient: typeof PrismaClientInstance | undefined;

const datasetDomain = {
  "Smart City": DatasetDomain.SMART_CITY,
  Energy: DatasetDomain.ENERGY,
  Finance: DatasetDomain.FINANCE,
  "Public Safety": DatasetDomain.PUBLIC_SAFETY,
  IoT: DatasetDomain.IOT,
} as const;
const datasetSourceType = {
  API: DatasetSourceType.API,
  CSV: DatasetSourceType.CSV,
  Database: DatasetSourceType.DATABASE,
  Stream: DatasetSourceType.STREAM,
  "Data Lake": DatasetSourceType.DATA_LAKE,
} as const;
const datasetSensitivity = {
  Low: DatasetSensitivity.LOW,
  Medium: DatasetSensitivity.MEDIUM,
  High: DatasetSensitivity.HIGH,
} as const;
const datasetAccessLevel = {
  Open: DatasetAccessLevel.OPEN,
  Restricted: DatasetAccessLevel.RESTRICTED,
  Private: DatasetAccessLevel.PRIVATE,
} as const;
const columnType = {
  string: ColumnType.STRING,
  number: ColumnType.NUMBER,
  boolean: ColumnType.BOOLEAN,
  datetime: ColumnType.DATETIME,
} as const;
const pipelineStatus = {
  idle: PipelineStatus.IDLE,
  running: PipelineStatus.RUNNING,
  success: PipelineStatus.SUCCESS,
  failed: PipelineStatus.FAILED,
} as const;
const pipelineNodeType = {
  source: PipelineNodeType.SOURCE,
  cleaning: PipelineNodeType.CLEANING,
  filter: PipelineNodeType.FILTER,
  join: PipelineNodeType.JOIN,
  validation: PipelineNodeType.VALIDATION,
  transformation: PipelineNodeType.TRANSFORMATION,
  anomaly: PipelineNodeType.ANOMALY,
  output: PipelineNodeType.OUTPUT,
} as const;
const pipelineNodeStatus = {
  idle: PipelineNodeStatus.IDLE,
  running: PipelineNodeStatus.RUNNING,
  success: PipelineNodeStatus.SUCCESS,
  warning: PipelineNodeStatus.WARNING,
  failed: PipelineNodeStatus.FAILED,
} as const;
const alertSeverity = {
  info: AlertSeverity.INFO,
  warning: AlertSeverity.WARNING,
  critical: AlertSeverity.CRITICAL,
} as const;
const alertStatus = {
  new: AlertStatus.NEW,
  acknowledged: AlertStatus.ACKNOWLEDGED,
  resolved: AlertStatus.RESOLVED,
} as const;
const SEEDED_ROWS_PER_DATASET = 500;

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.ALLOW_DATABASE_SEED !== "true") {
    throw new Error(
      "Database seeding is development-only; use the prisma:seed script outside production",
    );
  }

  const { prisma } = await import("../src/prisma.js");
  prismaClient = prisma;
  const alerts = getMockAlerts(12);

  await prisma.$transaction(
    async (transaction) => {
      await transaction.alert.deleteMany();
      await transaction.pipelineEdge.deleteMany();
      await transaction.pipelineNode.deleteMany();
      await transaction.pipeline.deleteMany();
      await transaction.datasetQuality.deleteMany();
      await transaction.datasetColumn.deleteMany();
      await transaction.dataset.deleteMany();

      for (const dataset of MOCK_DATASETS) {
        const schema = MOCK_SCHEMAS[dataset.id];
        const quality = MOCK_QUALITY[dataset.id];
        if (!schema || !quality) throw new Error(`Missing mock metadata for ${dataset.id}`);
        const { datasetId, ...qualityData } = quality;
        if (datasetId !== dataset.id)
          throw new Error(`Mismatched quality metadata for ${dataset.id}`);

        await transaction.dataset.create({
          data: {
            id: dataset.id,
            name: dataset.name,
            description: dataset.description,
            domain: datasetDomain[dataset.domain],
            sourceType: datasetSourceType[dataset.sourceType],
            owner: dataset.owner,
            rowCount: dataset.rowCount,
            qualityScore: dataset.qualityScore,
            freshness: dataset.freshness,
            sensitivity: datasetSensitivity[dataset.sensitivity],
            accessLevel: datasetAccessLevel[dataset.accessLevel],
            tags: dataset.tags,
            searchText:
              `${dataset.name} ${dataset.description} ${dataset.owner} ${dataset.tags.join(" ")}`.toLowerCase(),
            updatedAt: new Date(dataset.updatedAt),
            columns: {
              create: schema.columns.map((column, ordinal) => ({
                ...column,
                ordinal,
                type: columnType[column.type],
              })),
            },
            quality: { create: qualityData },
          },
        });

        await transaction.datasetRecord.createMany({
          data: generateRows(schema, SEEDED_ROWS_PER_DATASET).map((data, ordinal) => ({
            datasetId: dataset.id,
            ordinal,
            data: data as Prisma.InputJsonObject,
          })),
        });
      }

      for (const pipeline of MOCK_PIPELINES) {
        await transaction.pipeline.create({
          data: {
            id: pipeline.id,
            name: pipeline.name,
            description: pipeline.description,
            status: pipelineStatus[pipeline.status],
            lastRunAt: pipeline.lastRunAt ? new Date(pipeline.lastRunAt) : null,
            updatedAt: new Date(pipeline.updatedAt),
            nodes: {
              create: pipeline.nodes.map((node) => ({
                nodeId: node.id,
                type: pipelineNodeType[node.type],
                label: node.label,
                status: pipelineNodeStatus[node.status],
                rowsProcessed: node.rowsProcessed,
                durationMs: node.durationMs,
                config: node.config as Prisma.InputJsonValue | undefined,
              })),
            },
            edges: {
              create: pipeline.edges.map((edge) => ({
                edgeId: edge.id,
                source: edge.source,
                target: edge.target,
              })),
            },
          },
        });
      }

      await transaction.alert.createMany({
        data: alerts.map((alert) => ({
          ...alert,
          severity: alertSeverity[alert.severity],
          status: alertStatus[alert.status],
          timestamp: new Date(alert.timestamp),
        })),
      });
    },
    { maxWait: 5_000, timeout: 60_000 },
  );

  console.info(
    JSON.stringify({
      event: "database_seeded",
      datasets: MOCK_DATASETS.length,
      pipelines: MOCK_PIPELINES.length,
      alerts: alerts.length,
      datasetRecords: MOCK_DATASETS.length * SEEDED_ROWS_PER_DATASET,
    }),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaClient?.$disconnect();
  });
