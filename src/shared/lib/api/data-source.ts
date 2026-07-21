import { BackendUnavailableError } from "./http-client";

export type DataSourceMode = "api" | "mock" | "fallback";

export function getDataSourceMode(): DataSourceMode {
  const configured = process.env.NEXT_PUBLIC_DATA_SOURCE;
  if (!configured) return "mock";
  if (configured === "api" || configured === "mock" || configured === "fallback") return configured;
  throw new Error(`Unsupported NEXT_PUBLIC_DATA_SOURCE value: ${configured}`);
}

export async function resolveDataSource<T>(
  apiRequest: () => Promise<T>,
  mockRequest: () => Promise<T>,
): Promise<T> {
  const mode = getDataSourceMode();
  if (mode === "mock") return mockRequest();

  try {
    return await apiRequest();
  } catch (error) {
    if (mode === "fallback" && error instanceof BackendUnavailableError) return mockRequest();
    throw error;
  }
}
