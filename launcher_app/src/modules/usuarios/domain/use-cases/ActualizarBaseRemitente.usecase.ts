import { ForManagingUsuarios, ActualizarBaseRemitenteInput } from "../ports/forManagingUsuarios.port";

export class ActualizarBaseRemitenteUseCase {
  constructor(private readonly usuarioRepository: ForManagingUsuarios) {}

  async ejecutar(id: string, datos: ActualizarBaseRemitenteInput): Promise<void> {
    if (datos.nombre_base !== undefined && datos.nombre_base.trim() === "") {
      throw new Error("El nombre de la base no puede estar vacío.");
    }
    if (
      datos.latitud_base !== undefined &&
      (!Number.isFinite(datos.latitud_base) || datos.latitud_base < -90 || datos.latitud_base > 90)
    ) {
      throw new Error("Latitud inválida. Debe estar entre -90 y 90.");
    }
    if (
      datos.longitud_base !== undefined &&
      (!Number.isFinite(datos.longitud_base) || datos.longitud_base < -180 || datos.longitud_base > 180)
    ) {
      throw new Error("Longitud inválida. Debe estar entre -180 y 180.");
    }

    await this.usuarioRepository.actualizarBaseRemitente(id, datos);
  }
}
