"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ACCESS_OPTIONS,
  DEFAULT_FILTERS,
  DOMAIN_OPTIONS,
  SOURCE_OPTIONS,
  type CatalogFilters,
} from "../model/filters";

function isOneOf<T extends string>(value: string | null, options: readonly T[]): value is T {
  return value !== null && (options as readonly string[]).includes(value);
}

/**
 * Catalog filters live in the URL (?q=…&domain=…) so filtered views are
 * shareable and survive reloads — per the state architecture (URL state).
 */
export function useCatalogFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo<CatalogFilters>(() => {
    const domain = searchParams.get("domain");
    const source = searchParams.get("source");
    const access = searchParams.get("access");
    const minQuality = Number(searchParams.get("minQuality"));
    const page = Number(searchParams.get("page"));
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    return {
      query: searchParams.get("q") ?? "",
      domain: isOneOf(domain, DOMAIN_OPTIONS) ? domain : "all",
      sourceType: isOneOf(source, SOURCE_OPTIONS) ? source : "all",
      accessLevel: isOneOf(access, ACCESS_OPTIONS) ? access : "all",
      minQuality: Number.isFinite(minQuality) && minQuality > 0 ? minQuality : 0,
      page: Number.isInteger(page) && page > 0 ? page : 1,
      sortBy:
        sortBy === "name" ||
        sortBy === "updatedAt" ||
        sortBy === "qualityScore" ||
        sortBy === "rowCount"
          ? sortBy
          : "updatedAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      const changesQuery = Object.keys(patch).some((key) => key !== "page");
      const next = { ...filters, ...patch, page: changesQuery ? 1 : (patch.page ?? filters.page) };
      const params = new URLSearchParams();
      if (next.query) params.set("q", next.query);
      if (next.domain !== "all") params.set("domain", next.domain);
      if (next.sourceType !== "all") params.set("source", next.sourceType);
      if (next.accessLevel !== "all") params.set("access", next.accessLevel);
      if (next.minQuality > 0) params.set("minQuality", String(next.minQuality));
      if (next.page > 1) params.set("page", String(next.page));
      if (next.sortBy !== DEFAULT_FILTERS.sortBy) params.set("sortBy", next.sortBy);
      if (next.sortOrder !== DEFAULT_FILTERS.sortOrder) params.set("sortOrder", next.sortOrder);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, setFilters, resetFilters, defaults: DEFAULT_FILTERS };
}
