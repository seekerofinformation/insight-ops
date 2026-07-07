import type { IsoDateTime } from "./common";

export type AiInsightType = "dataset" | "chart" | "pipeline" | "alert";

export interface AiInsight {
  id: string;
  type: AiInsightType;
  title: string;
  summary: string;
  recommendations: string[];
  /** 0–1 */
  confidence: number;
  createdAt: IsoDateTime;
}
