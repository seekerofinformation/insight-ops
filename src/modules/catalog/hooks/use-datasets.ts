"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_FILTERS, type CatalogFilters } from "../model/filters";
import { datasetApi } from "../api/dataset-api";

export function useDatasets(filters: CatalogFilters = DEFAULT_FILTERS) {
  const query = {
    page: filters.page,
    pageSize: 12,
    q: filters.query || undefined,
    domain: filters.domain === "all" ? undefined : filters.domain,
    sourceType: filters.sourceType === "all" ? undefined : filters.sourceType,
    accessLevel: filters.accessLevel === "all" ? undefined : filters.accessLevel,
    minQuality: filters.minQuality || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  } as const;
  return useQuery({
    queryKey: ["datasets", "list", query],
    queryFn: () => datasetApi.getDatasets(query),
    placeholderData: keepPreviousData,
  });
}
