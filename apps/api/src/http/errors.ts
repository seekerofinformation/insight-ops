import type { ErrorCode } from "@insightops/contracts";

export interface ErrorDetail {
  path: string;
  message: string;
}

export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "HttpError";
  }
}
