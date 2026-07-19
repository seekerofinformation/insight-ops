import "dotenv/config";
import { readFileSync } from "node:fs";
import { defineConfig } from "prisma/config";

function readSecret(name: string): string | undefined {
  const filePath = process.env[`${name}_FILE`];
  const directValue = process.env[name];
  if (filePath && directValue) throw new Error(`${name} and ${name}_FILE are mutually exclusive`);
  return (filePath ? readFileSync(filePath, "utf8") : directValue)?.trim() || undefined;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: readSecret("MIGRATION_DATABASE_URL") ?? readSecret("DATABASE_URL") ?? "",
  },
});
