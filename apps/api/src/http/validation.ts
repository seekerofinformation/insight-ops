import type { z } from "zod";
import { HttpError } from "./errors.js";

export function parseInput<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  throw new HttpError(
    400,
    "VALIDATION_ERROR",
    "Request validation failed",
    result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  );
}
