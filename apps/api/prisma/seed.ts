import "dotenv/config";
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
import { prisma } from "../src/prisma.js";
import {
  MOCK_DATASETS,
  MOCK_QUALITY,
  MOCK_SCHEMAS,
  MOCK_PIPELINES,
  getMockAlerts,
} from "../../../src/shared/lib/mock-data";

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

async function main() {
  await prisma.alert.deleteMany();
  await prisma.pipelineEdge.deleteMany();
  await prisma.pipelineNode.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.datasetQuality.deleteMany();
  await prisma.datasetColumn.deleteMany();
  await prisma.dataset.deleteMany();

  for (const dataset of MOCK_DATASETS) {
    const schema = MOCK_SCHEMAS[dataset.id];
    const quality = MOCK_QUALITY[dataset.id];
    if (!schema || !quality) throw new Error(`Missing mock metadata for ${dataset.id}`);
    const { datasetId: _datasetId, ...qualityData } = quality;

    await prisma.dataset.create({
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
        updatedAt: new Date(dataset.updatedAt),
        columns: {
          create: schema.columns.map((column) => ({ ...column, type: columnType[column.type] })),
        },
        quality: { create: qualityData },
      },
    });
  }

  for (const pipeline of MOCK_PIPELINES) {
    await prisma.pipeline.create({
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

  await prisma.alert.createMany({
    data: getMockAlerts(12).map((alert) => ({
      ...alert,
      severity: alertSeverity[alert.severity],
      status: alertStatus[alert.status],
      timestamp: new Date(alert.timestamp),
    })),
  });

  console.info(
    JSON.stringify({
      event: "database_seeded",
      datasets: MOCK_DATASETS.length,
      pipelines: MOCK_PIPELINES.length,
      alerts: 12,
    }),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
