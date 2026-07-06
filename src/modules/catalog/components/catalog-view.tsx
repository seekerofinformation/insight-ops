"use client";

import { useMemo } from "react";
import { Button, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/ui";
import { useDatasets } from "../hooks/use-datasets";
import { useCatalogFilters } from "../hooks/use-catalog-filters";
import { applyFilters } from "../model/filters";
import { DatasetCard } from "./dataset-card";
import { CatalogFiltersPanel } from "./catalog-filters";

export function CatalogView() {
  const { data, isPending, isError, refetch } = useDatasets();
  const { filters, setFilters, resetFilters } = useCatalogFilters();

  const filtered = useMemo(() => (data ? applyFilters(data, filters) : []), [data, filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dataset Catalog"
        description="Discover datasets by domain, source type, quality and access level."
      />

      <CatalogFiltersPanel filters={filters} onChange={setFilters} onReset={resetFilters} />

      {isError ? (
        <ErrorState
          title="Failed to load datasets"
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : isPending ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No datasets found"
          description="Try adjusting the filters or clearing the search query."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-muted text-xs">
            {filtered.length} of {data.length} datasets
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
