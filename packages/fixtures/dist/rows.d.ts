import type { DatasetSchema } from "@insightops/contracts";
/** A single row of a mock dataset; keys match the dataset schema columns. */
export type DatasetRow = Record<string, string | number | boolean | null>;
/**
 * Generates a stable set of mock rows for a dataset schema.
 * Cached per dataset: AgGrid gets the same array identity on re-fetches.
 */
export declare function generateRows(schema: DatasetSchema, count: number): DatasetRow[];
//# sourceMappingURL=rows.d.ts.map
