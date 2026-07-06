"use client";

import { useQuery } from "@tanstack/react-query";
import { datasetApi } from "../api/dataset-api";

export function useDatasets() {
  return useQuery({ queryKey: ["datasets", "list"], queryFn: datasetApi.getDatasets });
}
