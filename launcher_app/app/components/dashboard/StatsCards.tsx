"use client";

// Cards de estadísticas resumidas del dashboard de admin.
import React from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { SolicitudJSON } from "./types";

interface StatsCardsProps {
  solicitudes: SolicitudJSON[];
  loading: boolean;
}

export default function StatsCards({ solicitudes, loading }: StatsCardsProps) {
  const total = solicitudes.length;
  const entregadas = solicitudes.filter(
    (s) => s.estado === EstadoSolicitud.Completada,
  ).length;
  const canceladas = solicitudes.filter(
    (s) =>
      s.estado === EstadoSolicitud.Cancelada ||
      s.estado === EstadoSolicitud.Anulada,
  ).length;
  const enCamino = solicitudes.filter(
    (s) =>
      s.estado === EstadoSolicitud.EnCamino ||
      s.estado === EstadoSolicitud.Lanzada,
  ).length;

  const statsCards = [
    {
      label: "Solicitudes totales",
      valor: total,
      sub: "registradas en el sistema",
      color: "#2196F3",
      bg: "#E3F2FD",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      label: "Entregadas",
      valor: entregadas,
      sub: `${total > 0 ? ((entregadas / total) * 100).toFixed(0) : 0}% del total`,
      color: "#4CAF50",
      bg: "#E8F5E9",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Canceladas",
      valor: canceladas,
      sub: `${total > 0 ? ((canceladas / total) * 100).toFixed(0) : 0}% del total`,
      color: "#F44336",
      bg: "#FFEBEE",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "En camino",
      valor: enCamino,
      sub: "activas ahora",
      color: "#FF9800",
      bg: "#FFF3E0",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {loading
        ? [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse h-28 border border-gray-100" />
          ))
        : statsCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280] font-medium leading-tight">{card.label}</p>
                <p className="text-2xl font-bold text-[#1A1A2E] mt-0.5 leading-none">
                  {card.valor.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">{card.sub}</p>
              </div>
            </div>
          ))}
    </div>
  );
}