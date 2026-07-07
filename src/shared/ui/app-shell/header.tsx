"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "@/shared/config/routes";

export function Header() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isNavItemActive(item, pathname));

  return (
    <header className="border-border bg-surface flex h-14 shrink-0 items-center justify-between border-b px-6">
      <span className="text-sm font-medium">{current?.label ?? "InsightOps"}</span>
      <div className="flex items-center gap-3">
        <span className="border-border text-muted rounded-full border px-3 py-1 text-xs">
          Demo Mode
        </span>
        <span
          aria-label="User avatar"
          className="bg-surface-hover flex size-8 items-center justify-center rounded-full text-xs font-medium"
        >
          DA
        </span>
      </div>
    </header>
  );
}
