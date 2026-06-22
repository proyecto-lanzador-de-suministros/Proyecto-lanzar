import { ForManagingEnvios, Envio } from "../ports/forManagingEnvios.port";
import { ForManagingSolicitudes } from "@/src/modules/solicitudes/domain/ports/forManagingSolicitudes.port";
import { ForManagingProductos } from "@/src/modules/stock/domain/ports/forManagingProductos.port";
import { Errores } from "@/src/modules/errors/domain/factories";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { CalcularTrayectoria } from "@/src/modules/trayectoria/domain/use-cases/CalcularTrayectoria.usecase";
import { Trayectoria } from "@/src/modules/trayectoria/domain/entities/Trayectoria";

export interface ProgramarEnvioInput {
  id_solicitud: string;
  id_base: string;
  altitud_liberacion_m: number;
}

export interface ProgramarEnvioResultado {
  envio: Envio;
  trayectoria: Trayectoria;
}

export class ProgramarEnvioUseCase {
  constructor(
    private readonly envioRepository: ForManagingEnvios,
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly calcularTrayectoria: CalcularTrayectoria,
    private readonly productosRepository: ForManagingProductos,
  ) {}

  async ejecutar(input: ProgramarEnvioInput): Promise<ProgramarEnvioResultado> {
    const solicitud = await this.solicitudRepository.buscarPorId(input.id_solicitud);
    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(input.id_solicitud);
    }

    if (solicitud.estado !== EstadoSolicitud.Lista) {
      throw Errores.solicitudNoProgramable(solicitud.estado);
    }

    if (input.id_base !== solicitud.id_base) {
      throw Errores.baseNoCoincide(input.id_base, solicitud.id_base);
    }

    const envioExistente = await this.envioRepository.buscarPorIdSolicitud(input.id_solicitud);
    if (envioExistente) {
      throw Errores.envioDuplicado(input.id_solicitud);
    }

    const envio = await this.envioRepository.crear({
      id_solicitud: input.id_solicitud,
      id_base: input.id_base,
      fecha_hora_programada: new Date(),
      estado_envio: "programado",
    });

    let peso_total_kg = 0;
    for (const prod of solicitud.productos) {
      const producto = await this.productosRepository.buscarProductoPorIdentificador(prod.productoId);
      if (!producto) {
        throw Errores.productoNoEncontrado(prod.productoId);
      }
      peso_total_kg += producto.peso_kg * prod.cantidad;
    }

    const trayectoria = await this.calcularTrayectoria.ejecutar({
      id_envio: envio.id_envio,
      destino: solicitud.ubicacion_destino,
      peso_total_kg,
      altitud_liberacion_m: input.altitud_liberacion_m,
    });

    return { envio, trayectoria };
  }
}
