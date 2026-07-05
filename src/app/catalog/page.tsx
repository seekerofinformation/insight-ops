import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dataset Catalog" };

export default function CatalogPage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Dataset Catalog</h1>
      <p className="text-muted mt-2 text-sm">
        Discover datasets by domain, source type, quality and access level.
      </p>
    </section>
  );
}
