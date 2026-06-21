import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";

export interface CrearCuentaInput {
  email: string;
  password: string;
  nombre: string;
  rol: "admin" | "remitente" | "solicitante";
}

export interface CrearCuentaOutput {
  id: string;
}

/**
 * Alta directa de una cuenta por parte del admin (variante administrativa
 * de CU-01, sin pasar por self-signup + aprobación).
 *
 * A diferencia del flujo normal (registro → PENDIENTE → AprobarCuentaUseCase),
 * acá el admin crea la cuenta ya con rol definido y la deja directamente
 * en estado APROBADA: no tiene sentido pedirle a un admin que se apruebe
 * a sí mismo la cuenta que acaba de crear.
 *
 * El perfil específico por rol (Remitente/Solicitante/Administrador) en
 * Postgres NO se crea acá: ese paso requiere datos adicionales según el
 * rol (ej. nombre_base para remitente) y hoy vive en la Server Action
 * (mismo patrón que aprobarUsuario en app/admin/usuarios/actions.ts).
 * Este caso de uso se limita a lo que es responsabilidad del dominio:
 * crear el usuario en el IdP externo y el registro base en Postgres.
 */
export class CrearCuentaUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly externalAuth: ForSyncingExternalAuth,
  ) {}

  async ejecutar(input: CrearCuentaInput): Promise<CrearCuentaOutput> {
    if (!input.email.includes("@")) {
      throw new Error("Ingresá un email válido.");
    }

    if (input.password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }

    if (input.nombre.trim() === "") {
      throw new Error("El nombre no puede estar vacío.");
    }

    // 1. Crear en el IdP externo (Clerk) — ahí se origina el ID compartido (ADR-006)
    const { id } = await this.externalAuth.crearUsuarioExterno({
      email: input.email,
      password: input.password,
      nombre: input.nombre,
      rol: input.rol,
    });

    return { id };
  }
}