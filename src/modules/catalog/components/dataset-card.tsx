"use client";

import Link from "next/link";
import type { Dataset } from "@/shared/types";
import { Card, DataQualityBadge } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { formatNumber } from "@/shared/lib/formatters";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{dataset.name}</h3>
          <p className="text-muted mt-0.5 text-xs">
            {dataset.domain} · {dataset.sourceType} · {dataset.owner}
          </p>
        </div>
        <DataQualityBadge score={dataset.qualityScore} className="shrink-0" />
      </div>

      <p className="text-muted line-clamp-2 text-sm">{dataset.description}</p>

      <dl className="text-muted grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="uppercase">Rows</dt>
          <dd className="text-foreground mt-0.5 tabular-nums">{formatNumber(dataset.rowCount)}</dd>
        </div>
        <div>
          <dt className="uppercase">Access</dt>
          <dd className="text-foreground mt-0.5">{dataset.accessLevel}</dd>
        </div>
        <div>
          <dt className="uppercase">Freshness</dt>
          <dd className="text-foreground mt-0.5 truncate" title={dataset.freshness}>
            {dataset.freshness.replace("Updated ", "")}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {dataset.tags.map((tag) => (
            <span key={tag} className="bg-surface-hover text-muted rounded px-1.5 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={ROUTES.dataset(dataset.id)}
          className="text-accent shrink-0 text-sm font-medium hover:underline"
        >
          Explore →
        </Link>
      </div>
    </Card>
  );
}
