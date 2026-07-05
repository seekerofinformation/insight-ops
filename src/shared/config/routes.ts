export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  catalog: "/catalog",
  dataset: (id: string) => `/datasets/${id}`,
  pipelines: "/pipelines",
  aiWorkbench: "/ai-workbench",
  monitoring: "/monitoring",
  designSystem: "/design-system",
} as const;

export const API_ROUTES = {
  aiGenerateSql: "/api/ai/generate-sql",
  aiExplainDataset: "/api/ai/explain-dataset",
  aiExplainChart: "/api/ai/explain-chart",
  aiSuggestPipelineStep: "/api/ai/suggest-pipeline-step",
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Matches nested paths too, e.g. /datasets/:id highlights "Catalog" */
  activePrefix?: string;
}

/** Sidebar navigation, in display order. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "Dataset Catalog", href: ROUTES.catalog, activePrefix: "/datasets" },
  { label: "Pipelines", href: ROUTES.pipelines },
  { label: "AI Workbench", href: ROUTES.aiWorkbench },
  { label: "Monitoring", href: ROUTES.monitoring },
  { label: "Design System", href: ROUTES.designSystem },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.activePrefix !== undefined && pathname.startsWith(item.activePrefix))
  );
}
