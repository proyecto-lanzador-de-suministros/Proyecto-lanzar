"use client";

import React, { useEffect, useState } from "react";
import Tabs from "@/app/components/ui/Tabs";
import {
  obtenerReporteSolicitudesAction,
  obtenerReporteStockAction,
} from "@/src/actions/reportes.actions";
import { EstadoSolicitud, PrioridadSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { ETIQUETAS_ESTADO } from "@/app/components/dashboard/constants";

interface SolicitudReporteRow {
  id: string;
  fechaCreacion: string;
  estado: EstadoSolicitud;
  prioridad: PrioridadSolicitud;
  baseAsignada: string;
}

interface StockReporteRow {
  id: string;
  base: string;
  producto: string;
  cantidadDisponible: number;
}

function descargarCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => {
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminReportesPage() {
  const [tab, setTab] = useState<"solicitudes" | "stock">("solicitudes");

  // ── Reporte de solicitudes ──────────────────────────────────────────────
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [filas, setFilas] = useState<SolicitudReporteRow[]>([]);
  const [resumen, setResumen] = useState<{
    total: number;
    porEstado: Record<string, number>;
    porPrioridad: Record<string, number>;
  } | null>(null);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [errorSolicitudes, setErrorSolicitudes] = useState<string | null>(null);

  const cargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    setErrorSolicitudes(null);
    const res = await obtenerReporteSolicitudesAction({
      desde: desde || undefined,
      hasta: hasta || undefined,
    });
    if (res.success && res.data) {
      setFilas(res.data);
      setResumen(res.resumen ?? null);
    } else {
      setErrorSolicitudes(res.error ?? "No se pudo generar el reporte.");
    }
    setLoadingSolicitudes(false);
  };

  useEffect(() => {
    if (tab === "solicitudes") cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleExportarSolicitudes = () => {
    descargarCSV(
      `reporte-solicitudes-${new Date().toISOString().slice(0, 10)}.csv`,
      ["ID", "Fecha de creación", "Estado", "Prioridad", "Base asignada"],
      filas.map((f) => [
        f.id,
        new Date(f.fechaCreacion).toLocaleString("es-AR"),
        ETIQUETAS_ESTADO[f.estado],
        f.prioridad,
        f.baseAsignada,
      ]),
    );
  };

  // ── Reporte de stock ─────────────────────────────────────────────────────
  const [stockRows, setStockRows] = useState<StockReporteRow[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [errorStock, setErrorStock] = useState<string | null>(null);

  const cargarStock = async () => {
    setLoadingStock(true);
    setErrorStock(null);
    const res = await obtenerReporteStockAction();
    if (res.success && res.data) {
      setStockRows(res.data);
    } else {
      setErrorStock(res.error ?? "No se pudo generar el reporte.");
    }
    setLoadingStock(false);
  };

  useEffect(() => {
    if (tab === "stock") cargarStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleExportarStock = () => {
    descargarCSV(
      `reporte-stock-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Base", "Producto", "Cantidad disponible"],
      stockRows.map((s) => [s.base, s.producto, s.cantidadDisponible]),
    );
  };

  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Reportes</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Generá y exportá reportes de solicitudes y stock del sistema.
        </p>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <Tabs
          items={[
            { label: "Solicitudes", value: "solicitudes" },
            { label: "Stock", value: "stock" },
          ]}
          value={tab}
          onValueChange={(v) => setTab(v as "solicitudes" | "stock")}
        />

        {tab === "solicitudes" ? (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A1A2E]">Desde</label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1A1A2E]">Hasta</label>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>
              <button
                onClick={cargarSolicitudes}
                className="bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Aplicar filtro
              </button>
              {(desde || hasta) && (
                <button
                  onClick={() => { setDesde(""); setHasta(""); cargarSolicitudes(); }}
                  className="text-xs text-[#6B7280] hover:text-[#1A1A2E] underline"
                >
                  Limpiar
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={handleExportarSolicitudes}
                disabled={loadingSolicitudes || filas.length === 0}
                className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                ⬇ Exportar CSV
              </button>
            </div>

            {errorSolicitudes && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {errorSolicitudes}
              </div>
            )}

            {/* Resumen */}
            {resumen && !loadingSolicitudes && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <p className="text-xs text-[#6B7280]">Total en el rango</p>
                  <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{resumen.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <p className="text-xs text-[#6B7280] mb-2">Por estado</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(resumen.porEstado).map(([estado, cant]) => (
                      <span key={estado} className="text-[11px] bg-gray-100 text-[#1A1A2E] px-2 py-1 rounded-full">
                        {ETIQUETAS_ESTADO[estado as EstadoSolicitud] ?? estado}: <strong>{cant}</strong>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <p className="text-xs text-[#6B7280] mb-2">Por prioridad</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(resumen.porPrioridad).map(([prioridad, cant]) => (
                      <span key={prioridad} className="text-[11px] bg-gray-100 text-[#1A1A2E] px-2 py-1 rounded-full">
                        {prioridad}: <strong>{cant}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tabla detalle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loadingSolicitudes ? (
                <div className="p-10 flex justify-center items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
                  <span className="text-sm text-[#6B7280]">Generando reporte...</span>
                </div>
              ) : filas.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-medium text-[#1A1A2E]">No hay solicitudes en el rango seleccionado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-3 font-semibold">ID</th>
                        <th className="px-6 py-3 font-semibold">Fecha</th>
                        <th className="px-6 py-3 font-semibold">Estado</th>
                        <th className="px-6 py-3 font-semibold">Prioridad</th>
                        <th className="px-6 py-3 font-semibold">Base asignada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filas.map((f) => (
                        <tr key={f.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-6 py-3 font-mono text-xs text-[#6B7280]">
                            #{f.id.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-3 text-xs text-[#1A1A2E]">
                            {new Date(f.fechaCreacion).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-6 py-3 text-xs text-[#1A1A2E]">{ETIQUETAS_ESTADO[f.estado]}</td>
                          <td className="px-6 py-3 text-xs text-[#1A1A2E]">{f.prioridad}</td>
                          <td className="px-6 py-3 text-xs text-[#1A1A2E]">{f.baseAsignada}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={handleExportarStock}
                disabled={loadingStock || stockRows.length === 0}
                className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                ⬇ Exportar CSV
              </button>
            </div>

            {errorStock && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {errorStock}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loadingStock ? (
                <div className="p-10 flex justify-center items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
                  <span className="text-sm text-[#6B7280]">Generando reporte...</span>
                </div>
              ) : stockRows.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-medium text-[#1A1A2E]">No hay stock registrado todavía.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-3 font-semibold">Base</th>
                        <th className="px-6 py-3 font-semibold">Producto</th>
                        <th className="px-6 py-3 font-semibold">Disponible</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {stockRows.map((s) => (
                        <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-6 py-3 text-[#1A1A2E]">{s.base}</td>
                          <td className="px-6 py-3 text-[#1A1A2E]">{s.producto}</td>
                          <td className="px-6 py-3 font-semibold text-[#1A1A2E]">{s.cantidadDisponible}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}