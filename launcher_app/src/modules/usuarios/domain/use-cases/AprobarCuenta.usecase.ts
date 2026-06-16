import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";

export class AprobarCuentaUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    // TODO: private readonly notificador: ForNotifying (Para el CU-02 paso 7)
  ) {}

  async ejecutar(usuarioId: string): Promise<void> {
    // 1. Buscar al usuario
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    
    if (!usuario) {
      throw new Error(`Usuario con ID ${usuarioId} no encontrado.`);
    }

    if (usuario.estadoCuenta === "APROBADA") {
      throw new Error("La cuenta ya se encuentra aprobada.");
    }

    // 2. Cambiar estado en la entidad
    usuario.aprobar();

    // 3. Guardar cambios en persistencia
    await this.usuarioRepository.guardar(usuario);

    // 4. (Futuro) Enviar notificación de aprobación al usuario
  }
}