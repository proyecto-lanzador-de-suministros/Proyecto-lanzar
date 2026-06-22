"use client";

// Acciones rápidas (links a otras secciones) y alertas derivadas del estado actual de las solicitudes.
import React from "react";

interface AccionesYAlertasProps {
  pendientes: number;
  canceladas: number;
}

const alertaColors = {
  warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "#FF9800" },
  danger: { bg: "bg-red-50", border: "border-red-200", icon: "#F44336" },
  info: { bg: "bg-blue-50", border: "border-blue-200", icon: "#2196F3" },
} as const;

export default function AccionesYAlertas({
  pendientes,
  canceladas,
}: AccionesYAlertasProps) {
  const alertas = [
    ...(pendientes > 0
      ? [
          {
            tipo: "warning" as const,
            texto: "Solicitudes sin asignar",
            sub: `Hay ${pendientes} pendiente${pendientes !== 1 ? "s" : ""} de asignación.`,
          },
        ]
      : []),
    ...(canceladas > 0
      ? [
          {
            tipo: "danger" as const,
            texto: `${canceladas} cancelada${canceladas !== 1 ? "s" : ""}`,
            sub: "Revisar motivos de cancelación.",
          },
        ]
      : []),
    {
      tipo: "info" as const,
      texto: "Sistema operativo",
      sub: "Todos los servicios funcionan correctamente.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-[#1A1A2E] mb-3">
          Acciones rápidas
        </h2>
        <div className="divide-y divide-gray-100">
          {[
            { label: "Gestionar solicitudes", href: "#solicitudes" },
            { label: "Enviar notificación", href: "#notificaciones" },
            { label: "Generar reporte", href: "#reportes" },
          ].map((a) => (
            <a
              key={a.label}
              href={a.href}
              className="flex items-center justify-between py-3 text-sm text-[#1A1A2E] hover:text-[#1565C0] transition-colors group"
            >
              {a.label}
              <svg
                className="w-4 h-4 text-[#6B7280] group-hover:text-[#1565C0] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-[#1A1A2E] mb-3">Alertas</h2>
        <div className="space-y-2">
          {alertas.map((a, i) => {
            const c = alertaColors[a.tipo];
            return (
              <div key={i} className={`rounded-lg border px-3 py-2.5 ${c.bg} ${c.border}`}>
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: c.icon }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A2E]">{a.texto}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">{a.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}