import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Workbench" };

export default function AiWorkbenchPage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">AI Workbench</h1>
      <p className="text-muted mt-2 text-sm">
        SQL generation, dataset explanation and AI-assisted transformations.
      </p>
    </section>
  );
}
