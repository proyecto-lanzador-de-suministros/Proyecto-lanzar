import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";

export class AsignarRemitenteUseCase {
  constructor(private readonly solicitudRepository: ForManagingSolicitudes) {}

  async ejecutar(solicitudId: string, remitenteId: string): Promise<void> {
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);
    
    if (!solicitud) {
      throw new Error(`Solicitud con ID ${solicitudId} no encontrada.`);
    }

    solicitud.asignar(remitenteId);
    
    await this.solicitudRepository.guardar(solicitud);
    // TODO: Disparar caso de uso NotificarAsignacion (Notificaciones)
  }
}