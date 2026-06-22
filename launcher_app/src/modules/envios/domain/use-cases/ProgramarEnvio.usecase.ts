import { ForManagingEnvios, Envio } from "../ports/forManagingEnvios.port";
import { ForManagingSolicitudes } from "@/src/modules/solicitudes/domain/ports/forManagingSolicitudes.port";
import { Errores } from "@/src/modules/errors/domain/factories";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface ProgramarEnvioInput {
  id_solicitud: string;
  id_base: string;
}

export class ProgramarEnvioUseCase {
  constructor(
    private readonly envioRepository: ForManagingEnvios,
    private readonly solicitudRepository: ForManagingSolicitudes,
  ) {}

  async ejecutar(input: ProgramarEnvioInput): Promise<Envio> {
    const solicitud = await this.solicitudRepository.buscarPorId(input.id_solicitud);
    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(input.id_solicitud);
    }

    if (solicitud.estado !== EstadoSolicitud.Lista) {
      throw Errores.solicitudNoProgramable(solicitud.estado);
    }

    if (input.id_base !== solicitud.id_base) {
      throw Errores.baseNoCoincide(input.id_base, solicitud.id_base);
    }

    const envioExistente = await this.envioRepository.buscarPorIdSolicitud(input.id_solicitud);
    if (envioExistente) {
      throw Errores.envioDuplicado(input.id_solicitud);
    }

    return this.envioRepository.crear({
      id_solicitud: input.id_solicitud,
      id_base: input.id_base,
      fecha_hora_programada: new Date(),
      estado_envio: "programado",
    });
  }
}
