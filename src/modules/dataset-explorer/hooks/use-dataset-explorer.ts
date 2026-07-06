"use client";

import { useQuery } from "@tanstack/react-query";
import { datasetApi } from "@/modules/catalog/api/dataset-api";
import { datasetRowsApi } from "../api/dataset-rows-api";

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
  return useQuery({
    queryKey: ["datasets", id, "rows"],
    queryFn: () => datasetRowsApi.getRows(id),
    staleTime: Infinity, // rows are immutable mock data; never refetch 30k rows
  });
}
