"use client";

// Tabla principal de gestión de solicitudes del dashboard de admin.
import React from "react";
import Link from "next/link";
import { ETIQUETAS_ESTADO, getPrioridadColor, getStatusColor } from "./constants";
import { SolicitudJSON } from "./types";

interface TablaSolicitudesProps {
  solicitudes: SolicitudJSON[];
  loading: boolean;
  error: string | null;
  onReintentar: () => void;
  onGestionar: (sol: SolicitudJSON) => void;
}

export default function TablaSolicitudes({
  solicitudes,
  loading,
  error,
  onReintentar,
  onGestionar,
}: TablaSolicitudesProps) {
  return (
    <div id="solicitudes" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A2E]">Gestión de solicitudes</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Todas las solicitudes del sistema</p>
        </div>
        {!loading && (
          <span className="text-xs font-medium bg-gray-100 text-[#6B7280] px-2.5 py-1 rounded-full">
            {solicitudes.length} total{solicitudes.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-10 flex justify-center items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
          <span className="text-sm text-[#6B7280]">Cargando datos...</span>
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-red-50">
          <p className="text-[#F44336] font-semibold text-sm">{error}</p>
          <button onClick={onReintentar} className="mt-3 text-sm text-[#1565C0] underline">
            Reintentar
          </button>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-[#1A1A2E]">No hay solicitudes registradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                {["ID", "Fecha solicitud", "Última actualización", "Destino", "Prioridad", "Estado", "Acciones"].map((h) => (
                  <th key={h} className={`px-6 py-3 font-semibold ${h === "Acciones" ? "text-center" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {solicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-[#6B7280]">
                    #{sol.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-[#1A1A2E] font-medium text-xs">
                    {new Date(sol.fechaCreacion).toLocaleDateString("es-AR", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-[#6B7280] text-xs">
                    {new Date(sol.fechaActualizacion).toLocaleDateString("es-AR", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-[#6B7280]">
                    {sol.latDestino.toFixed(3)}, {sol.lonDestino.toFixed(3)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getPrioridadColor(sol.prioridad)}`}>
                      {sol.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(sol.estado)}`}>
                      {ETIQUETAS_ESTADO[sol.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/solicitudes/${sol.id}`}
                        className="text-[#6B7280] bg-gray-50 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        Ver detalle
                      </Link>
                      <button
                        onClick={() => onGestionar(sol)}
                        className="text-[#1565C0] bg-blue-50 hover:bg-[#1565C0] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        Gestionar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}