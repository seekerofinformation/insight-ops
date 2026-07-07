/** ISO 8601 date-time string, e.g. "2026-07-05T12:30:00Z" */
export type IsoDateTime = string;

export type Severity = "info" | "warning" | "critical";

export interface TimeRange {
  from: IsoDateTime;
  to: IsoDateTime;
}
