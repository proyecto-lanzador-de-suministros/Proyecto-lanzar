"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listarNotificacionesGlobalAction } from "@/src/actions/notificaciones.actions";

interface NotificacionGlobalJSON {
  id: string;
  mensaje: string;
  fechaHora: string;
  solicitudId: string;
  destinatarioId: string;
  destinatarioNombre: string;
}

export default function AdminNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<NotificacionGlobalJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  const cargar = async (paginaActual: number) => {
    setLoading(true);
    setError(null);
    const res = await listarNotificacionesGlobalAction({ pagina: paginaActual });
    if (res.success && res.data) {
      setNotificaciones(res.data);
      setTotalPaginas(res.paginacion?.totalPaginas ?? 1);
      setTotal(res.paginacion?.total ?? 0);
    } else {
      setError(res.error ?? "No se pudieron cargar las notificaciones.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargar(pagina);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

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
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Notificaciones</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Todas las notificaciones enviadas a solicitantes y remitentes del sistema.
          </p>
        </div>
        {!loading && (
          <span className="text-xs font-medium bg-gray-100 text-[#6B7280] px-2.5 py-1.5 rounded-full">
            {total} notificación{total !== 1 ? "es" : ""} enviada{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
              <span className="text-sm text-[#6B7280]">Cargando notificaciones...</span>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="p-10 text-center">
              <span className="text-3xl mb-2 block">🔔</span>
              <p className="text-sm font-medium text-[#1A1A2E]">No se enviaron notificaciones todavía.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3 font-semibold">Fecha y hora</th>
                    <th className="px-6 py-3 font-semibold">Mensaje</th>
                    <th className="px-6 py-3 font-semibold">Solicitud</th>
                    <th className="px-6 py-3 font-semibold">Destinatario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {notificaciones.map((n) => (
                    <tr key={n.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 text-[#1A1A2E] text-xs whitespace-nowrap">
                        {formatFecha(n.fechaHora)}
                      </td>
                      <td className="px-6 py-4 text-[#1A1A2E] max-w-md">
                        {n.mensaje}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/solicitudes/${n.solicitudId}`}
                          className="font-mono text-xs text-[#1565C0] hover:underline"
                        >
                          #{n.solicitudId.substring(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[#1A1A2E] text-xs">
                        {n.destinatarioNombre}
                        <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">
                          {n.destinatarioId.substring(0, 12)}…
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!loading && notificaciones.length > 0 && (
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