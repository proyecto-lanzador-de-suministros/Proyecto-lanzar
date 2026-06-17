import { ClerkAuthAdapter } from "./modules/auth/infrastructure/adapters/ClerkAuthAdapter";
import { ClerkSyncAdapter } from "./modules/auth/infrastructure/adapters/ClerkSyncAdapter";
import { IniciarSesion } from "./modules/auth/domain/use-cases/IniciarSesion.usecase";
import { CerrarSesion } from "./modules/auth/domain/use-cases/CerrarSesion.usecase";
import { CrearSolicitud } from "./modules/solicitudes/domain/use-cases/CrearSolicitud.usecase";
import { ControlarSolicitud } from "./modules/solicitudes/domain/use-cases/ControlarSolicitud.usecase";
import { CancelarSolicitud } from "./modules/solicitudes/domain/use-cases/CancelarSolicitud.usecase";
import { ConsultarSolicitud as ConsultarSolicitudUseCase } from "./modules/solicitudes/domain/use-cases/ConsultarSolicitud.usecase";
import { ConsultarSolicitudesPendientes } from "./modules/solicitudes/domain/use-cases/ConsultarSolicitudesPendientes.usecase";
import { ListarSolicitudesAdminUseCase } from "./modules/solicitudes/domain/use-cases/ListarSolicitudesAdmin.usecase";
import { AnularSolicitudUseCase } from "./modules/solicitudes/domain/use-cases/AnularSolicitud.usecase";
import { AsignarRemitenteUseCase } from "./modules/solicitudes/domain/use-cases/AsignarRemitente.usecase";
import { RegistrarEnPreparacionUseCase } from "./modules/solicitudes/domain/use-cases/RegistrarEnPreparacion.usecase";
import { RegistrarListaUseCase } from "./modules/solicitudes/domain/use-cases/RegistrarLista.usecase";
import { RegistrarEnCaminoUseCase } from "./modules/solicitudes/domain/use-cases/RegistrarEnCamino.usecase";
import { RegistrarLanzadaUseCase } from "./modules/solicitudes/domain/use-cases/RegistrarLanzada.usecase";
import { ConfirmarRecibidaUseCase } from "./modules/solicitudes/domain/use-cases/ConfirmarRecibida.usecase";
import { PrismaUsuarioRepository } from "./modules/usuarios/infrastructure/adapters/PrismaUsuarioRepository";
import { AprobarCuentaUseCase } from "./modules/usuarios/domain/use-cases/AprobarCuenta.usecase";
import { EliminarCuentaUseCase } from "./modules/usuarios/domain/use-cases/EliminarCuenta.usecase";
import { ListarUsuariosUseCase } from "./modules/usuarios/domain/use-cases/ListarUsuarios.usecase";
import { PrismaSolicitudesRepository } from "./modules/solicitudes/infrastructure/adapters/PrismaSolicitudRepository";
import { PrismaStockRepository } from "./modules/stock/infrastructure/adapters/PrismaStockRepository";
import { PrismaHistorialRepository } from "./modules/historial/infrastructure/adapters/PrismaHistorialRepository";
import { NotificationServiceAdapter } from "./modules/notificaciones/infrastructure/adapters/NotificationServiceAdapter";

// ── Infraestructura compartida ──────────────────────────────────────────────

export const authAdapter = new ClerkAuthAdapter();
export const clerkSyncAdapter = new ClerkSyncAdapter();

export const solicitudRepository = new PrismaSolicitudesRepository();
export const usuarioRepository = new PrismaUsuarioRepository();
export const historialRepository = new PrismaHistorialRepository();
export const stockRepository = new PrismaStockRepository();

const notificationAdapter = new NotificationServiceAdapter();

// ── Auth ────────────────────────────────────────────────────────────────────

export const iniciarSesionUseCase = new IniciarSesion(authAdapter);
export const cerrarSesionUseCase = new CerrarSesion(authAdapter);

// ── Usuarios ────────────────────────────────────────────────────────────────

export const aprobarCuentaUseCase = new AprobarCuentaUseCase(
  usuarioRepository,
  clerkSyncAdapter,
);

export const eliminarCuentaUseCase = new EliminarCuentaUseCase(
  usuarioRepository,
  solicitudRepository,
);

export const listarUsuariosUseCase = new ListarUsuariosUseCase(usuarioRepository);

// ── Solicitudes ─────────────────────────────────────────────────────────────

export const controlarSolicitudUseCase = new ControlarSolicitud(
  solicitudRepository,
  stockRepository,
);

export const crearSolicitudUseCase = new CrearSolicitud(
  solicitudRepository,
  controlarSolicitudUseCase,
);

export const cancelarSolicitudUseCase = new CancelarSolicitud(
  solicitudRepository,
  stockRepository,
);

export const consultarSolicitudUseCase = new ConsultarSolicitudUseCase(solicitudRepository);

export const consultarSolicitudesPendientesUseCase = new ConsultarSolicitudesPendientes(
  solicitudRepository,
);

export const listarSolicitudesAdminUseCase = new ListarSolicitudesAdminUseCase(solicitudRepository);

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

export const registrarEnPreparacionUseCase = new RegistrarEnPreparacionUseCase(
  solicitudRepository,
  notificationAdapter,
  historialRepository,
);

export const registrarListaUseCase = new RegistrarListaUseCase(
  solicitudRepository,
  notificationAdapter,
  historialRepository,
);

export const registrarEnCaminoUseCase = new RegistrarEnCaminoUseCase(
  solicitudRepository,
  notificationAdapter,
  historialRepository,
);

export const registrarLanzadaUseCase = new RegistrarLanzadaUseCase(
  solicitudRepository,
  notificationAdapter,
  historialRepository,
);

export const confirmarRecibidaUseCase = new ConfirmarRecibidaUseCase(
  solicitudRepository,
  notificationAdapter,
  historialRepository,
);