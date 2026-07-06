import type { Metadata } from "next";
import { MOCK_DATASETS } from "@/shared/lib/mock-data/datasets";

export const metadata: Metadata = { title: "Dataset Explorer" };

export function generateStaticParams() {
  return MOCK_DATASETS.map((dataset) => ({ id: dataset.id }));
}

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section>
      <h1 className="text-xl font-semibold">Dataset Explorer</h1>
      <p className="text-muted mt-2 text-sm">
        High-performance exploration for dataset <span className="font-mono">{id}</span>.
      </p>
    </section>
  );
}
