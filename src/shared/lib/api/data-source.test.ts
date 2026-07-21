import { afterEach, describe, expect, it, vi } from "vitest";
import { getDataSourceMode, resolveDataSource } from "./data-source";
import { ApiRequestError, BackendUnavailableError } from "./http-client";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("data source selection", () => {
  it("defaults to deterministic mock mode", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "");
    expect(getDataSourceMode()).toBe("mock");
  });

  it("fails closed on an invalid deployment mode", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "typo");
    expect(() => getDataSourceMode()).toThrow("Unsupported NEXT_PUBLIC_DATA_SOURCE");
  });

  it("falls back only when the backend is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "fallback");
    const mockRequest = vi.fn(async () => "mock");
    await expect(
      resolveDataSource(async () => {
        throw new BackendUnavailableError("offline");
      }, mockRequest),
    ).resolves.toBe("mock");
    expect(mockRequest).toHaveBeenCalledOnce();
  });

  it("does not hide client, authorization or not-found errors", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "fallback");
    const mockRequest = vi.fn(async () => "mock");
    await expect(
      resolveDataSource(async () => {
        throw new ApiRequestError(404);
      }, mockRequest),
    ).rejects.toMatchObject({ status: 404 });
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
