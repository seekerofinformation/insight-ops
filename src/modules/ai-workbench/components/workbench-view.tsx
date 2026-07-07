"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Card, EmptyState, PageHeader, Skeleton } from "@/shared/ui";
import { useDatasets } from "@/modules/catalog/hooks/use-datasets";
import {
  useDatasetQuality,
  useDatasetSchema,
} from "@/modules/dataset-explorer/hooks/use-dataset-explorer";
import type { AiDatasetContext } from "@/shared/lib/ai";
import { useExplainDataset, useGenerateSql } from "../hooks/use-ai-workbench";

// Monaco is the heaviest dependency in the app — client-only, lazy.
const SqlEditor = dynamic(() => import("./sql-editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const EXAMPLE_PROMPT =
  "Show districts with the highest number of critical incidents in the last 24 hours.";

export function WorkbenchView() {
  const { data: datasets } = useDatasets();
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const activeId = datasetId ?? datasets?.[0]?.id ?? null;

  const schema = useDatasetSchema(activeId ?? "");
  const quality = useDatasetQuality(activeId ?? "");
  const dataset = datasets?.find((d) => d.id === activeId);

  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [sql, setSql] = useState(
    "-- Generated SQL will appear here.\n-- Pick a dataset, describe what you need and press “Generate SQL”.",
  );

  const generateSql = useGenerateSql();
  const explainDataset = useExplainDataset();

  const context = useMemo<AiDatasetContext | null>(() => {
    if (!dataset || !schema.data) return null;
    return { dataset, schema: schema.data, quality: quality.data };
  }, [dataset, schema.data, quality.data]);

  const onGenerate = () => {
    if (!context || !prompt.trim()) return;
    setHistory((h) => (h.includes(prompt) ? h : [prompt, ...h].slice(0, 8)));
    generateSql.mutate({ context, prompt }, { onSuccess: (result) => setSql(result.sql) });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Workbench"
        description="Generate SQL, explain datasets and prototype transformations with AI assistance."
        actions={
          <select
            value={activeId ?? ""}
            onChange={(e) => setDatasetId(e.target.value)}
            aria-label="Select dataset"
            className="border-border bg-surface focus-visible:ring-accent h-9 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            {(datasets ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <label htmlFor="ai-prompt" className="mb-2 block text-sm font-medium">
              Prompt
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={EXAMPLE_PROMPT}
              rows={3}
              className="border-border bg-background focus-visible:ring-accent w-full rounded-md border p-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={onGenerate}
                disabled={!context || !prompt.trim() || generateSql.isPending}
              >
                {generateSql.isPending ? "Generating…" : "Generate SQL"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => context && explainDataset.mutate(context)}
                disabled={!context || explainDataset.isPending}
              >
                {explainDataset.isPending ? "Explaining…" : "Explain Dataset"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPrompt(EXAMPLE_PROMPT)}>
                Use example
              </Button>
            </div>
          </Card>

          <Card className="p-0">
            <p className="border-border border-b px-4 py-2 text-sm font-medium">SQL Editor</p>
            <SqlEditor value={sql} onChange={setSql} />
          </Card>

          {generateSql.data && (
            <Card>
              <p className="mb-2 text-sm font-medium">Result Preview</p>
              <p className="text-muted mb-3 text-xs">{generateSql.data.explanation}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted border-border border-b text-left text-xs uppercase">
                    {generateSql.data.preview.columns.map((c) => (
                      <th key={c} className="pb-2 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generateSql.data.preview.rows.map((row, i) => (
                    <tr key={i} className="border-border border-b last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="py-1.5 pr-3 tabular-nums">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <p className="mb-2 text-sm font-medium">AI Explanation</p>
            {explainDataset.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : explainDataset.data ? (
              <div className="space-y-3 text-sm">
                <p className="text-muted">{explainDataset.data.summary}</p>
                <ul className="list-disc space-y-1 pl-4">
                  {explainDataset.data.recommendations.map((rec) => (
                    <li key={rec}>{rec}</li>
                  ))}
                </ul>
                <p className="text-muted text-xs">
                  Confidence: {(explainDataset.data.confidence * 100).toFixed(0)}%
                </p>
              </div>
            ) : (
              <p className="text-muted text-sm">
                Press “Explain Dataset” to get an AI summary of the selected dataset.
              </p>
            )}
          </Card>

          <Card>
            <p className="mb-2 text-sm font-medium">Prompt History</p>
            {history.length === 0 ? (
              <EmptyState title="No prompts yet" description="Generated prompts appear here." />
            ) : (
              <ul className="space-y-1">
                {history.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setPrompt(item)}
                      className="text-muted hover:text-foreground hover:bg-surface-hover w-full truncate rounded px-2 py-1 text-left text-xs"
                      title={item}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
