import type { Metadata } from "next";
import { ExplorerView } from "@/modules/dataset-explorer/components/explorer-view";

export const metadata: Metadata = { title: "Dataset Explorer" };

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExplorerView datasetId={id} />;
}
