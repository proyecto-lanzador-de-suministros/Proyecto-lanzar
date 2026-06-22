"use client";

// Gráfico de dona (SVG puro) que muestra la distribución de solicitudes por estado.
import React from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { SolicitudJSON } from "./types";

interface GraficaDonaProps {
  solicitudes: SolicitudJSON[];
}

export default function GraficaDona({ solicitudes }: GraficaDonaProps) {
  const total = solicitudes.length || 1;

  const enCamino = solicitudes.filter(
    (s) => s.estado === EstadoSolicitud.EnCamino || s.estado === EstadoSolicitud.Lanzada,
  ).length;
  const porLlegar = solicitudes.filter(
    (s) =>
      s.estado === EstadoSolicitud.Creada ||
      s.estado === EstadoSolicitud.Asignada ||
      s.estado === EstadoSolicitud.EnPreparacion ||
      s.estado === EstadoSolicitud.Lista,
  ).length;
  const entregadas = solicitudes.filter(
    (s) => s.estado === EstadoSolicitud.Completada,
  ).length;
  const canceladas = solicitudes.filter(
    (s) => s.estado === EstadoSolicitud.Cancelada || s.estado === EstadoSolicitud.Anulada,
  ).length;

  const datos = [
    { valor: enCamino, color: "#2196F3", label: "En camino" },
    { valor: porLlegar, color: "#FF9800", label: "Por llegar" },
    { valor: entregadas, color: "#4CAF50", label: "Entregadas" },
    { valor: canceladas, color: "#F44336", label: "Canceladas" },
  ];

  const cx = 80;
  const cy = 80;
  const r = 58;
  const grosor = 20;
  const circunferencia = 2 * Math.PI * r;

  let acumulado = 0;
  const arcos = datos.map((d) => {
    const porcentaje = d.valor / total;
    const offset = circunferencia * (1 - acumulado);
    const dash = circunferencia * porcentaje;
    acumulado += porcentaje;
    return { ...d, porcentaje, offset, dash };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8ECF0" strokeWidth={grosor} />
          {arcos.map((a, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={grosor}
              strokeDasharray={`${a.dash} ${circunferencia - a.dash}`}
              strokeDashoffset={a.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#1A1A2E]">{solicitudes.length}</span>
          <span className="text-xs text-[#6B7280]">Total</span>
        </div>
      </div>

      <div className="space-y-3 w-full">
        {datos.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-sm text-[#1A1A2E]">{d.label}</span>
            </div>
            <span className="text-sm font-semibold text-[#1A1A2E]">
              {d.valor}{" "}
              <span className="text-[#6B7280] font-normal text-xs">
                ({total > 0 ? ((d.valor / total) * 100).toFixed(1) : "0.0"}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}