import type { Dataset, DatasetAccessLevel, DatasetDomain, DatasetSourceType } from "@/shared/types";

export interface CatalogFilters {
  query: string;
  domain: DatasetDomain | "all";
  sourceType: DatasetSourceType | "all";
  accessLevel: DatasetAccessLevel | "all";
  /** Minimum quality score, 0 = no filter */
  minQuality: number;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  query: "",
  domain: "all",
  sourceType: "all",
  accessLevel: "all",
  minQuality: 0,
};

export const DOMAIN_OPTIONS: DatasetDomain[] = [
  "Smart City",
  "Energy",
  "Finance",
  "Public Safety",
  "IoT",
];

export const SOURCE_OPTIONS: DatasetSourceType[] = [
  "API",
  "CSV",
  "Database",
  "Stream",
  "Data Lake",
];

export const ACCESS_OPTIONS: DatasetAccessLevel[] = ["Open", "Restricted", "Private"];

export const MIN_QUALITY_OPTIONS = [0, 70, 80, 90] as const;

export function applyFilters(datasets: Dataset[], filters: CatalogFilters): Dataset[] {
  const query = filters.query.trim().toLowerCase();
  return datasets.filter((dataset) => {
    if (filters.domain !== "all" && dataset.domain !== filters.domain) return false;
    if (filters.sourceType !== "all" && dataset.sourceType !== filters.sourceType) return false;
    if (filters.accessLevel !== "all" && dataset.accessLevel !== filters.accessLevel) return false;
    if (dataset.qualityScore < filters.minQuality) return false;
    if (query) {
      const haystack =
        `${dataset.name} ${dataset.description} ${dataset.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.query !== "" ||
    filters.domain !== "all" ||
    filters.sourceType !== "all" ||
    filters.accessLevel !== "all" ||
    filters.minQuality > 0
  );
}
