import type { ColDef } from "ag-grid-community";
import type { DatasetSchema } from "@/shared/types";
import type { DatasetRow } from "@insightops/contracts";

function toHeaderName(name: string): string {
  return name.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds AgGrid column definitions from a dataset schema.
 * Includes light conditional formatting for operational readability.
 */
export function buildColumnDefs(schema: DatasetSchema): ColDef<DatasetRow>[] {
  return schema.columns.map((column, index): ColDef<DatasetRow> => {
    const def: ColDef<DatasetRow> = {
      field: column.name,
      headerName: toHeaderName(column.name),
      sortable: true,
      filter: true,
      resizable: true,
      pinned: index === 0 ? "left" : undefined,
      minWidth: 120,
    };

    if (column.type === "datetime") {
      def.valueFormatter = (p) =>
        typeof p.value === "string" ? p.value.slice(0, 16).replace("T", " ") : "";
      def.minWidth = 150;
    }

    if (column.type === "number") {
      def.type = "numericColumn";
      def.filter = "agNumberColumnFilter";
    }

    if (column.type === "boolean") {
      def.valueFormatter = (p) => (p.value === true ? "yes" : p.value === false ? "no" : "");
    }

    // Conditional formatting: highlight operationally important values.
    if (column.name === "severity") {
      def.cellClassRules = {
        "text-critical": (p) => p.value === "critical",
        "text-warning": (p) => p.value === "high",
      };
    }
    if (column.name.includes("score")) {
      def.cellClassRules = {
        "text-critical": (p) => typeof p.value === "number" && p.value >= 80,
        "text-warning": (p) => typeof p.value === "number" && p.value >= 60 && p.value < 80,
      };
    }

    return def;
  });
}
