"use client";

import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import type { DatasetSchema } from "@/shared/types";
import type { DatasetRow } from "@/shared/lib/mock-data";
import { buildColumnDefs } from "../model/column-defs";

ModuleRegistry.registerModules([AllCommunityModule]);

// Matches the app theme tokens in globals.css.
const gridTheme = themeQuartz.withParams({
  backgroundColor: "#111827",
  foregroundColor: "#e5e7eb",
  headerBackgroundColor: "#0b0f17",
  headerTextColor: "#9ca3af",
  borderColor: "#1f2937",
  accentColor: "#38bdf8",
  rowHoverColor: "#1a2333",
  fontSize: 13,
});

export interface ExplorerGridProps {
  schema: DatasetSchema;
  rows: DatasetRow[];
  quickFilter: string;
  onExportCsv?: (exportFn: () => void) => void;
}

export default function ExplorerGrid({
  schema,
  rows,
  quickFilter,
  onExportCsv,
}: ExplorerGridProps) {
  const gridRef = useRef<AgGridReact<DatasetRow>>(null);
  const columnDefs = useMemo(() => buildColumnDefs(schema), [schema]);

  return (
    <div className="h-full min-h-0">
      <AgGridReact<DatasetRow>
        ref={gridRef}
        theme={gridTheme}
        columnDefs={columnDefs}
        rowData={rows}
        quickFilterText={quickFilter}
        rowSelection={{ mode: "multiRow" }}
        defaultColDef={{ flex: 1 }}
        onGridReady={() => {
          onExportCsv?.(() =>
            gridRef.current?.api.exportDataAsCsv({ fileName: `${schema.datasetId}.csv` }),
          );
        }}
      />
    </div>
  );
}
