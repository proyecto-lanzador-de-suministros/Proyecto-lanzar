import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud"

export class RegistroHistorial {
  private constructor(
    readonly id: string,
    readonly solicitudId: string,
    readonly estadoAnterior: EstadoSolicitud | null,
    readonly estadoNuevo: EstadoSolicitud,
    readonly actorId: string,
    readonly fechaHora: Date,
    readonly motivo: string | null,
  ) {}

  static registrar(params: {
    solicitudId: string;
    estadoAnterior?: EstadoSolicitud;
    estadoNuevo: EstadoSolicitud;
    actorId: string;
    motivo?: string;
  }): RegistroHistorial {
    if (params.estadoAnterior === params.estadoNuevo) {
      throw new Error("El estado nuevo debe ser diferente al anterior")
    }
    return new RegistroHistorial(
      crypto.randomUUID(),
      params.solicitudId,
      params.estadoAnterior ?? null,
      params.estadoNuevo,
      params.actorId,
      new Date(),
      params.motivo?.trim() ?? null,
    )
  }
}
