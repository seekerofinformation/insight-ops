-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DatasetDomain" AS ENUM ('Smart City', 'Energy', 'Finance', 'Public Safety', 'IoT');
CREATE TYPE "DatasetSourceType" AS ENUM ('API', 'CSV', 'Database', 'Stream', 'Data Lake');
CREATE TYPE "DatasetSensitivity" AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE "DatasetAccessLevel" AS ENUM ('Open', 'Restricted', 'Private');
CREATE TYPE "ColumnType" AS ENUM ('string', 'number', 'boolean', 'datetime');
CREATE TYPE "PipelineStatus" AS ENUM ('idle', 'running', 'success', 'failed');
CREATE TYPE "PipelineNodeType" AS ENUM ('source', 'cleaning', 'filter', 'join', 'validation', 'transformation', 'anomaly', 'output');
CREATE TYPE "PipelineNodeStatus" AS ENUM ('idle', 'running', 'success', 'warning', 'failed');
CREATE TYPE "AlertSeverity" AS ENUM ('info', 'warning', 'critical');
CREATE TYPE "AlertStatus" AS ENUM ('new', 'acknowledged', 'resolved');

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" "DatasetDomain" NOT NULL,
    "sourceType" "DatasetSourceType" NOT NULL,
    "owner" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "freshness" TEXT NOT NULL,
    "sensitivity" "DatasetSensitivity" NOT NULL,
    "accessLevel" "DatasetAccessLevel" NOT NULL,
    "tags" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasetColumn" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ColumnType" NOT NULL,
    "nullable" BOOLEAN NOT NULL,
    "description" TEXT,
    CONSTRAINT "DatasetColumn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasetQuality" (
    "datasetId" TEXT NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "missingValuesPct" DOUBLE PRECISION NOT NULL,
    "duplicateRows" INTEGER NOT NULL,
    "invalidRecords" INTEGER NOT NULL,
    "freshnessScore" DOUBLE PRECISION NOT NULL,
    "schemaConsistencyScore" DOUBLE PRECISION NOT NULL,
    "anomalyScore" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "DatasetQuality_pkey" PRIMARY KEY ("datasetId")
);

CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "PipelineStatus" NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PipelineNode" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "type" "PipelineNodeType" NOT NULL,
    "label" TEXT NOT NULL,
    "status" "PipelineNodeStatus" NOT NULL,
    "rowsProcessed" INTEGER,
    "durationMs" INTEGER,
    "config" JSONB,
    CONSTRAINT "PipelineNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PipelineEdge" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "edgeId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    CONSTRAINT "PipelineEdge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "AlertStatus" NOT NULL,
    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Dataset_updatedAt_idx" ON "Dataset"("updatedAt");
CREATE UNIQUE INDEX "DatasetColumn_datasetId_name_key" ON "DatasetColumn"("datasetId", "name");
CREATE INDEX "Pipeline_updatedAt_idx" ON "Pipeline"("updatedAt");
CREATE UNIQUE INDEX "PipelineNode_pipelineId_nodeId_key" ON "PipelineNode"("pipelineId", "nodeId");
CREATE UNIQUE INDEX "PipelineEdge_pipelineId_edgeId_key" ON "PipelineEdge"("pipelineId", "edgeId");
CREATE INDEX "Alert_timestamp_idx" ON "Alert"("timestamp");

ALTER TABLE "DatasetColumn" ADD CONSTRAINT "DatasetColumn_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DatasetQuality" ADD CONSTRAINT "DatasetQuality_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PipelineNode" ADD CONSTRAINT "PipelineNode_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PipelineEdge" ADD CONSTRAINT "PipelineEdge_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
