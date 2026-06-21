export class Reporte<T = unknown> {
  private constructor(
    readonly tipo: "solicitudes" | "stock",
    readonly generadoPor: string,
    readonly fechaGeneracion: Date,
    readonly datos: T,
  ) {}

  static crearSolicitudes(
    datos: import("../ports/forGeneratingReports.port").ReporteSolicitudes,
    generadoPor: string,
  ): Reporte {
    return new Reporte("solicitudes", generadoPor, new Date(), datos)
  }

  static crearStock(
    datos: import("../ports/forGeneratingReports.port").FilaStockReporte[],
    generadoPor: string,
  ): Reporte {
    return new Reporte("stock", generadoPor, new Date(), datos)
  }
}
