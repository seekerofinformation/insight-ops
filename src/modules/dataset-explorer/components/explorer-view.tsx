"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button, DataQualityBadge, ErrorState, PageHeader, Skeleton } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { formatNumber } from "@/shared/lib/formatters";
import { useDebouncedCallback } from "@/shared/lib/performance/debounce";
import {
  useDataset,
  useDatasetQuality,
  useDatasetRows,
  useDatasetSchema,
} from "../hooks/use-dataset-explorer";
import { SchemaPanel } from "./schema-panel";
import { QualityPanel } from "./quality-panel";

// AgGrid is heavy — load only on the client when the explorer opens.
const ExplorerGrid = dynamic(() => import("./explorer-grid"), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-96 w-full" />,
});

export function ExplorerView({ datasetId }: { datasetId: string }) {
  const dataset = useDataset(datasetId);
  const schema = useDatasetSchema(datasetId);
  const quality = useDatasetQuality(datasetId);
  const rows = useDatasetRows(datasetId);

  const [quickFilter, setQuickFilter] = useState("");
  const pushFilter = useDebouncedCallback(setQuickFilter, 250);
  const exportRef = useRef<(() => void) | null>(null);

  if (dataset.isError) {
    return (
      <ErrorState
        title="Dataset not found"
        description={`No dataset with id "${datasetId}".`}
        action={
          <Link href={ROUTES.catalog} className="text-accent text-sm underline">
            Back to catalog
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={dataset.data?.name ?? "Loading dataset…"}
        description={dataset.data?.description}
        actions={
          <>
            {dataset.data && <DataQualityBadge score={dataset.data.qualityScore} />}
            <Button variant="secondary" size="sm" onClick={() => exportRef.current?.()}>
              Export CSV
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Quick search across all columns…"
          aria-label="Quick search"
          onChange={(e) => pushFilter(e.target.value)}
          className="border-border bg-surface focus-visible:ring-accent h-9 w-72 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
        {rows.data && (
          <p className="text-muted text-xs tabular-nums">
            Rows loaded: {formatNumber(rows.data.length)} · Render mode: virtualized
          </p>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-h-96">
          {rows.isPending || !schema.data ? (
            <Skeleton className="h-full min-h-96 w-full" />
          ) : (
            <ExplorerGrid
              schema={schema.data}
              rows={rows.data ?? []}
              quickFilter={quickFilter}
              onExportCsv={(fn) => {
                exportRef.current = fn;
              }}
            />
          )}
        </div>
        <div className="space-y-4">
          <SchemaPanel schema={schema.data} />
          <QualityPanel quality={quality.data} />
        </div>
      </div>
    </div>
  );
}
