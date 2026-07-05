import type { IsoDateTime, Severity } from "./common";

export type AlertStatus = "new" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  source: string;
  timestamp: IsoDateTime;
  status: AlertStatus;
}
