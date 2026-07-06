import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/modules/catalog/components/catalog-view";

export const metadata: Metadata = { title: "Dataset Catalog" };

export default function CatalogPage() {
  return (
    // Suspense boundary is required by useSearchParams during prerender
    <Suspense>
      <CatalogView />
    </Suspense>
  );
}
