"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EstadoSolicitud, PrioridadSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { consultarDetalleSolicitudAdminAction } from "@/src/actions/solicitudes.actions";
import { ETIQUETAS_ESTADO, getPrioridadColor, getStatusColor } from "@/app/components/dashboard/constants";

interface HistorialEntryJSON {
  id: string;
  actorId: string;
  estadoAnterior?: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  fechaHora: string;
}

interface DetalleSolicitudJSON {
  id: string;
  solicitanteId: string;
  remitenteId?: string;
  ubicacion_destino: { type: "Point"; coordinates: [number, number] };
  prioridad: PrioridadSolicitud;
  productos: { productoId: string; cantidad: number }[];
  estado: EstadoSolicitud;
  motivoCancelacion?: string;
  motivoAnulacion?: string;
  fechaSolicitada: string;
  fechaActualizacion: string;
  fechaEntrega?: string;
  historial: HistorialEntryJSON[];
}

export default function AdminDetalleSolicitudPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [detalle, setDetalle] = useState<DetalleSolicitudJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    consultarDetalleSolicitudAdminAction(params.id).then((res) => {
      if (res.success && res.data) {
        setDetalle(res.data as DetalleSolicitudJSON);
      } else {
        setError(res.error ?? "No se pudo cargar la solicitud.");
      }
      setLoading(false);
    });
  }, [params.id]);

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
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="text-[#6B7280] hover:text-[#1A1A2E] text-sm font-semibold flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al panel
        </button>
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
            <span className="text-sm text-[#6B7280]">Cargando solicitud...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-[#F44336] font-semibold text-sm">{error}</p>
          </div>
        ) : detalle ? (
          <>
            {/* Encabezado de la solicitud */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                <div>
                  <h1 className="text-xl font-bold text-[#1A1A2E] font-mono">
                    #{detalle.id.substring(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Creada el {formatFecha(detalle.fechaSolicitada)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(detalle.estado)}`}>
                    {ETIQUETAS_ESTADO[detalle.estado]}
                  </span>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${getPrioridadColor(detalle.prioridad)}`}>
                    {detalle.prioridad}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#6B7280] text-xs mb-1">Solicitante</p>
                  <p className="font-mono text-[#1A1A2E]">{detalle.solicitanteId.substring(0, 16)}…</p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs mb-1">Remitente asignado</p>
                  <p className="font-mono text-[#1A1A2E]">
                    {detalle.remitenteId ? `${detalle.remitenteId.substring(0, 16)}…` : "Sin asignar"}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs mb-1">Destino</p>
                  <p className="font-mono text-[#1A1A2E]">
                    {detalle.ubicacion_destino.coordinates[1].toFixed(4)}, {detalle.ubicacion_destino.coordinates[0].toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs mb-1">Última actualización</p>
                  <p className="text-[#1A1A2E]">{formatFecha(detalle.fechaActualizacion)}</p>
                </div>
                {detalle.fechaEntrega && (
                  <div>
                    <p className="text-[#6B7280] text-xs mb-1">Fecha de entrega</p>
                    <p className="text-[#1A1A2E]">{formatFecha(detalle.fechaEntrega)}</p>
                  </div>
                )}
                {detalle.motivoCancelacion && (
                  <div className="md:col-span-2">
                    <p className="text-[#6B7280] text-xs mb-1">Motivo de cancelación</p>
                    <p className="text-[#F44336]">{detalle.motivoCancelacion}</p>
                  </div>
                )}
                {detalle.motivoAnulacion && (
                  <div className="md:col-span-2">
                    <p className="text-[#6B7280] text-xs mb-1">Motivo de anulación</p>
                    <p className="text-[#F44336]">{detalle.motivoAnulacion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Productos solicitados */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">Suministros solicitados</h2>
              {detalle.productos.length === 0 ? (
                <p className="text-sm text-[#6B7280]">Sin productos registrados.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {detalle.productos.map((p, idx) => (
                    <li key={idx} className="py-2.5 flex justify-between text-sm">
                      <span className="font-mono text-[#1A1A2E]">{p.productoId.substring(0, 16)}…</span>
                      <span className="font-semibold text-[#1A1A2E]">x{p.cantidad}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Historial de estados (CU-20) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">Historial de cambios de estado</h2>
              {detalle.historial.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No hay cambios de estado registrados todavía.</p>
              ) : (
                <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-5">
                  {detalle.historial.map((h) => (
                    <div key={h.id} className="relative">
                      <span className="absolute -left-[31px] top-1 bg-white border-2 border-[#1565C0] w-3.5 h-3.5 rounded-full" />
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        {h.estadoAnterior ? (
                          <>
                            <span className="font-semibold text-[#1A1A2E]">
                              {ETIQUETAS_ESTADO[h.estadoAnterior]}
                            </span>
                            <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-[#4CAF50] bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            Creación
                          </span>
                        )}
                        <span className="font-semibold text-[#1A1A2E]">
                          {ETIQUETAS_ESTADO[h.estadoNuevo]}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {formatFecha(h.fechaHora)} · por {h.actorId.substring(0, 12)}…
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}