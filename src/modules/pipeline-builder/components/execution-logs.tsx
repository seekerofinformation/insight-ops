"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Card } from "@/shared/ui";
import { formatTime } from "@/shared/lib/formatters";
import { usePipelineBuilderStore } from "../store/pipeline-store";

const levelClasses = {
  info: "text-muted",
  warn: "text-warning",
  error: "text-critical",
} as const;

export function ExecutionLogs() {
  const logs = usePipelineBuilderStore((s) => s.logs);
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the newest log line visible while the simulation appends entries.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [logs.length]);

  return (
    <Card>
      <p className="mb-2 text-sm font-medium">Execution Logs</p>
      <div ref={listRef} className="max-h-48 space-y-1 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-muted">Run the pipeline to see execution logs.</p>
        ) : (
          logs.map((log) => (
            <p key={log.id} className={clsx("whitespace-nowrap", levelClasses[log.level])}>
              <span className="opacity-60">{formatTime(log.timestamp)}</span>{" "}
              <span className="uppercase">[{log.level}]</span> {log.message}
            </p>
          ))
        )}
      </div>
    </Card>
  );
}
