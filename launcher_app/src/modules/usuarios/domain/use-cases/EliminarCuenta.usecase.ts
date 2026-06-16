import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";

export class EliminarCuentaUseCase {
  constructor(private readonly usuarioRepository: ForManagingUsuarios) {}

  async ejecutar(usuarioId: string): Promise<void> {
    // 1. Verificar que el usuario exista
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    
    if (!usuario) {
      throw new Error(`Usuario con ID ${usuarioId} no encontrado.`);
    }

    // TODO: Si el usuario tiene solicitudes activas, gestionar su cancelación/anulación (CU-05)

    // 2. Eliminar de la persistencia
    await this.usuarioRepository.eliminar(usuarioId);
  }
}