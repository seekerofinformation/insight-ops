import { generateRows, withLatency } from "@/shared/lib/mock-data";
import type {
  AiDatasetContext,
  AiProvider,
  ExplainDatasetResult,
  GenerateSqlInput,
  GenerateSqlResult,
  SqlResultPreview,
} from "./provider";

const GROUP_CANDIDATES = ["district", "zone", "category", "severity", "merchant", "unit"];

function tableName(context: AiDatasetContext): string {
  return context.dataset.id.replaceAll("-", "_");
}

function pickGroupColumn(context: AiDatasetContext, prompt: string): string {
  const names = context.schema.columns.map((c) => c.name);
  const mentioned = names.find(
    (n) =>
      prompt.toLowerCase().includes(n.replaceAll("_", " ")) || prompt.toLowerCase().includes(n),
  );
  if (mentioned && context.schema.columns.find((c) => c.name === mentioned)?.type === "string") {
    return mentioned;
  }
  return GROUP_CANDIDATES.find((c) => names.includes(c)) ?? names[0] ?? "id";
}

/** Real aggregation over the seeded mock rows — the preview matches the data. */
function computePreview(
  context: AiDatasetContext,
  groupBy: string,
  where?: { column: string; value: string },
): SqlResultPreview {
  const rows = generateRows(context.schema, 2000);
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (where && row[where.column] !== where.value) continue;
    const key = String(row[groupBy] ?? "unknown");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { columns: [groupBy, "count"], rows: top };
}

export class MockAiProvider implements AiProvider {
  async generateSql(input: GenerateSqlInput): Promise<GenerateSqlResult> {
    const { context, prompt } = input;
    const lower = prompt.toLowerCase();
    const table = tableName(context);
    const groupBy = pickGroupColumn(context, prompt);
    const hasSeverity = context.schema.columns.some((c) => c.name === "severity");
    const hasTimestamp = context.schema.columns.some((c) => c.type === "datetime");

    const wantsCritical = hasSeverity && lower.includes("critical");
    const wantsRecent =
      hasTimestamp && (lower.includes("24") || lower.includes("recent") || lower.includes("last"));

    const whereParts = [
      wantsCritical ? `severity = 'critical'` : null,
      wantsRecent ? `timestamp >= NOW() - INTERVAL '24 hours'` : null,
    ].filter(Boolean);

    const sql = [
      `SELECT ${groupBy}, COUNT(*) AS total`,
      `FROM ${table}`,
      whereParts.length > 0 ? `WHERE ${whereParts.join("\n  AND ")}` : null,
      `GROUP BY ${groupBy}`,
      `ORDER BY total DESC`,
      `LIMIT 10;`,
    ]
      .filter(Boolean)
      .join("\n");

    const preview = computePreview(
      context,
      groupBy,
      wantsCritical ? { column: "severity", value: "critical" } : undefined,
    );

    const explanation =
      `Grouped ${context.dataset.name} by "${groupBy}" and counted matching records` +
      (wantsCritical ? ", filtered to critical severity" : "") +
      (wantsRecent ? ", limited to the last 24 hours" : "") +
      `. The preview below is computed over a 2,000-row sample.`;

    return withLatency({ sql, explanation, preview }, 700);
  }

  async explainDataset(context: AiDatasetContext): Promise<ExplainDatasetResult> {
    const { dataset, schema, quality } = context;
    const summary =
      `${dataset.name} contains ${dataset.rowCount.toLocaleString("en-US")} rows of ${dataset.domain} data ` +
      `from a ${dataset.sourceType} source, owned by ${dataset.owner}. ` +
      `The schema has ${schema.columns.length} columns` +
      (quality
        ? `. Overall quality is ${quality.qualityScore}%: ${quality.missingValuesPct}% missing values, ` +
          `${quality.duplicateRows} duplicates and an anomaly score of ${quality.anomalyScore}.`
        : ".");

    const recommendations = [
      quality && quality.missingValuesPct > 5
        ? `Add an imputation or filtering step — missing values (${quality.missingValuesPct}%) exceed the 5% threshold.`
        : `Missing values are within tolerance; no cleanup step required.`,
      quality && quality.anomalyScore > 30
        ? `Anomaly score is elevated (${quality.anomalyScore}); consider routing this dataset through the Anomaly Detection node.`
        : `Anomaly levels look normal for this domain.`,
      `Partition queries by "${schema.columns.find((c) => c.type === "datetime")?.name ?? "timestamp"}" for faster time-range scans.`,
    ];

    return withLatency({ summary, recommendations, confidence: 0.86 }, 700);
  }
}
