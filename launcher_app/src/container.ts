import { ClerkAuthAdapter } from "./modules/auth/infrastructure/adapters/ClerkAuthAdapter";
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

// Adaptadores y Casos de uso de Auth (Compartido / Otros roles)
export const authRepository = new ClerkAuthAdapter();
export const iniciarSesionUseCase = new IniciarSesion(authRepository);
export const cerrarSesionUseCase = new CerrarSesion(authRepository);

export const usuarioRepository = new PrismaUsuarioRepository();

// Casos de uso de Usuarios
export const aprobarCuentaUseCase = new AprobarCuentaUseCase(usuarioRepository);
export const eliminarCuentaUseCase = new EliminarCuentaUseCase(usuarioRepository);
export const listarUsuariosUseCase = new ListarUsuariosUseCase(usuarioRepository);

// Repositorios de Solicitudes
export const solicitudRepository = new PrismaSolicitudesRepository();

export const crearSolicitudUseCase = new CrearSolicitud(solicitudRepository);
export const listarSolicitudesAdminUseCase = new ListarSolicitudesAdminUseCase(solicitudRepository);
export const anularSolicitudUseCase = new AnularSolicitudUseCase(solicitudRepository);
export const asignarRemitenteUseCase = new AsignarRemitenteUseCase(solicitudRepository);
export const consultarSolicitudUseCase = new ConsultarSolicitudUseCase(solicitudRepository);