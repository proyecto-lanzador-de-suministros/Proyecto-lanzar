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
import { ConsultarDetalleSolicitudUseCase } from "./modules/solicitudes/domain/use-cases/ConsultarDetalleSolicitud.usecase";
import { PrismaUsuarioRepository } from "./modules/usuarios/infrastructure/adapters/PrismaUsuarioRepository";
import { AprobarCuentaUseCase } from "./modules/usuarios/domain/use-cases/AprobarCuenta.usecase";
import { RechazarCuentaUseCase } from "./modules/usuarios/domain/use-cases/RechazarCuenta.usecase";
import { EliminarCuentaUseCase } from "./modules/usuarios/domain/use-cases/EliminarCuenta.usecase";
import { CrearCuentaUseCase } from "./modules/usuarios/domain/use-cases/CrearCuenta.usecase";
import { ListarUsuariosUseCase } from "./modules/usuarios/domain/use-cases/ListarUsuarios.usecase";
import { ListarBasesRemitentesUseCase } from "./modules/usuarios/domain/use-cases/ListarBasesRemitentes.usecase";
import { ActualizarBaseRemitenteUseCase } from "./modules/usuarios/domain/use-cases/ActualizarBaseRemitente.usecase";
import { PrismaSolicitudesRepository } from "./modules/solicitudes/infrastructure/adapters/PrismaSolicitudRepository";
import { PrismaStockRepository } from "./modules/stock/infrastructure/adapters/PrismaStockRepository";
import { ConsultarStockUseCase } from "./modules/stock/domain/use-cases/ConsultarStock.usecase";
import { ActualizarStockUseCase } from "./modules/stock/domain/use-cases/ActualizarStock.usecase";
import { PrismaHistorialRepository } from "./modules/historial/infrastructure/adapters/PrismaHistorialRepository";
import { ListarAuditoriaGlobalUseCase } from "./modules/historial/domain/use-cases/ListarAuditoriaGlobal.usecase";
import { NotificationServiceAdapter } from "./modules/notificaciones/infrastructure/adapters/NotificationServiceAdapter";
import { NotificarSolicitudCreada } from "./modules/notificaciones/domain/use-cases/NotificarSolicitudCreada.usecase";
import { NotificarCancelacion } from "./modules/notificaciones/domain/use-cases/NotificarCancelacion.usecase";
import { NotificarAnulacion } from "./modules/notificaciones/domain/use-cases/NotificarAnulacion.usecase";
import { NotificarAsignacion } from "./modules/notificaciones/domain/use-cases/NotificarAsignacion.usecase";
import { NotificarEnPreparacion } from "./modules/notificaciones/domain/use-cases/NotificarEnPreparacion.usecase";
import { NotificarLista } from "./modules/notificaciones/domain/use-cases/NotificarLista.usecase";
import { NotificarEnCamino } from "./modules/notificaciones/domain/use-cases/NotificarEnCamino.usecase";
import { NotificarLanzada } from "./modules/notificaciones/domain/use-cases/NotificarLanzada.usecase";
import { NotificarRecepcion } from "./modules/notificaciones/domain/use-cases/NotificarRecepcion.usecase";
import { NotificarRechazo } from "./modules/notificaciones/domain/use-cases/NotificarRechazo.usecase";
import { InicializarDatosPruebaUseCase } from "./modules/solicitudes/domain/use-cases/InicializarDatosPrueba.usecase";
import { PrismaTestDataRepository } from "./modules/solicitudes/infrastructure/adapters/PrismaTestDataRepository";
import { GenerarReporteGeneralUseCase } from "./modules/reportes/domain/use-cases/GenerarReporteGeneral.usecase";
import { PrismaReportsRepository } from "./modules/reportes/infrastructure/adapters/PrismaReportsRepository";
import { PrismaProductosRepository } from "./modules/stock/infrastructure/adapters/PrismaProductosRepository";
import { ListarCatalogoProductosUseCase } from "./modules/stock/domain/use-cases/ListarCatalogoProductos.usecase";
import { PrismaNotificacionesRepository } from "./modules/notificaciones/infrastructure/adapters/PrismaNotificacionesRepository";
import { ListarNotificacionesUseCase } from "./modules/notificaciones/domain/use-cases/ListarNotificaciones.usecase";
import { PrismaHistorialStockRepository } from "./modules/stock/infrastructure/adapters/PrismaHistorialStockRepository";
import { ListarHistorialStockUseCase } from "./modules/stock/domain/use-cases/ListarHistorialStock.usecase";
import { CalcularTrayectoria } from "./modules/trayectoria/domain/use-cases/CalcularTrayectoria.usecase";
import { TrajectoryCalculatorAdapter } from "./modules/trayectoria/infrastructure/adapters/TrajectoryCalculatorAdapter";
import { OpenMeteoWeatherAdapter } from "./modules/trayectoria/infrastructure/adapters/openMeteoWeatherAdapter";
// ── Infraestructura compartida ──────────────────────────────────────────────

export const authAdapter = new ClerkAuthAdapter();
export const clerkSyncAdapter = new ClerkSyncAdapter();

export const solicitudRepository = new PrismaSolicitudesRepository();
export const usuarioRepository = new PrismaUsuarioRepository();
export const historialRepository = new PrismaHistorialRepository();
export const stockRepository = new PrismaStockRepository();

const notificationAdapter = new NotificationServiceAdapter();
const weatherAdapter = new OpenMeteoWeatherAdapter();
const trajectoryCalculator = new TrajectoryCalculatorAdapter();
const notificarSolicitudCreada = new NotificarSolicitudCreada(notificationAdapter);
const notificarAnulacion = new NotificarAnulacion(notificationAdapter);
const notificarAsignacion = new NotificarAsignacion(notificationAdapter);
const notificarEnPreparacion = new NotificarEnPreparacion(notificationAdapter);
const notificarLista = new NotificarLista(notificationAdapter);
const notificarEnCamino = new NotificarEnCamino(notificationAdapter);
const notificarLanzada = new NotificarLanzada(notificationAdapter);
const notificarRecepcion = new NotificarRecepcion(notificationAdapter);
const notificarRechazo = new NotificarRechazo(notificationAdapter);

const notificacionesRepository = new PrismaNotificacionesRepository();

// ── Auth ────────────────────────────────────────────────────────────────────

export const iniciarSesionUseCase = new IniciarSesion(authAdapter);
export const cerrarSesionUseCase = new CerrarSesion(authAdapter);

// ── Usuarios ────────────────────────────────────────────────────────────────

export const aprobarCuentaUseCase = new AprobarCuentaUseCase(
  usuarioRepository,
  clerkSyncAdapter,
  notificationAdapter,
);

export const rechazarCuentaUseCase = new RechazarCuentaUseCase(
  usuarioRepository,
  clerkSyncAdapter,
  notificationAdapter,
);

export const eliminarCuentaUseCase = new EliminarCuentaUseCase(
  usuarioRepository,
  solicitudRepository,
);

export const crearCuentaUseCase = new CrearCuentaUseCase(
  usuarioRepository,
  clerkSyncAdapter,
);

export const listarUsuariosUseCase = new ListarUsuariosUseCase(usuarioRepository);

export const listarBasesRemitentesUseCase = new ListarBasesRemitentesUseCase(usuarioRepository);

export const actualizarBaseRemitenteUseCase = new ActualizarBaseRemitenteUseCase(usuarioRepository);

// ── Solicitudes ─────────────────────────────────────────────────────────────

export const controlarSolicitudUseCase = new ControlarSolicitud(
  solicitudRepository,
  stockRepository,
  notificarRechazo,
  notificarAsignacion,
  historialRepository,
);

export const crearSolicitudUseCase = new CrearSolicitud(
  solicitudRepository,
  controlarSolicitudUseCase,
  notificarSolicitudCreada,
  historialRepository,
);

const notificarCancelacion = new NotificarCancelacion(notificationAdapter);

export const cancelarSolicitudUseCase = new CancelarSolicitud(
  solicitudRepository,
  stockRepository,
  notificarCancelacion,
  historialRepository,
);

export const consultarSolicitudUseCase = new ConsultarSolicitudUseCase(solicitudRepository);

export const consultarSolicitudesPendientesUseCase = new ConsultarSolicitudesPendientes(
  solicitudRepository,
);

export const listarSolicitudesAdminUseCase = new ListarSolicitudesAdminUseCase(solicitudRepository);

export const anularSolicitudUseCase = new AnularSolicitudUseCase(
  solicitudRepository,
  notificarAnulacion,
  historialRepository,
);

export const asignarRemitenteUseCase = new AsignarRemitenteUseCase(
  solicitudRepository,
  usuarioRepository,
  notificarAsignacion,
  historialRepository,
);

export const registrarEnPreparacionUseCase = new RegistrarEnPreparacionUseCase(
  solicitudRepository,
  notificarEnPreparacion,
  historialRepository,
);

export const registrarListaUseCase = new RegistrarListaUseCase(
  solicitudRepository,
  notificarLista,
  historialRepository,
);

export const registrarEnCaminoUseCase = new RegistrarEnCaminoUseCase(
  solicitudRepository,
  notificarEnCamino,
  historialRepository,
);

export const registrarLanzadaUseCase = new RegistrarLanzadaUseCase(
  solicitudRepository,
  notificarLanzada,
  historialRepository,
);

export const confirmarRecibidaUseCase = new ConfirmarRecibidaUseCase(
  solicitudRepository,
  notificarRecepcion,
  historialRepository,
);

export const consultarDetalleSolicitudUseCase = new ConsultarDetalleSolicitudUseCase(
  solicitudRepository,
  historialRepository,
);

// ── Test Data Seeding ────────────────────────────────────────────────────────

const testDataRepository = new PrismaTestDataRepository();

export const inicializarDatosPruebaUseCase = new InicializarDatosPruebaUseCase(
  testDataRepository,
);

// ── Stock ───────────────────────────────────────────────────────────────────

export const consultarStockUseCase = new ConsultarStockUseCase(stockRepository);

export const historialStockRepository = new PrismaHistorialStockRepository();

export const actualizarStockUseCase = new ActualizarStockUseCase(stockRepository, historialStockRepository);

export const listarHistorialStockUseCase = new ListarHistorialStockUseCase(historialStockRepository);
// ── Productos (Catálogo) ─────────────────────────────────────────────────────

const productosRepository = new PrismaProductosRepository();

export const listarCatalogoProductosUseCase = new ListarCatalogoProductosUseCase(
  productosRepository,
);

// ── Historial / Auditoría ────────────────────────────────────────────────────

export const listarAuditoriaGlobalUseCase = new ListarAuditoriaGlobalUseCase(
  historialRepository,
);

// ── Reportes ─────────────────────────────────────────────────────────────────

const reportsRepository = new PrismaReportsRepository();

export const generarReporteGeneralUseCase = new GenerarReporteGeneralUseCase(
  reportsRepository,
);

// ── Trayectoria ─────────────────────────────────────────────────────────────

export const calcularTrayectoriaUseCase = new CalcularTrayectoria(
  weatherAdapter,
  trajectoryCalculator,
);

export const weatherServiceAdapter = weatherAdapter;
export const trajectoryCalculatorAdapter = trajectoryCalculator;

// ── Notificaciones ───────────────────────────────────────────────────────────

export const listarNotificacionesUseCase = new ListarNotificacionesUseCase(
  notificacionesRepository,
);