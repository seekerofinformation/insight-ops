"use client";

import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../api/ai-api";

export function useGenerateSql() {
  return useMutation({ mutationFn: aiApi.generateSql });
}

export function useExplainDataset() {
  return useMutation({ mutationFn: aiApi.explainDataset });
}
