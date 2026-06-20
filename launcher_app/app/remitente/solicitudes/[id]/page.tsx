"use client";

import React from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/StatusBadge";

const MOCK_DETALLE = {
  id: "SOL-001",
  solicitante: "María López",
  emailSolicitante: "maria@ejemplo.com",
  estado: "Asignada",
  prioridad: "Alta",
  destino: { lat: -34.6037, lng: -58.3816, direccion: "Calle Falsa 123, CABA" },
  fecha_solicitada: "2026-06-18T10:30:00",
  fecha_asignada: "2026-06-18T11:00:00",
  id_base: "BASE-001",
  nombre_base: "Base El Palomar",
  motivoCancelacion: null,
  productos: [
    { nombre: "Vacunas y Suero Fisiológico", cantidad: 50 },
    { nombre: "Botiquín de Primeros Auxilios", cantidad: 2 },
  ],
  historialEstados: [
    { estado: "Creada", fecha: "2026-06-18T10:30:00", usuario: "María López" },
    { estado: "Asignada", fecha: "2026-06-18T11:00:00", usuario: "Sistema" },
  ],
};

const MOCK_PRODUCTOS_BASE = [
  { id: "VAC-001", nombre: "Vacunas", disponible: 200 },
  { id: "BOT-001", nombre: "Botiquín", disponible: 15 },
  { id: "RAC-001", nombre: "Raciones", disponible: 500 },
];

const STATUS_FLOW = ["Asignada", "En preparación", "Lista", "En camino", "Lanzada", "Entregada"];

export default function RemitenteSolicitudDetallePage() {
  const router = useRouter();
  const sol = MOCK_DETALLE;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) + " - " +
           d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
  };

  const currentStepIndex = STATUS_FLOW.indexOf(sol.estado);

  const getStatusVariant = (estado: string): "info" | "success" | "danger" | "warning" => {
    switch (estado) {
      case "En camino":
      case "Lanzada":
        return "info";
      case "Entregada":
      case "Completada":
        return "success";
      case "Cancelada":
      case "Anulada":
      case "Rechazada":
        return "danger";
      default:
        return "warning";
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-5xl">

      <button
        onClick={() => router.push("/remitente/solicitudes")}
        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 w-fit cursor-pointer bg-transparent border-none"
      >
        ← Volver a solicitudes
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">
            #{sol.id}
          </h1>
          <StatusBadge variant={getStatusVariant(sol.estado)}>{sol.estado}</StatusBadge>
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            Prioridad {sol.prioridad}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">SOLICITANTE</p>
              <p className="text-slate-700 dark:text-slate-300">{sol.solicitante}</p>
              <p className="text-xs text-slate-400">{sol.emailSolicitante}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">DESTINO</p>
              <p className="text-slate-700 dark:text-slate-300">{sol.destino.direccion}</p>
              <p className="text-xs text-slate-400">Lat: {sol.destino.lat.toFixed(6)} | Lng: {sol.destino.lng.toFixed(6)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">BASE ASIGNADA</p>
              <p className="text-slate-700 dark:text-slate-300">{sol.nombre_base}</p>
              <p className="text-xs text-slate-400">{sol.id_base}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">FECHAS</p>
              <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Solicitada:</strong> {formatDate(sol.fecha_solicitada)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Asignada:</strong> {formatDate(sol.fecha_asignada)}</p>
            </div>
          </div>
        </div>

        {sol.motivoCancelacion && (
          <div className="mt-4 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs">
            <strong>Motivo de cancelación:</strong> {sol.motivoCancelacion}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Productos solicitados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-400 font-semibold uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2">Cantidad</th>
                    <th className="pb-2">Disponible en base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {sol.productos.map((p, idx) => {
                    const prodBase = MOCK_PRODUCTOS_BASE.find((pb) => p.nombre.toLowerCase().includes(pb.nombre.toLowerCase()));
                    const suficiente = prodBase ? prodBase.disponible >= p.cantidad : false;
                    return (
                      <tr key={idx}>
                        <td className="py-3 text-slate-700 dark:text-slate-300">{p.nombre}</td>
                        <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{p.cantidad}</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold ${suficiente ? "text-green-600" : "text-red-500"}`}>
                            {prodBase ? `${prodBase.disponible} unid.` : "—"}{" "}
                            {suficiente ? "✅" : "❌"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Línea de tiempo</h2>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-6 space-y-5">
              {sol.historialEstados.map((h, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="absolute -left-[26px] top-0.5 bg-white dark:bg-slate-900 border-2 border-brand w-3.5 h-3.5 rounded-full" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{h.estado}</p>
                  <p className="text-slate-400 text-[11px]">{formatDate(h.fecha)} por {h.usuario}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">Acciones</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Avanzá el estado de la solicitud según el progreso real.
            </p>

            {currentStepIndex >= 0 && currentStepIndex < STATUS_FLOW.length - 1 && (
              <button
                className="w-full bg-brand text-white font-semibold py-2.5 px-4 rounded-lg text-xs hover:bg-orange-600 transition-colors cursor-pointer mb-2"
              >
                Marcar como "{STATUS_FLOW[currentStepIndex + 1]}"
              </button>
            )}

            {currentStepIndex >= 0 && currentStepIndex < STATUS_FLOW.length - 2 && (
              <button
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold py-2 px-4 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Saltar a "{STATUS_FLOW[STATUS_FLOW.length - 2]}"
              </button>
            )}

            {sol.estado !== "Cancelada" && sol.estado !== "Entregada" && (
              <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4">
                <button className="w-full bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400 font-semibold py-2 px-4 rounded-lg text-xs hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors cursor-pointer">
                  Cancelar solicitud
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">Stock en base</h2>
            <div className="space-y-2 text-xs">
              {MOCK_PRODUCTOS_BASE.map((p) => (
                <div key={p.id} className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">{p.nombre}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{p.disponible} unid.</span>
                </div>
              ))}
              <button
                onClick={() => router.push("/remitente/stock")}
                className="w-full mt-3 text-brand font-semibold text-xs hover:underline bg-transparent border-none cursor-pointer"
              >
                Ir a stock →
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
