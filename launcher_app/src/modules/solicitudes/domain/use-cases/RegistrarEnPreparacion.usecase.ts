import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";
import { NotificarEnPreparacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarEnPreparacion.usecase";
import { ForManagingEnvios, DatosTrayectoria } from "@/src/modules/envios/domain/ports/forManagingEnvios.port";
import { CalcularTrayectoria } from "@/src/modules/trayectoria/domain/use-cases/CalcularTrayectoria.usecase";
import { ForManagingProductos } from "@/src/modules/stock/domain/ports/forManagingProductos.port";

export interface RegistrarEnPreparacionInput {
  solicitudId: string;
  actorId: string;
  rol: "remitente" | "admin";
}

export class RegistrarEnPreparacionUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notificarEnPreparacion: NotificarEnPreparacion,
    private readonly historial: ForManagingHistorial,
    private readonly envioRepository: ForManagingEnvios,
    private readonly calcularTrayectoria: CalcularTrayectoria,
    private readonly productosRepository: ForManagingProductos,
  ) {}

  async ejecutar(input: RegistrarEnPreparacionInput): Promise<void> {
    const { solicitudId, actorId, rol } = input;
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    if (rol === "remitente" && solicitud.id_base !== actorId) {
      throw Errores.permisoDenegado("remitente", rol);
    }

    const estadoAnterior = solicitud.estado;
    solicitud.avanzarEstado(EstadoSolicitud.EnPreparacion);

    await this.solicitudRepository.actualizarEstado(solicitudId, solicitud.estado);

    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // Calcular trayectoria y guardar en el envío (CU-12)
    let envio = await this.envioRepository.buscarPorIdSolicitud(solicitudId);
    if (!envio && solicitud.id_base) {
      envio = await this.envioRepository.crear({
        id_solicitud: solicitudId,
        id_base: solicitud.id_base,
        fecha_hora_programada: new Date(),
        estado_envio: "programado",
      });
    }

    if (envio && solicitud.id_base) {
      let peso_total_kg = 0;
      for (const prod of solicitud.productos) {
        const producto = await this.productosRepository.buscarProductoPorIdentificador(prod.productoId);
        if (producto) {
          peso_total_kg += producto.peso_kg * prod.cantidad;
        }
      }

      const trayectoria = await this.calcularTrayectoria.ejecutar({
        id_envio: envio.id_envio,
        destino: solicitud.ubicacion_destino,
        peso_total_kg,
        altitud_liberacion_m: 300,
      });

      const datosTrayectoria: DatosTrayectoria = {
        punto_lanzamiento: {
          lat: trayectoria.punto_lanzamiento.coordinates[1],
          lon: trayectoria.punto_lanzamiento.coordinates[0],
        },
        offset_norte_m: trayectoria.offset_norte_m,
        offset_este_m: trayectoria.offset_este_m,
        timestamp_estimado: trayectoria.timestamp_estimado.toISOString(),
        condiciones_seguras: trayectoria.condiciones_seguras,
        condiciones_climaticas: {
          temperatura_c: trayectoria.condiciones_climaticas.temperatura_c,
          velocidad_viento_ms: trayectoria.condiciones_climaticas.velocidad_viento_ms,
          direccion_viento_grados: trayectoria.condiciones_climaticas.direccion_viento_grados,
        },
      };

      await this.envioRepository.guardarDatosTrayectoria(envio.id_envio, datosTrayectoria);
    }

    await this.notificarEnPreparacion.ejecutar(solicitudId, solicitud.id_usuario);
  }
}
