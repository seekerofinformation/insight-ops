import type { Metadata } from "next";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  MetricCard,
  MetricCardSkeleton,
  PageHeader,
  Skeleton,
  StatusBadge,
} from "@/shared/ui";

export const metadata: Metadata = { title: "Design System" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-muted mb-4 text-xs font-semibold tracking-wide uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div>
      <PageHeader
        title="Design System"
        description="Reusable UI components used across InsightOps."
        actions={<Button variant="secondary">Example action</Button>}
      />

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
        </div>
      </Section>

      <Section title="Status badges">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="idle" />
          <StatusBadge status="running" />
          <StatusBadge status="success" />
          <StatusBadge status="warning" />
          <StatusBadge status="failed" />
          <StatusBadge status="info" />
          <StatusBadge status="critical" />
          <StatusBadge status="success" label="Pipeline completed" />
        </div>
      </Section>

      <Section title="Metric cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Datasets"
            value={24}
            delta="+3"
            deltaTone="positive"
            hint="this week"
          />
          <MetricCard
            label="Failed Jobs"
            value={2}
            delta="+2"
            deltaTone="negative"
            hint="last 24h"
          />
          <MetricCard label="Avg Data Quality" value="87%" delta="stable" hint="all datasets" />
          <MetricCardSkeleton />
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-md">
          <p className="text-sm font-medium">Plain card</p>
          <p className="text-muted mt-1 text-sm">
            Base container for catalog items, panels and dashboard blocks.
          </p>
        </Card>
      </Section>

      <Section title="Skeletons">
        <div className="max-w-md space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Section>

      <Section title="Empty state">
        <div className="max-w-xl">
          <EmptyState
            title="No datasets found"
            description="Try adjusting the filters or clearing the search query."
            action={<Button variant="secondary">Clear filters</Button>}
          />
        </div>
      </Section>

      <Section title="Error state">
        <div className="max-w-xl">
          <ErrorState
            description="Failed to load dashboard metrics. The mock API returned an error."
            action={<Button variant="secondary">Retry</Button>}
          />
        </div>
      </Section>
    </div>
  );
}
