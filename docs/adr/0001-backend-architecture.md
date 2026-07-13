# ADR-0001: Backend architecture foundation

- Status: Accepted
- Date: 2026-07-13

## Decision

InsightOps will be implemented as a **modular monolith**. The HTTP boundary is versioned REST under `/v1`; real-time, one-way updates use Server-Sent Events (SSE). PostgreSQL is the system of record, and BullMQ (backed by Redis) runs asynchronous and retryable work.

The codebase is an npm-workspace monorepo. `packages/contracts` is the sole shared HTTP boundary: it contains TypeScript DTOs and Zod schemas. Both the REST service and frontend validate data against these schemas at their boundaries.

## Rationale

The product needs transactional catalog, pipeline and alert workflows, but does not yet warrant deployment and operational overhead for independently deployed services. Modular boundaries preserve a future extraction path. REST fits resource-oriented reads and commands; SSE avoids polling for dashboard and execution events. PostgreSQL provides relational integrity and operational familiarity, while BullMQ isolates long-running pipeline execution, ingest and AI jobs from request handling.

## Module boundaries

- `catalog`: datasets, schemas and quality metrics
- `pipelines`: pipeline definitions, runs and logs
- `monitoring`: alerts and SSE event delivery
- `dashboard`: read models
- `ai`: request orchestration and provider integrations
- `platform`: authentication, request IDs, validation, error mapping, database and queues

Modules may call another module only through its public application interface; they must not reach into another module's persistence implementation. Cross-module side effects are published as domain events and processed asynchronously where request latency or retry semantics matter.

## Consequences

- API contracts evolve through additive changes within `/v1`; breaking changes require a new API version.
- Every request receives or is assigned an opaque UUID request ID and returns it in `X-Request-Id`.
- All non-2xx JSON responses use the shared `ApiError` envelope.
- SSE is for notifications only. Clients recover missed state with REST reads and `Last-Event-ID`; it is not a durable event log.
- PostgreSQL and Redis become required runtime dependencies when the API workspace is implemented.
