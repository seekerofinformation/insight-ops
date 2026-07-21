# InsightOps

InsightOps is a frontend prototype of an enterprise **AI Data Intelligence Workbench** — a single surface for exploring datasets, building data pipelines, monitoring operational health, and querying data through natural language with AI assistance.

The project is a feature-complete UI/UX and architecture prototype: all data is served from a deterministic, seeded mock layer instead of a live backend, so the entire experience is reproducible and works fully offline. The architecture, state management, and component boundaries are built as if a real backend and AI provider were being integrated tomorrow — the mock layer sits behind the exact same interfaces a production integration would use.

## What it does

- **Executive Dashboard** — key operational metrics, trend charts, recent alerts and pipeline run status at a glance.
- **Dataset Catalog** — browse and filter registered datasets by domain, source type, sensitivity and access level, with shareable, URL-driven filter state.
- **Dataset Explorer** — inspect a dataset at scale: a virtualized grid over tens of thousands of rows, its schema, and data-quality metrics side by side.
- **Pipeline Builder** — a node-based canvas for composing data pipelines, with a step-by-step execution simulation (success, warning and failure paths) and a live execution log.
- **AI Workbench** — describe what you need in natural language and get generated SQL with a live result preview, or ask for a plain-language explanation of a dataset, backed by a swappable AI provider abstraction.
- **Real-Time Monitoring** — a live event stream of operational alerts with acknowledge/resolve workflows and stream controls.

## Architecture

The codebase is organized **by business capability**, not by technical layer, so each feature is easy to reason about, test and eventually extract:

```
src/
  app/               # Thin route layer (Next.js App Router) — pages compose module views
  modules/           # One folder per business capability
    dashboard/
    catalog/
    dataset-explorer/
    pipeline-builder/
    ai-workbench/
    realtime-monitoring/
      api/           # Facade over the data source (mock today, real API tomorrow)
      hooks/         # TanStack Query hooks / mutations
      store/         # Module-scoped Zustand store, where local client state is needed
      model/         # Pure domain logic (filters, column definitions, etc.)
      components/    # Presentational + container components for this module
  shared/
    ui/              # Design system: Button, Card, StatusBadge, PageHeader, Skeleton, EmptyState...
    types/           # Domain types shared across modules (Dataset, Pipeline, Alert, ...)
    config/          # Route table, navigation config
    lib/
      mock-data/     # Frontend adapter + simulated latency over shared fixtures
      ai/            # AI provider abstraction (see below)
      formatters/    # Number/date/duration formatting
      performance/   # Debounce and similar cross-cutting utilities
```

Each module only exposes its `api`/`hooks` layer to the rest of the app — no module reaches into another module's internals. Cross-module reads (e.g. the dashboard pulling pipeline status) go through the owning module's public API.

### State management

State is deliberately segregated by nature, rather than funneled through one global store:

- **Server state** (anything that conceptually comes from a backend) — [TanStack Query](https://tanstack.com/query), with per-module API facades as the fetcher.
- **Domain/UI state that outlives a single component** (e.g. pipeline execution runtime, the live alert stream) — a module-scoped [Zustand](https://zustand-demo.pmnd.rs/) store. Stores split their surface into a stable `use<Module>Actions()` selector (dispatchers only, never causes re-renders) and granular state selectors, so components subscribe to exactly the slice they need.
- **Shareable UI state** (catalog filters) — the URL (`useSearchParams` + `router.replace`), so filtered views are linkable and bookmarkable.
- **Ephemeral local state** — plain `useState`, kept inside the component that owns it.

### AI provider abstraction

The AI Workbench is built against an `AiProvider` interface (`generate SQL`, `explain dataset`) rather than a concrete vendor SDK. Today `getAiProvider()` resolves to a `MockAiProvider` that deterministically parses prompts and computes real aggregations over the mock dataset rows, so the demo behaves consistently without any network calls or API keys. Swapping in a live LLM backend later means implementing the same interface and flipping the resolution in `getAiProvider()` — no call sites change. The context object passed to the provider is intentionally minimal (dataset metadata, schema, quality metrics) rather than raw data, in line with data-minimization practice for any future real integration.

### Mock data layer

Shared deterministic datasets, schemas, quality metrics, pipelines, alerts and dashboard metrics live in `packages/fixtures`. Both the frontend mock adapter and the development database seed consume that package, while domain types remain in `packages/contracts`. Row-level data for the Dataset Explorer is generated and cached per dataset/row-count pair to keep the virtualized grid fast at 30k+ rows. The frontend-only `withLatency()` helper stays under `src/shared/lib/mock-data`.

## Tech stack

- **Next.js 16** (App Router, Turbopack dev server), **React 19**, **TypeScript** (strict, `noUncheckedIndexedAccess`)
- **TanStack Query** for server-state caching; **Zustand** for module-scoped client state
- **AG Grid Community** for the virtualized dataset grid, **React Flow** for the pipeline canvas, **ECharts** for dashboard trend charts, **Monaco Editor** for the SQL editor — all lazy-loaded (`next/dynamic`, `ssr: false`) to keep the initial bundle lean
- **Tailwind CSS 4** with a token-based dark enterprise theme (CSS custom properties + `@theme inline`)
- **Vitest** + **React Testing Library** for unit tests, **Playwright** wired up for e2e
- **ESLint** (strict — `no-explicit-any` is an error) + **Prettier** (with the Tailwind class-sorting plugin), enforced pre-commit via **Husky** + **lint-staged**
- **Docker** (multi-stage, `output: standalone`) for containerized deployment

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs entirely on mock data — no environment variables or API keys are required for local development.

### Backend infrastructure

The stage-one backend is a separate Fastify workspace backed by PostgreSQL and Prisma. Copy `.env.example` to `.env`, replace every placeholder password, then start the local stack with `docker compose --env-file .env -f docker-compose.dev.yml up --build`. The frontend, API and PostgreSQL ports are bound to `127.0.0.1`; a one-shot `api-migrate` service applies committed Prisma migrations before the API starts.

Database privileges are split by responsibility: `insightops_migrator` owns schema changes, while `insightops_app` receives only runtime DML privileges and cannot access Prisma's migration history table. Production deployments should run the same `prisma:deploy:with-grants` command as a dedicated CI/CD or orchestrator job before rolling out API replicas.

The API Dockerfile has separate `runtime` and `migration` targets. The runtime target contains only compiled API code and production dependencies; Prisma CLI and build tools remain in the migration/build targets. Both containers run as UID/GID `10001`, with a read-only root filesystem, all Linux capabilities dropped and `no-new-privileges` enabled by Compose.

PostgreSQL initialization scripts only run for a new data volume. If the disposable local volume predates the separate database roles, recreate that volume before starting the updated stack. For a persistent environment, provision the two roles manually instead of deleting its volume.

`GET /health/live` reports process liveness. `GET /health/ready` checks the PostgreSQL connection and returns `503` until the database is available. JSON request logs include the Fastify request ID; callers may provide one through `X-Request-Id`.

The dataset vertical slice is available under `/v1/datasets`: catalog listing supports bounded page/page-size pagination, search, domain/source/access/quality filters and stable sorting; detail, schema, quality and paginated sample-row endpoints share runtime-validated contracts from `packages/contracts`. The frontend validates every backend response before exposing it to React Query.

`NEXT_PUBLIC_DATA_SOURCE` controls the frontend adapter: `api` requires the backend, `mock` is fully offline, and `fallback` uses mocks only for network or server (`5xx`) failures. Client and authorization errors are never hidden by fallback. `NEXT_PUBLIC_API_BASE_URL` is a build-time browser URL and must therefore be configured before building the frontend image.

For local Prisma work, set the host-side `DATABASE_URL`, then use:

```bash
npm run --workspace=@insightops/api prisma:migrate
npm run --workspace=@insightops/api prisma:seed
```

The seed reads `packages/fixtures`, so catalog metadata, pipelines and alerts remain aligned with the UI demo. It replaces all fixture-backed records inside one transaction and refuses to run when `NODE_ENV=production`; invoke it only through the explicit `prisma:seed` development script.

### Scripts

| Script                            | Description                      |
| --------------------------------- | -------------------------------- |
| `npm run dev`                     | Start the dev server (Turbopack) |
| `npm run build`                   | Production build                 |
| `npm run start`                   | Serve a production build         |
| `npm run lint` / `lint:fix`       | Lint the codebase                |
| `npm run format` / `format:check` | Format with Prettier             |
| `npm run typecheck`               | Type-check with `tsc --noEmit`   |
| `npm test` / `test:watch`         | Run unit tests with Vitest       |
| `npm run test:e2e`                | Run Playwright e2e tests         |

### Environment variables

```bash
cp .env.example .env.local
```

| Variable                               | Purpose                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Reserved for a future live AI provider integration; never read by the client bundle                             |
| `NEXT_PUBLIC_DEMO_MODE`                | `true` keeps the app on the deterministic mock AI provider; the switch point for a real backend once one exists |

## Deployment

The app supports two deployment targets from the same codebase, toggled by an environment flag rather than a fork:

### Docker (containerized / self-hosted)

The default build (`output: "standalone"`) produces a self-contained Next.js server suitable for any container host:

Production uses the separate `docker-compose.yml`. It does not publish PostgreSQL and reads database credentials from Compose secret files stored outside the repository. Set the non-secret role/database variables plus the five `*_SECRET_FILE` paths documented in `.env.example`, then run:

```bash
docker compose --env-file .env.production -f docker-compose.yml up --build
```

The secret URL files must use `postgres` as the hostname. In an orchestrated deployment, map the same `/run/secrets/*` paths from the platform secret manager and run the migration image as a deployment Job before API replicas.

This runs the multi-stage `Dockerfile` (deps → build → minimal Alpine runtime, non-root user) and exposes the app on port 3000. Inject any future AI-provider secrets through the deployment platform rather than storing them in a Compose env file.

### GitHub Pages (static export)

Since the entire app runs on client-side mock data with no server-only route handlers, it also builds as a fully static export:

```bash
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/insight-ops npm run build
```

This is automated by [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml): every push to `development` builds a static export (via `actions/configure-pages` + `actions/upload-pages-artifact`) and publishes it to GitHub Pages (`actions/deploy-pages`). Dynamic routes (`/datasets/[id]`) are pre-rendered for every mock dataset via `generateStaticParams`, so no server is required at runtime.

> GitHub Pages is meant for showcasing the current state of the UI. Once a real backend and AI provider are wired in, the Docker/standalone target is the one to run in production, since static export cannot serve API routes or perform SSR.

## Roadmap

The prototype is intentionally structured so the following can be added without restructuring existing modules:

- **Real backend integration** — replace each module's mock `api/` facade with calls to actual REST/GraphQL endpoints; the TanStack Query hooks and component layer do not need to change.
- **Live AI provider** — implement `AiProvider` against a real LLM (OpenAI/Anthropic) behind `/api/ai/*` route handlers, and flip `getAiProvider()`; the AI Workbench UI is already written against the interface, not the mock.
- **Authentication and authorization** — role-based access tied to the existing `accessLevel`/`sensitivity` fields already modeled on datasets.
- **Real-time transport** — swap the simulated `setTimeout` event stream in Real-Time Monitoring for a WebSocket/SSE connection; the store and feed UI are already decoupled from how events arrive.
- **Persisted pipeline execution** — move pipeline run history and logs from in-memory Zustand state to a persisted store once a backend exists.
- **Expanded test coverage** — component and e2e coverage for the remaining modules, building on the existing Vitest/Playwright setup.
- **Accessibility and internationalization passes** across all modules.
