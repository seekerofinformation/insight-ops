import type { Metadata } from "next";
import { ExplorerView } from "@/modules/dataset-explorer/components/explorer-view";
import { MOCK_DATASETS } from "@insightops/fixtures";

export const metadata: Metadata = { title: "Dataset Explorer" };

export function generateStaticParams() {
  return MOCK_DATASETS.map((dataset) => ({ id: dataset.id }));
}

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExplorerView datasetId={id} />;
}
