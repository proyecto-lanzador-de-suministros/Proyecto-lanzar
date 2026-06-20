// domain/errors/DomainError.ts

export type DomainErrorCode =
  | "SOLICITUD_SIN_PRODUCTOS"
  | "CANTIDAD_PRODUCTO_INVALIDA"
  | "ESTADO_NO_CANCELABLE"
  | "ESTADO_NO_ANULABLE"
  | "TRANSICION_INVALIDA"
  | "SOLICITUD_NO_ENCONTRADA"
  | "REMITENTE_NO_ENCONTRADO"
  | "PRODUCTO_NO_ENCONTRADO"
  | "PERMISO_DENEGADO"
  | "ROL_INVALIDO"
  | "CUENTA_NO_APROBADA"
  | "FALTA_ID_BASE"
  | "REMITENTE_NO_SELECCIONADO"

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
