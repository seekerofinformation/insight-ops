"use client";

import type { DatasetSchema } from "@/shared/types";
import { Card, Skeleton } from "@/shared/ui";

export function SchemaPanel({ schema }: { schema: DatasetSchema | undefined }) {
  return (
    <Card>
      <p className="mb-3 text-sm font-medium">Schema</p>
      {!schema ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {schema.columns.map((column) => (
            <li key={column.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-mono text-xs">{column.name}</span>
              <span className="text-muted shrink-0 text-xs">
                {column.type}
                {column.nullable ? " · nullable" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
