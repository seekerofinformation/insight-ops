import { readFileSync } from "node:fs";

/** Read a value directly or from the Docker/Kubernetes-style `<NAME>_FILE` path. */
export function readSecret(name: string): string | undefined {
  const filePath = process.env[`${name}_FILE`];
  const directValue = process.env[name];

  if (filePath && directValue) {
    throw new Error(`${name} and ${name}_FILE are mutually exclusive`);
  }

  const value = filePath ? readFileSync(filePath, "utf8").trim() : directValue?.trim();
  return value || undefined;
}

export function readRequiredSecret(name: string): string {
  const value = readSecret(name);
  if (!value) throw new Error(`${name} or ${name}_FILE must be set`);
  return value;
}
