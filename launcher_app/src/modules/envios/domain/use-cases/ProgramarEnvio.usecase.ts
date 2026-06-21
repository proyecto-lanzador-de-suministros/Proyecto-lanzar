import { ForManagingEnvios, Envio } from "../ports/forManagingEnvios.port";

export interface ProgramarEnvioInput {
  id_solicitud: string;
  id_base: string;
}

export class ProgramarEnvioUseCase {
  constructor(private readonly envioRepository: ForManagingEnvios) {}

  async ejecutar(input: ProgramarEnvioInput): Promise<Envio> {
    return this.envioRepository.crear({
      id_solicitud: input.id_solicitud,
      id_base: input.id_base,
      fecha_hora_programada: new Date(),
      estado_envio: "programado",
    });
  }
}
