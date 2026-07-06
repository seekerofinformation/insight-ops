"use client";

import { useState } from "react";
import { Button } from "@/shared/ui";
import { useDebouncedCallback } from "@/shared/lib/performance/debounce";
import {
  ACCESS_OPTIONS,
  DOMAIN_OPTIONS,
  MIN_QUALITY_OPTIONS,
  SOURCE_OPTIONS,
  hasActiveFilters,
  type CatalogFilters,
} from "../model/filters";

interface CatalogFiltersPanelProps {
  filters: CatalogFilters;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onReset: () => void;
}

const selectClass =
  "h-9 rounded-md border border-border bg-surface px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function CatalogFiltersPanel({ filters, onChange, onReset }: CatalogFiltersPanelProps) {
  // Local echo of the search input so typing is instant; URL updates are debounced.
  const [search, setSearch] = useState(filters.query);
  // Re-sync when the URL query changes externally (e.g. Clear filters, back button).
  const [prevQuery, setPrevQuery] = useState(filters.query);
  if (filters.query !== prevQuery) {
    setPrevQuery(filters.query);
    setSearch(filters.query);
  }
  const pushSearch = useDebouncedCallback((value: string) => onChange({ query: value }), 300);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          pushSearch(e.target.value);
        }}
        placeholder="Search datasets…"
        aria-label="Search datasets"
        className={`${selectClass} w-56`}
      />

      <select
        value={filters.domain}
        onChange={(e) => onChange({ domain: e.target.value as CatalogFilters["domain"] })}
        aria-label="Filter by domain"
        className={selectClass}
      >
        <option value="all">All domains</option>
        {DOMAIN_OPTIONS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={filters.sourceType}
        onChange={(e) => onChange({ sourceType: e.target.value as CatalogFilters["sourceType"] })}
        aria-label="Filter by source type"
        className={selectClass}
      >
        <option value="all">All sources</option>
        {SOURCE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={filters.accessLevel}
        onChange={(e) => onChange({ accessLevel: e.target.value as CatalogFilters["accessLevel"] })}
        aria-label="Filter by access level"
        className={selectClass}
      >
        <option value="all">All access levels</option>
        {ACCESS_OPTIONS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select
        value={filters.minQuality}
        onChange={(e) => onChange({ minQuality: Number(e.target.value) })}
        aria-label="Filter by minimum quality"
        className={selectClass}
      >
        {MIN_QUALITY_OPTIONS.map((q) => (
          <option key={q} value={q}>
            {q === 0 ? "Any quality" : `Quality ≥ ${q}%`}
          </option>
        ))}
      </select>

      {hasActiveFilters(filters) && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
