"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { datasetApi } from "@/modules/catalog/api/dataset-api";
import { DEFAULT_ROWS_PAGE_SIZE, datasetRowsApi } from "../api/dataset-rows-api";

export function useDataset(id: string) {
  return useQuery({ queryKey: ["datasets", id], queryFn: () => datasetApi.getDatasetById(id) });
}

export function useDatasetSchema(id: string) {
  return useQuery({
    queryKey: ["datasets", id, "schema"],
    queryFn: () => datasetApi.getDatasetSchema(id),
  });
}

export function useDatasetQuality(id: string) {
  return useQuery({
    queryKey: ["datasets", id, "quality"],
    queryFn: () => datasetApi.getQualityMetrics(id),
  });
}

export function useDatasetRows(id: string) {
  return useInfiniteQuery({
    queryKey: ["datasets", id, "rows"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      datasetRowsApi.getRows(id, {
        page: pageParam,
        pageSize: DEFAULT_ROWS_PAGE_SIZE,
        sortOrder: "asc",
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    staleTime: 60_000,
  });
}
