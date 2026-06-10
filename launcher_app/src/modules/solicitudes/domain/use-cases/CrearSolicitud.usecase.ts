// Caso de uso. Orquesta la creación de una solicitud: valida stock, calcula trayectoria y dispara notificaciones.
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";

export class CrearSolicitud {
  constructor(private readonly repo: ForManagingSolicitudes) {}

  async ejecutar(
    datos: Omit<Solicitud, "id_solicitud" | "estado" | "fecha_solicitada" | "fecha_estimada">,
  ): Promise<Solicitud> {
    const solicitud: Solicitud = {
      ...datos,
      id_solicitud: crypto.randomUUID(),
      estado: "creada",
      fecha_solicitada: new Date(),
      fecha_estimada: datos.fecha_entrega,
    };

    await this.repo.guardar(solicitud);
    return solicitud;
  }
}
