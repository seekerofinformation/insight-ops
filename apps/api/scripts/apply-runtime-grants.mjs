import pg from "pg";
import { readFileSync } from "node:fs";

const { Client } = pg;

function readSecret(name) {
  const filePath = process.env[`${name}_FILE`];
  const directValue = process.env[name];
  if (filePath && directValue) throw new Error(`${name} and ${name}_FILE are mutually exclusive`);
  return (filePath ? readFileSync(filePath, "utf8") : directValue)?.trim() || undefined;
}

const databaseUrl = readSecret("MIGRATION_DATABASE_URL") ?? readSecret("DATABASE_URL");
const appRole = process.env.APP_DATABASE_ROLE;

if (!databaseUrl) {
  throw new Error(
    "MIGRATION_DATABASE_URL or DATABASE_URL must be set when applying runtime database grants",
  );
}

if (!appRole || !/^[a-z_][a-z0-9_]*$/i.test(appRole)) {
  throw new Error("APP_DATABASE_ROLE must be a valid PostgreSQL role name");
}

const quotedAppRole = `"${appRole}"`;
const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${quotedAppRole}`);
  await client.query(
    `REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ${quotedAppRole}`,
  );
  await client.query(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${quotedAppRole}`,
  );
  await client.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${quotedAppRole}`);
  await client.query(
    `REVOKE ALL PRIVILEGES ON TABLE public."_prisma_migrations" FROM ${quotedAppRole}`,
  );
  await client.query("COMMIT");
  console.info(JSON.stringify({ event: "runtime_database_grants_applied", role: appRole }));
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
