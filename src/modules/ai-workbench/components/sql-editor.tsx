"use client";

import Editor from "@monaco-editor/react";
import { Skeleton } from "@/shared/ui";

export interface SqlEditorProps {
  value: string;
  onChange?: (value: string) => void;
}

export default function SqlEditor({ value, onChange }: SqlEditorProps) {
  return (
    <Editor
      height="260px"
      language="sql"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      loading={<Skeleton className="h-64 w-full" />}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        scrollBeyondLastLine: false,
        padding: { top: 12 },
        automaticLayout: true,
      }}
    />
  );
}
