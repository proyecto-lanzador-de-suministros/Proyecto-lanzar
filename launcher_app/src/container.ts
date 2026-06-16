import { ClerkAuthAdapter } from "./modules/auth/infrastructure/adapters/ClerkAuthAdapter";
import { ClerkSyncAdapter } from "./modules/auth/infrastructure/adapters/ClerkSyncAdapter";
import { IniciarSesion } from "./modules/auth/domain/use-cases/IniciarSesion.usecase";
import { CerrarSesion } from "./modules/auth/domain/use-cases/CerrarSesion.usecase";
import { CrearSolicitud } from "./modules/solicitudes/domain/use-cases/CrearSolicitud.usecase";
import { ListarSolicitudesAdminUseCase } from "./modules/solicitudes/domain/use-cases/ListarSolicitudesAdmin.usecase";
import { PrismaUsuarioRepository } from "./modules/usuarios/infrastructure/adapters/PrismaUsuarioRepository";
import { AprobarCuentaUseCase } from "./modules/usuarios/domain/use-cases/AprobarCuenta.usecase";
import { EliminarCuentaUseCase } from "./modules/usuarios/domain/use-cases/EliminarCuenta.usecase";
import { ListarUsuariosUseCase } from "./modules/usuarios/domain/use-cases/ListarUsuarios.usecase";
import { PrismaSolicitudesRepository } from "./modules/solicitudes/infrastructure/adapters/PrismaSolicitudRepository";
import { AnularSolicitudUseCase } from "./modules/solicitudes/domain/use-cases/AnularSolicitud.usecase";
import { AsignarRemitenteUseCase } from "./modules/solicitudes/domain/use-cases/AsignarRemitente.usecase";
import { ConsultarSolicitudUseCase } from "./modules/solicitudes/domain/use-cases/ConsultarSolicitud.usecase";
import { PrismaHistorialRepository } from "./modules/historial/infrastructure/adapters/PrismaHistorialRepository";
import { NotificationServiceAdapter } from "./modules/notificaciones/infrastructure/adapters/NotificationServiceAdapter";

// ── Infraestructura compartida ──────────────────────────────────────────────

export const authAdapter = new ClerkAuthAdapter();
export const clerkSyncAdapter = new ClerkSyncAdapter();

export const solicitudRepository = new PrismaSolicitudesRepository();
export const usuarioRepository = new PrismaUsuarioRepository();
export const historialRepository = new PrismaHistorialRepository();

// TODO: Reemplazar por la implementación real cuando NotificationServiceAdapter esté completo.
const notificationAdapter = new NotificationServiceAdapter();

// ── Auth ────────────────────────────────────────────────────────────────────

export const iniciarSesionUseCase = new IniciarSesion(authAdapter);
export const cerrarSesionUseCase = new CerrarSesion(authAdapter);

// ── Usuarios ────────────────────────────────────────────────────────────────

export const aprobarCuentaUseCase = new AprobarCuentaUseCase(
  usuarioRepository,
  clerkSyncAdapter, // Sincroniza Postgres + Clerk en una sola operación desde el dominio
);

export const eliminarCuentaUseCase = new EliminarCuentaUseCase(
  usuarioRepository,
  solicitudRepository, // Para verificar solicitudes activas (CU-05)
);

export const listarUsuariosUseCase = new ListarUsuariosUseCase(usuarioRepository);

// ── Solicitudes ─────────────────────────────────────────────────────────────

export const crearSolicitudUseCase = new CrearSolicitud(solicitudRepository);
export const listarSolicitudesAdminUseCase = new ListarSolicitudesAdminUseCase(solicitudRepository);
export const consultarSolicitudUseCase = new ConsultarSolicitudUseCase(solicitudRepository);

export const anularSolicitudUseCase = new AnularSolicitudUseCase(
  solicitudRepository,
  notificationAdapter,
  historialRepository,
);

export const asignarRemitenteUseCase = new AsignarRemitenteUseCase(
  solicitudRepository,
  usuarioRepository,
  notificationAdapter,
  historialRepository,
);