import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import { apiErrorSchema, type ErrorCode } from "@insightops/contracts";
import { HttpError } from "./http/errors.js";
import { registerDatasetRoutes } from "./modules/catalog/dataset-routes.js";
import type { DatasetRepository } from "./modules/catalog/dataset-repository.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CreateAppOptions {
  datasetRepository: DatasetRepository;
  checkReadiness?: () => Promise<void>;
  allowedOrigins?: readonly string[];
  logger?: boolean;
}

function errorCodeForStatus(statusCode: number): ErrorCode {
  if (statusCode === 400) return "VALIDATION_ERROR";
  if (statusCode === 401) return "UNAUTHORIZED";
  if (statusCode === 403) return "FORBIDDEN";
  if (statusCode === 404) return "NOT_FOUND";
  if (statusCode === 409) return "CONFLICT";
  if (statusCode === 429) return "RATE_LIMITED";
  return "INTERNAL_ERROR";
}

export function createApp(options: CreateAppOptions): FastifyInstance {
  const allowedOrigins = new Set(options.allowedOrigins ?? []);
  const app = Fastify({
    logger:
      options.logger === false
        ? false
        : {
            level: process.env.LOG_LEVEL ?? "info",
            base: { service: "insightops-api" },
            redact: ["req.headers.authorization", "req.headers.cookie"],
          },
    genReqId: (request) => {
      const requestId = request.headers["x-request-id"]?.toString();
      return requestId && UUID_PATTERN.test(requestId) ? requestId : randomUUID();
    },
  });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id);
    const origin = request.headers.origin;
    if (!origin) return;
    if (!allowedOrigins.has(origin)) {
      throw new HttpError(403, "FORBIDDEN", "Origin is not allowed");
    }
    reply.header("access-control-allow-origin", origin);
    reply.header("vary", "Origin");
  });

  app.setErrorHandler((error, request, reply) => {
    const knownError = error instanceof HttpError ? error : undefined;
    const frameworkStatus =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number" &&
      error.statusCode >= 400 &&
      error.statusCode < 500
        ? error.statusCode
        : undefined;
    const statusCode = knownError?.statusCode ?? frameworkStatus ?? 500;
    const errorMessage = error instanceof Error ? error.message : "Request failed";
    const body = apiErrorSchema.parse({
      error: {
        code: knownError?.code ?? errorCodeForStatus(statusCode),
        message: statusCode === 500 ? "Internal server error" : errorMessage,
        ...(knownError?.details && { details: knownError.details }),
      },
      requestId: request.id,
    });

    const logContext = { err: error, requestId: request.id, statusCode };
    if (statusCode >= 500) request.log.error(logContext, "request failed");
    else request.log.warn(logContext, "request rejected");
    return reply.code(statusCode).send(body);
  });

  app.setNotFoundHandler(async () => {
    throw new HttpError(404, "NOT_FOUND", "Route was not found");
  });

  app.get("/health/live", async () => ({ status: "ok" }));
  app.get("/health/ready", async (_request, reply) => {
    try {
      await options.checkReadiness?.();
      return { status: "ok" };
    } catch (error) {
      app.log.warn({ err: error }, "readiness check failed");
      return reply.code(503).send({ status: "not_ready" });
    }
  });

  registerDatasetRoutes(app, options.datasetRepository);
  return app;
}
