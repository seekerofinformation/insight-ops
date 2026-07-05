"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS, ROUTES, isNavItemActive } from "@/shared/config/routes";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-surface flex w-60 shrink-0 flex-col border-r">
      <div className="border-border flex h-14 items-center gap-2 border-b px-4">
        <span className="bg-accent text-background flex size-7 items-center justify-center rounded-md font-mono text-sm font-bold">
          IO
        </span>
        <Link href={ROUTES.dashboard} className="text-sm font-semibold tracking-wide">
          InsightOps
        </Link>
      </div>
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-hover text-accent font-medium"
                  : "text-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-border text-muted border-t p-4 text-xs">Demo mode · mock data</div>
    </aside>
  );
}
