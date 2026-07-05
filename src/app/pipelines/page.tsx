import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pipelines" };

export default function PipelinesPage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Pipeline Builder</h1>
      <p className="text-muted mt-2 text-sm">
        Visual low-code data pipelines with execution simulation.
      </p>
    </section>
  );
}
