import { apiErrorSchema, type ApiError } from "@insightops/contracts";
import type { z } from "zod";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:4000/v1";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body?: ApiError,
  ) {
    super(body?.error.message ?? `API request failed with status ${status}`);
    this.name = "ApiRequestError";
  }
}

export class BackendUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BackendUnavailableError";
  }
}

export async function fetchApi<T>(path: string, responseSchema: z.ZodType<T>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new BackendUnavailableError("Backend is unavailable", { cause: error });
  }

  if (!response.ok) {
    const body = apiErrorSchema.safeParse(await response.json().catch(() => undefined));
    if (response.status >= 500) {
      throw new BackendUnavailableError(`Backend returned ${response.status}`);
    }
    throw new ApiRequestError(response.status, body.success ? body.data : undefined);
  }

  return responseSchema.parse(await response.json());
}
