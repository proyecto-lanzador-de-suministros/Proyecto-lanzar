// domain/errors/factories.ts
import { DomainError } from "./DomainError";

export const Errores = {
  solicitudSinProductos: () =>
    new DomainError(
      "SOLICITUD_SIN_PRODUCTOS",
      "La solicitud debe incluir al menos un producto.",
    ),

  cantidadProductoInvalida: (productoId: string, cantidad: number) =>
    new DomainError(
      "CANTIDAD_PRODUCTO_INVALIDA",
      `La cantidad del producto ${productoId} debe ser mayor a cero.`,
      { productoId, cantidad },
    ),

  estadoNoCancelable: (estadoActual: string) =>
    new DomainError(
      "ESTADO_NO_CANCELABLE",
      `No se puede cancelar una solicitud en estado "${estadoActual}".`,
      { estadoActual },
    ),

  estadoNoAnulable: (estadoActual: string) =>
    new DomainError(
      "ESTADO_NO_ANULABLE",
      `No se puede anular una solicitud en estado "${estadoActual}".`,
      { estadoActual },
    ),

  transicionInvalida: (actual: string, destino: string) =>
    new DomainError(
      "TRANSICION_INVALIDA",
      `Transición inválida: "${actual}" → "${destino}".`,
      { estadoActual: actual, estadoDestino: destino },
    ),

  solicitudNoEncontrada: (id: string) =>
    new DomainError(
      "SOLICITUD_NO_ENCONTRADA",
      `Solicitud no encontrada: ${id}`,
      { id },
    ),

  remitenteNoEncontrado: (id: string) =>
    new DomainError(
      "REMITENTE_NO_ENCONTRADO",
      `Remitente con ID ${id} no encontrado.`,
      { id },
    ),

  productoNoEncontrado: (id: string) =>
    new DomainError(
      "PRODUCTO_NO_ENCONTRADO",
      `Producto no encontrado en catálogo: ${id}`,
      { id },
    ),

  permisoDenegado: (rolRequerido?: string, rolActual?: string) =>
    new DomainError(
      "PERMISO_DENEGADO",
      "No tenés permiso para realizar esta acción.",
      { rolRequerido, rolActual },
    ),

  rolInvalido: (usuarioId: string, rolEsperado: string) =>
    new DomainError(
      "ROL_INVALIDO",
      `El usuario ${usuarioId} no tiene el rol de ${rolEsperado}.`,
      { usuarioId, rolEsperado },
    ),

  cuentaNoAprobada: (nombre: string, estadoActual: string) =>
    new DomainError(
      "CUENTA_NO_APROBADA",
      `El remitente ${nombre} no está aprobado (estado: ${estadoActual}).`,
      { nombre, estadoActual },
    ),

  usuarioNoEncontrado: (id: string) =>
    new DomainError(
      "USUARIO_NO_ENCONTRADO",
      `Usuario no encontrado: ${id}`,
      { id },
    ),

  faltaIdBase: () =>
    new DomainError(
      "FALTA_ID_BASE",
      "Se requiere id_base para consultar pendientes como remitente.",
    ),

  remitenteNoSeleccionado: () =>
    new DomainError(
      "REMITENTE_NO_SELECCIONADO",
      "Debe seleccionar un remitente válido.",
    ),

  envioDuplicado: (id_solicitud: string) =>
    new DomainError(
      "ENVIO_DUPLICADO",
      `Ya existe un envío programado para la solicitud ${id_solicitud}.`,
      { id_solicitud },
    ),

  solicitudNoProgramable: (estadoActual: string) =>
    new DomainError(
      "SOLICITUD_NO_PROGRAMABLE",
      `No se puede programar un envío para una solicitud en estado "${estadoActual}". La solicitud debe estar en estado "Lista".`,
      { estadoActual },
    ),

  baseNoCoincide: (id_base_input: string, id_base_solicitud: string | undefined) =>
    new DomainError(
      "BASE_NO_COINCIDE",
      `La base ${id_base_input} no coincide con la base asignada a la solicitud (${id_base_solicitud ?? "sin base"}).`,
      { id_base_input, id_base_solicitud },
    ),
};
