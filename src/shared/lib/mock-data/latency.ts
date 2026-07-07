/**
 * Simulates network latency so loading states and TanStack Query
 * behave realistically against the mock API layer.
 */
export function withLatency<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
