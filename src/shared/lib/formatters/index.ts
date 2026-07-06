const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** "2026-07-06T08:45:00Z" → "08:45" (UTC, keeps mock data stable across timezones) */
export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

export function formatDurationMs(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}
