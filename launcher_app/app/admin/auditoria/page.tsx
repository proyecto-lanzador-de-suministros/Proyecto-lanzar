"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listarAuditoriaAction } from "@/src/actions/auditoria.actions";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { ETIQUETAS_ESTADO, getStatusColor } from "@/app/components/dashboard/constants";

interface AuditoriaEntryJSON {
  id: string;
  solicitudId: string;
  destino: { lat: number; lon: number };
  actorId: string;
  actorNombre: string;
  estadoAnterior: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  fechaHora: string;
}

export default function AdminAuditoriaPage() {
  const [entries, setEntries] = useState<AuditoriaEntryJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | "">("");

  const cargar = async (paginaActual: number, estado: EstadoSolicitud | "") => {
    setLoading(true);
    setError(null);
    const res = await listarAuditoriaAction({
      pagina: paginaActual,
      estadoNuevo: estado || undefined,
    });
    if (res.success && res.data) {
      setEntries(res.data);
      setTotalPaginas(res.paginacion?.totalPaginas ?? 1);
      setTotal(res.paginacion?.total ?? 0);
    } else {
      setError(res.error ?? "No se pudo cargar el historial de auditoría.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargar(pagina, filtroEstado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, filtroEstado]);

  const handleCambiarFiltro = (estado: EstadoSolicitud | "") => {
    setFiltroEstado(estado);
    setPagina(1);
  };

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Auditoría</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Historial completo de cambios de estado de todas las solicitudes del sistema.
        </p>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Filtro */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#1A1A2E]">Filtrar por estado nuevo</label>
            <select
              value={filtroEstado}
              onChange={(e) => handleCambiarFiltro(e.target.value as EstadoSolicitud | "")}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white min-w-[200px]"
            >
              <option value="">Todos los estados</option>
              {Object.values(EstadoSolicitud).map((estado) => (
                <option key={estado} value={estado}>{ETIQUETAS_ESTADO[estado]}</option>
              ))}
            </select>
          </div>
          {!loading && (
            <span className="text-xs font-medium bg-gray-100 text-[#6B7280] px-2.5 py-1.5 rounded-full">
              {total} cambio{total !== 1 ? "s" : ""} de estado registrado{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
              <span className="text-sm text-[#6B7280]">Cargando auditoría...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-[#1A1A2E]">No hay cambios de estado registrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3 font-semibold">Fecha y hora</th>
                    <th className="px-6 py-3 font-semibold">Solicitud</th>
                    <th className="px-6 py-3 font-semibold">Transición</th>
                    <th className="px-6 py-3 font-semibold">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {entries.map((e) => (
                    <tr key={e.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 text-[#1A1A2E] text-xs whitespace-nowrap">
                        {formatFecha(e.fechaHora)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/solicitudes/${e.solicitudId}`}
                          className="font-mono text-xs text-[#1565C0] hover:underline"
                        >
                          #{e.solicitudId.substring(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(e.estadoAnterior)}`}>
                            {ETIQUETAS_ESTADO[e.estadoAnterior]}
                          </span>
                          <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(e.estadoNuevo)}`}>
                            {ETIQUETAS_ESTADO[e.estadoNuevo]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#1A1A2E] text-xs">
                        {e.actorNombre}
                        <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">
                          {e.actorId.substring(0, 12)}…
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!loading && entries.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">
                Página {pagina} de {totalPaginas}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina <= 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#6B7280] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#6B7280] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}