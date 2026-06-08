// Composición de dependencias. Único lugar del proyecto que conoce tanto el dominio como la infraestructura concreta. Instancia y conecta adaptadores con casos de uso.
//Ej con caso de uso crearSolicitud:
// src/container.ts
import { CrearSolicitud } from "./modules/solicitudes/domain/use-cases/CrearSolicitud.usecase";
import { PrismaSolicitudesRepository } from "./modules/solicitudes/infrastructure/adapters/PrismaSolicitudRepository";

// 1. Instancia el adapter concreto (infraestructura)
const solicitudesRepo = new PrismaSolicitudesRepository();

// 2. Lo inyecta en el caso de uso (dominio)
export const crearSolicitud = new CrearSolicitud(solicitudesRepo);
