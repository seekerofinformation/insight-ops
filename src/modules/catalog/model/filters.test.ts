import { describe, expect, it } from "vitest";
import { MOCK_DATASETS } from "@/shared/lib/mock-data";
import { DEFAULT_FILTERS, applyFilters, hasActiveFilters } from "./filters";

describe("applyFilters", () => {
  it("returns everything with default filters", () => {
    expect(applyFilters(MOCK_DATASETS, DEFAULT_FILTERS)).toHaveLength(MOCK_DATASETS.length);
  });

  it("filters by domain", () => {
    const result = applyFilters(MOCK_DATASETS, { ...DEFAULT_FILTERS, domain: "Public Safety" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((d) => d.domain === "Public Safety")).toBe(true);
  });

  it("filters by minimum quality", () => {
    const result = applyFilters(MOCK_DATASETS, { ...DEFAULT_FILTERS, minQuality: 90 });
    expect(result.every((d) => d.qualityScore >= 90)).toBe(true);
  });

  it("searches across name, description and tags, case-insensitive", () => {
    const byTag = applyFilters(MOCK_DATASETS, { ...DEFAULT_FILTERS, query: "FRAUD" });
    expect(byTag.map((d) => d.id)).toEqual(["financial-risk-transactions"]);
  });

  it("combines filters with AND semantics", () => {
    const result = applyFilters(MOCK_DATASETS, {
      ...DEFAULT_FILTERS,
      domain: "Public Safety",
      minQuality: 90,
    });
    expect(result.map((d) => d.id)).toEqual(["public-safety-incidents"]);
  });
});

describe("hasActiveFilters", () => {
  it("is false for defaults and true when any filter is set", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, query: "x" })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, minQuality: 70 })).toBe(true);
  });
});
