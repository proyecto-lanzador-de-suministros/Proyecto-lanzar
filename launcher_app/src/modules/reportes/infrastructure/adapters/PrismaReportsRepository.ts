import {
  ForGeneratingReports,
  RangoFechas,
  ReporteSolicitudes,
  FilaStockReporte,
  FilaSolicitudReporte,
  ResumenReporte,
} from "../../domain/ports/forGeneratingReports.port";
import { EstadoSolicitud, PrioridadSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaReportsRepository implements ForGeneratingReports {
  async generarReporteSolicitudes(rango?: RangoFechas): Promise<ReporteSolicitudes> {
    const desde = rango?.desde ? new Date(rango.desde) : undefined;
    const hasta = rango?.hasta ? new Date(`${rango.hasta}T23:59:59.999`) : undefined;

    const solicitudes = await prisma.solicitud.findMany({
      where: {
        fecha_solicitada: {
          ...(desde && { gte: desde }),
          ...(hasta && { lte: hasta }),
        },
      },
      orderBy: { fecha_solicitada: "desc" },
      select: {
        id_solicitud: true,
        fecha_solicitada: true,
        estado: true,
        prioridad: true,
        base: { select: { nombre: true } },
      },
    });

    const filas: FilaSolicitudReporte[] = solicitudes.map((s) => ({
      id: s.id_solicitud,
      fechaCreacion: s.fecha_solicitada.toISOString(),
      estado: s.estado as EstadoSolicitud,
      prioridad: s.prioridad as PrioridadSolicitud,
      baseAsignada: (s as any).base?.nombre ?? "Sin asignar",
    }));

    const porEstado: Record<string, number> = {};
    const porPrioridad: Record<string, number> = {};
    for (const f of filas) {
      porEstado[f.estado] = (porEstado[f.estado] ?? 0) + 1;
      porPrioridad[f.prioridad] = (porPrioridad[f.prioridad] ?? 0) + 1;
    }

    return {
      filas,
      resumen: { total: filas.length, porEstado, porPrioridad },
    };
  }

  async generarReporteStock(): Promise<FilaStockReporte[]> {
    const stock = await prisma.stock_Base.findMany({
      include: {
        base: { select: { nombre: true } },
        producto: { select: { nombre: true } },
      },
      orderBy: [{ base: { nombre: "asc" } }, { producto: { nombre: "asc" } }],
    });

    return stock.map((s) => ({
      id: s.id_stock,
      base: s.base.nombre,
      producto: s.producto.nombre,
      cantidadDisponible: s.cantidad_disponible,
    }));
  }
}
