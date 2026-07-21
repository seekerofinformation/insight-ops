"use client";

import { Button, EmptyState, ErrorState, PageHeader, Skeleton } from "@/shared/ui";
import { useDatasets } from "../hooks/use-datasets";
import { useCatalogFilters } from "../hooks/use-catalog-filters";
import { DatasetCard } from "./dataset-card";
import { CatalogFiltersPanel } from "./catalog-filters";

export function CatalogView() {
  const { filters, setFilters, resetFilters } = useCatalogFilters();
  const { data, isPending, isError, isFetching, refetch } = useDatasets(filters);

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
      ) : !data || data.data.length === 0 ? (
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
            Showing {data.data.length} of {data.meta.total} datasets
            {isFetching ? " · Updating…" : ""}
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {data.data.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => setFilters({ page: filters.page - 1 })}
              >
                Previous
              </Button>
              <span className="text-muted text-xs tabular-nums">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page >= data.meta.totalPages}
                onClick={() => setFilters({ page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
