import "dotenv/config";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { apiErrorSchema, type ErrorCode } from "@insightops/contracts";
import { prisma } from "./prisma.js";

const port = Number.parseInt(process.env.API_PORT ?? "4000", 10);
const host = process.env.API_HOST ?? "0.0.0.0";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const app = Fastify({
  logger: {
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
});

app.setErrorHandler((error, request, reply) => {
  const errorWithStatus = error as Error & { statusCode?: unknown };
  const statusCode =
    typeof errorWithStatus.statusCode === "number" && errorWithStatus.statusCode >= 400
      ? errorWithStatus.statusCode
      : 500;
  const code: ErrorCode = statusCode === 400 ? "VALIDATION_ERROR" : "INTERNAL_ERROR";
  const body = apiErrorSchema.parse({
    error: {
      code,
      message: statusCode === 500 ? "Internal server error" : errorWithStatus.message,
    },
    requestId: request.id,
  });

  request.log.error({ err: error, requestId: request.id, statusCode }, "request failed");
  return reply.code(statusCode).send(body);
});

app.get("/health/live", async () => ({ status: "ok" }));

app.get("/health/ready", async (_request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  } catch (error) {
    app.log.warn({ err: error }, "readiness check failed");
    return reply.code(503).send({ status: "not_ready" });
  }
});

async function start() {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error, "failed to start API service");
    process.exitCode = 1;
  }
}

void start();
