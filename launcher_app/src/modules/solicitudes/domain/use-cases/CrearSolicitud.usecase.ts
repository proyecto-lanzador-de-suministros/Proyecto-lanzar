// Caso de uso. Orquesta la creación de una solicitud: valida stock, calcula trayectoria y dispara notificaciones.
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";

export class CrearSolicitud {
  constructor(private readonly repo: ForManagingSolicitudes) {}

  async ejecutar(
    datos: Omit<Solicitud, "id" | "estado" | "creadaEn">,
  ): Promise<Solicitud> {
    const solicitud: Solicitud = {
      ...datos,
      id: crypto.randomUUID(),
      estado: "pendiente",
      creadaEn: new Date(),
    };

    await this.repo.guardar(solicitud);
    return solicitud;
  }
}
