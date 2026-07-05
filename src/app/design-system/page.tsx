import type { Metadata } from "next";

export const metadata: Metadata = { title: "Design System" };

export default function DesignSystemPage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Design System</h1>
      <p className="text-muted mt-2 text-sm">Reusable UI components used across InsightOps.</p>
    </section>
  );
}
