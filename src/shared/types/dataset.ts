import type { IsoDateTime } from "./common";

export type DatasetDomain = "Smart City" | "Energy" | "Finance" | "Public Safety" | "IoT";

export type DatasetSourceType = "API" | "CSV" | "Database" | "Stream" | "Data Lake";

export type DatasetSensitivity = "Low" | "Medium" | "High";

export type DatasetAccessLevel = "Open" | "Restricted" | "Private";

export interface Dataset {
  id: string;
  name: string;
  description: string;
  domain: DatasetDomain;
  sourceType: DatasetSourceType;
  owner: string;
  rowCount: number;
  /** 0–100 */
  qualityScore: number;
  /** Human-readable freshness, e.g. "Updated 12 minutes ago" */
  freshness: string;
  sensitivity: DatasetSensitivity;
  accessLevel: DatasetAccessLevel;
  tags: string[];
  updatedAt: IsoDateTime;
}

export type ColumnType = "string" | "number" | "boolean" | "datetime";

export interface DatasetColumn {
  name: string;
  type: ColumnType;
  nullable: boolean;
  description?: string;
}

export interface DatasetSchema {
  datasetId: string;
  columns: DatasetColumn[];
}

export interface DataQualityMetrics {
  datasetId: string;
  /** 0–100 */
  qualityScore: number;
  /** Percentage, 0–100 */
  missingValuesPct: number;
  duplicateRows: number;
  invalidRecords: number;
  /** 0–100 */
  freshnessScore: number;
  /** 0–100 */
  schemaConsistencyScore: number;
  /** 0–100, higher = more anomalous */
  anomalyScore: number;
}
