import {
  ForGeneratingReports,
  RangoFechas,
  ReporteSolicitudes,
  FilaStockReporte,
} from "../ports/forGeneratingReports.port";

export class GenerarReporteGeneralUseCase {
  constructor(private readonly reportsRepository: ForGeneratingReports) {}

  async ejecutarSolicitudes(rango?: RangoFechas): Promise<ReporteSolicitudes> {
    return this.reportsRepository.generarReporteSolicitudes(rango);
  }

  async ejecutarStock(): Promise<FilaStockReporte[]> {
    return this.reportsRepository.generarReporteStock();
  }
}
