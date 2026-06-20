import { DomainError } from "@/src/modules/errors/domain/DomainError";
import { ERROR_CODE_TO_STATUS } from "@/src/modules/errors/domain/errorCodeToStatus";

export interface ErrorResponse {
  code: string;
  message: string;
  httpStatus: number;
  details?: Record<string, unknown>;
}

export function handleDomainError(err: unknown): ErrorResponse {
  if (err instanceof DomainError) {
    const httpStatus = ERROR_CODE_TO_STATUS[err.code] ?? 500;

    return {
      code: err.code,
      message: err.message,
      httpStatus,
      details: err.details,
    };
  }

  console.error("[handleDomainError] Error no manejado:", err);

  return {
    code: "ERROR_INTERNO",
    message: "Error interno del servidor.",
    httpStatus: 500,
  };
}
