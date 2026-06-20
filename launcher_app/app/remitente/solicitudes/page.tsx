"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/StatusBadge";

type FilterTab = "TODAS" | "PENDIENTES" | "PREPARACION" | "EN_CAMINO" | "ENTREGADAS" | "CANCELADAS";

interface SolicitudMock {
  id: string;
  solicitante: string;
  estado: string;
  prioridad: string;
  destino: { lat: number; lng: number };
  productos: { nombre: string; cantidad: number }[];
  fecha_solicitada: string;
  id_base?: string;
}

const MOCK_SOLICITUDES: SolicitudMock[] = [
  {
    id: "SOL-001",
    solicitante: "María López",
    estado: "Asignada",
    prioridad: "Alta",
    destino: { lat: -34.6037, lng: -58.3816 },
    productos: [{ nombre: "Vacunas", cantidad: 50 }, { nombre: "Botiquín", cantidad: 2 }],
    fecha_solicitada: "2026-06-18T10:30:00",
    id_base: "BASE-001",
  },
  {
    id: "SOL-002",
    solicitante: "Juan Pérez",
    estado: "En preparación",
    prioridad: "Media",
    destino: { lat: -31.4201, lng: -64.1888 },
    productos: [{ nombre: "Raciones", cantidad: 200 }],
    fecha_solicitada: "2026-06-17T14:00:00",
    id_base: "BASE-001",
  },
  {
    id: "SOL-003",
    solicitante: "Ana García",
    estado: "Lista",
    prioridad: "Urgente",
    destino: { lat: -32.9468, lng: -60.6393 },
    productos: [{ nombre: "Vacunas", cantidad: 100 }, { nombre: "Raciones", cantidad: 50 }],
    fecha_solicitada: "2026-06-16T08:15:00",
    id_base: "BASE-001",
  },
  {
    id: "SOL-004",
    solicitante: "Carlos Ruiz",
    estado: "En camino",
    prioridad: "Alta",
    destino: { lat: -34.9214, lng: -57.9545 },
    productos: [{ nombre: "Botiquín", cantidad: 5 }],
    fecha_solicitada: "2026-06-15T16:45:00",
    id_base: "BASE-001",
  },
  {
    id: "SOL-005",
    solicitante: "Laura Fernández",
    estado: "Entregada",
    prioridad: "Baja",
    destino: { lat: -27.4514, lng: -58.9881 },
    productos: [{ nombre: "Raciones", cantidad: 300 }],
    fecha_solicitada: "2026-06-14T09:00:00",
    id_base: "BASE-001",
  },
  {
    id: "SOL-006",
    solicitante: "Pedro Martínez",
    estado: "Cancelada",
    prioridad: "Media",
    destino: { lat: -33.0348, lng: -58.5156 },
    productos: [{ nombre: "Vacunas", cantidad: 25 }],
    fecha_solicitada: "2026-06-13T11:20:00",
    id_base: "BASE-001",
  },
];

const getStatusGroup = (estado: string): FilterTab => {
  switch (estado) {
    case "En preparación":
    case "Lista":
      return "PREPARACION";
    case "En camino":
    case "Lanzada":
      return "EN_CAMINO";
    case "Entregada":
    case "Completada":
      return "ENTREGADAS";
    case "Cancelada":
    case "Anulada":
    case "Rechazada":
      return "CANCELADAS";
    default:
      return "PENDIENTES";
  }
};

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

export default function RemitenteSolicitudesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("TODAS");

  const filtered = MOCK_SOLICITUDES.filter((s) => {
    if (activeTab === "TODAS") return true;
    return getStatusGroup(s.estado) === activeTab;
  });

  const getCount = (tab: FilterTab) => {
    if (tab === "TODAS") return MOCK_SOLICITUDES.length;
    return MOCK_SOLICITUDES.filter((s) => getStatusGroup(s.estado) === tab).length;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) + " - " +
           d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "TODAS", label: "Todas" },
    { key: "PENDIENTES", label: "Pendientes" },
    { key: "PREPARACION", label: "En preparación" },
    { key: "EN_CAMINO", label: "En camino" },
    { key: "ENTREGADAS", label: "Entregadas" },
    { key: "CANCELADAS", label: "Canceladas" },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Solicitudes asignadas</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Gestioná las solicitudes de suministro asignadas a tu base de lanzamiento.
        </p>
      </div>

      <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-semibold gap-2 overflow-x-auto pb-0.5">
        {tabs.map(({ key, label }) => {
          const isActive = activeTab === key;
          const count = getCount(key);
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "border-brand text-brand font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
              }`}
            >
              <span>{label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive
                  ? "bg-orange-100 text-brand"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center">
          <span className="text-3xl mb-2">📦</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No se encontraron solicitudes.</p>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Probá cambiando los filtros.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => router.push(`/remitente/solicitudes/${s.id}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                    #{s.id}
                  </span>
                  <StatusBadge variant={getStatusVariant(s.estado)}>{s.estado}</StatusBadge>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {s.prioridad}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1 mt-1">
                  <p><strong>Solicitante:</strong> {s.solicitante}</p>
                  <p><strong>Fecha:</strong> {formatDate(s.fecha_solicitada)}</p>
                  <p><strong>Destino:</strong> Lat: {s.destino.lat.toFixed(4)}, Lng: {s.destino.lng.toFixed(4)}</p>
                  {s.id_base && <p><strong>Base:</strong> {s.id_base}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1 border-t border-b border-slate-50 dark:border-slate-800 py-3 md:border-0 md:py-0 md:px-6 max-w-xs text-xs">
                <span className="font-semibold text-slate-400 dark:text-slate-500 block mb-1">Productos:</span>
                {s.productos.map((p, idx) => (
                  <div key={idx} className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                    <span>• {p.nombre}</span>
                    <span className="font-semibold">x{p.cantidad}</span>
                  </div>
                ))}
              </div>

              <div className="shrink-0 flex items-center">
                <span className="text-brand text-xs font-semibold">Ver detalle →</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
