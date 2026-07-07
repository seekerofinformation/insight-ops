import type { Metadata } from "next";
import { PipelineView } from "@/modules/pipeline-builder/components/pipeline-view";

export const metadata: Metadata = { title: "Pipelines" };

export default function PipelinesPage() {
  return <PipelineView />;
}
