import "dotenv/config";
import { createApp } from "./app.js";
import { PrismaDatasetRepository } from "./modules/catalog/dataset-repository.js";
import { prisma } from "./prisma.js";

const port = Number.parseInt(process.env.API_PORT ?? "4000", 10);
const host = process.env.API_HOST ?? "0.0.0.0";
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = createApp({
  datasetRepository: new PrismaDatasetRepository(prisma),
  checkReadiness: async () => {
    await prisma.$queryRaw`SELECT 1`;
  },
  allowedOrigins,
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, "shutting down API service");
  await app.close();
  await prisma.$disconnect();
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error, "failed to start API service");
  process.exitCode = 1;
}
