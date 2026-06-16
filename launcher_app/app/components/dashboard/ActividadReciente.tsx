// Panel de actividad reciente derivada de las solicitudes (creación, entrega, cancelación).
import React from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { ETIQUETAS_ESTADO } from "./constants";
import { ActividadItem, SolicitudJSON } from "./types";

interface ActividadRecienteProps {
  solicitudes: SolicitudJSON[];
  loading: boolean;
}

function derivarActividad(solicitudes: SolicitudJSON[]): ActividadItem[] {
  return [...solicitudes]
    .sort(
      (a, b) =>
        new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
    )
    .slice(0, 5)
    .map((s) => {
      const tipo: ActividadItem["tipo"] =
        s.estado === EstadoSolicitud.Completada
          ? "entregada"
          : s.estado === EstadoSolicitud.Cancelada || s.estado === EstadoSolicitud.Anulada
            ? "cancelada"
            : "solicitud_creada";
      return {
        id: s.id,
        tipo,
        titulo:
          tipo === "entregada"
            ? "Solicitud entregada"
            : tipo === "cancelada"
              ? "Solicitud cancelada"
              : "Nueva solicitud creada",
        descripcion: `#SOL-${s.id.substring(0, 6).toUpperCase()} — ${ETIQUETAS_ESTADO[s.estado]}`,
        hora: new Date(s.fechaCreacion).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
}

function IconoActividad({ tipo }: { tipo: ActividadItem["tipo"] }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0";
  if (tipo === "entregada")
    return (
      <div className={`${base} bg-green-100`}>
        <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  if (tipo === "cancelada")
    return (
      <div className={`${base} bg-red-100`}>
        <svg className="w-4 h-4 text-[#F44336]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  return (
    <div className={`${base} bg-blue-100`}>
      <svg className="w-4 h-4 text-[#2196F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </div>
  );
}

export default function ActividadReciente({ solicitudes, loading }: ActividadRecienteProps) {
  const actividad = derivarActividad(solicitudes);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">
        Actividad reciente
      </h2>
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : actividad.length === 0 ? (
        <p className="text-sm text-[#6B7280] py-4 text-center">
          Sin actividad reciente.
        </p>
      ) : (
        <div className="space-y-4">
          {actividad.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <IconoActividad tipo={item.tipo} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1A1A2E] leading-tight">
                    {item.titulo}
                  </p>
                  <span className="text-[10px] text-[#6B7280] whitespace-nowrap flex-shrink-0">
                    {item.hora}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
          <button className="text-xs text-[#1565C0] font-semibold flex items-center gap-1 mt-2 hover:underline">
            Ver todas las actividades
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}