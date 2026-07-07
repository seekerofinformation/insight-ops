"use client";

import { useQuery } from "@tanstack/react-query";
import { pipelineApi } from "../api/pipeline-api";

export function usePipelines() {
  return useQuery({ queryKey: ["pipelines", "list"], queryFn: pipelineApi.getPipelines });
}
