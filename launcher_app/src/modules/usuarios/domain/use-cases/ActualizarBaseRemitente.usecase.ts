import { ForManagingUsuarios, ActualizarBaseRemitenteInput } from "../ports/forManagingUsuarios.port";

export class ActualizarBaseRemitenteUseCase {
  constructor(private readonly usuarioRepository: ForManagingUsuarios) {}

  async ejecutar(id: string, datos: ActualizarBaseRemitenteInput): Promise<void> {
    if (datos.nombre !== undefined && datos.nombre.trim() === "") {
      throw new Error("El nombre de la base no puede estar vacío.");
    }
    if (
      datos.latitud !== undefined &&
      (!Number.isFinite(datos.latitud) || datos.latitud < -90 || datos.latitud > 90)
    ) {
      throw new Error("Latitud inválida. Debe estar entre -90 y 90.");
    }
    if (
      datos.longitud !== undefined &&
      (!Number.isFinite(datos.longitud) || datos.longitud < -180 || datos.longitud > 180)
    ) {
      throw new Error("Longitud inválida. Debe estar entre -180 y 180.");
    }

    await this.usuarioRepository.actualizarBaseRemitente(id, datos);
  }
}
