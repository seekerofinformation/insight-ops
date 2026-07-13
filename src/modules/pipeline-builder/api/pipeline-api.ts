import { pipelineSchema, type Pipeline } from "@insightops/contracts";
import { MOCK_PIPELINES, withLatency } from "@/shared/lib/mock-data";

export const pipelineApi = {
  async getPipelines(): Promise<Pipeline[]> {
    return withLatency(MOCK_PIPELINES.map((pipeline) => pipelineSchema.parse(pipeline)));
  },

  async getPipelineById(id: string): Promise<Pipeline> {
    const pipeline = MOCK_PIPELINES.find((p) => p.id === id);
    if (!pipeline) throw new Error(`Pipeline not found: ${id}`);
    return withLatency(pipelineSchema.parse(pipeline));
  },
};
