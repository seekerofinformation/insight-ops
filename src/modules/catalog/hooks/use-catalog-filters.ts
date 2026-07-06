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
    return {
      query: searchParams.get("q") ?? "",
      domain: isOneOf(domain, DOMAIN_OPTIONS) ? domain : "all",
      sourceType: isOneOf(source, SOURCE_OPTIONS) ? source : "all",
      accessLevel: isOneOf(access, ACCESS_OPTIONS) ? access : "all",
      minQuality: Number.isFinite(minQuality) && minQuality > 0 ? minQuality : 0,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (next.query) params.set("q", next.query);
      if (next.domain !== "all") params.set("domain", next.domain);
      if (next.sourceType !== "all") params.set("source", next.sourceType);
      if (next.accessLevel !== "all") params.set("access", next.accessLevel);
      if (next.minQuality > 0) params.set("minQuality", String(next.minQuality));
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
