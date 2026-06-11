/**Composición de dependencias.
Único lugar del proyecto que conoce tanto el dominio como la infraestructura concreta.
Instancia y conecta adaptadores con casos de uso.*/

//Ej con caso de uso crearSolicitud:
import { CrearSolicitud } from "./modules/solicitudes/domain/use-cases/CrearSolicitud.usecase";
import { ListarSolicitudesAdminUseCase } from "./modules/solicitudes/domain/use-cases/ListarSolicitudesAdmin.usecase";
import { PrismaSolicitudesRepository } from "./modules/solicitudes/infrastructure/adapters/PrismaSolicitudRepository";

// 1. Instancia el adapter concreto (infraestructura)
const solicitudesRepo = new PrismaSolicitudesRepository();
// 2. Lo inyecta en el caso de uso (dominio)
export const crearSolicitud = new CrearSolicitud(solicitudesRepo);
export const listarSolicitudesAdmin = new ListarSolicitudesAdminUseCase(solicitudesRepo);
// 3. Exportar el repo directamente para route handlers que necesiten operaciones
//    puntuales (ej. buscarPorId + guardar en el PATCH de estado)
export { solicitudesRepo };
//Auth
import { ClerkAuthAdapter } from "./modules/auth/infrastructure/adapters/ClerkAuthAdapter";
import { IniciarSesion } from "./modules/auth/domain/use-cases/IniciarSesion.usecase";
import { CerrarSesion } from "./modules/auth/domain/use-cases/CerrarSesion.usecase";
export const authAdapter = new ClerkAuthAdapter();
export const iniciarSesion = new IniciarSesion(authAdapter);
export const cerrarSesion = new CerrarSesion(authAdapter);