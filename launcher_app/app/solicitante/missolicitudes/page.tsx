"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { obtenerSolicitudesSolicitanteAction, cancelarSolicitudAction } from "@/src/actions/solicitudes.actions";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Button from "@/app/components/ui/Button";

type FilterTab = "TODAS" | "EN_CAMINO" | "POR_LLEGAR" | "ENTREGADAS" | "CANCELADAS";

export default function MisSolicitudesPage() {
  const router = useRouter();
  const [solList, setSolList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("TODAS");

  // Estados para cancelar solicitud
  const [solicToCancel, setSolicToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await obtenerSolicitudesSolicitanteAction();
      if (res.success && res.data) {
        setSolList(res.data);
      } else {
        setError(res.error || "No se pudieron obtener las solicitudes.");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado al obtener solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchSolicitudes());
  }, []);

  const handleCancelClick = (sol: any) => {
    setSolicToCancel(sol);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!solicToCancel) return;
    setCanceling(true);
    try {
      const res = await cancelarSolicitudAction(solicToCancel.id, cancelReason);
      if (res.success) {
        setSolicToCancel(null);
        await fetchSolicitudes();
      } else {
        alert("Error al cancelar la solicitud: " + res.error);
      }
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    } finally {
      setCanceling(false);
    }
  };

  const ESTADO_LABELS: Record<string, string> = {
  [EstadoSolicitud.Creada]: "Creada",
  [EstadoSolicitud.Asignada]: "Asignada",
  [EstadoSolicitud.EnPreparacion]: "En preparación",
  [EstadoSolicitud.Lista]: "Lista",
  [EstadoSolicitud.EnCamino]: "En camino",
  [EstadoSolicitud.Lanzada]: "Lanzada",
  [EstadoSolicitud.Completada]: "Entregada",
  [EstadoSolicitud.Cancelada]: "Cancelada",
  [EstadoSolicitud.Anulada]: "Anulada",
  [EstadoSolicitud.Rechazada]: "Rechazada",
};

const getStatusDisplay = (est: EstadoSolicitud) => {
  const text = ESTADO_LABELS[est] ?? est;

  switch (est) {
    case EstadoSolicitud.EnCamino:
    case EstadoSolicitud.Lanzada:
      return { text, variant: "info" as const, group: "EN_CAMINO" };
    case EstadoSolicitud.Completada:
      return { text, variant: "success" as const, group: "ENTREGADAS" };
    case EstadoSolicitud.Cancelada:
    case EstadoSolicitud.Anulada:
    case EstadoSolicitud.Rechazada:
      return { text, variant: "danger" as const, group: "CANCELADAS" };
    default:
      return { text, variant: "warning" as const, group: "POR_LLEGAR" };
  }
};

  // Filtrado de solicitudes según el tab activo
  const filteredSolicitudes = solList.filter((s) => {
    if (activeTab === "TODAS") return true;
    const info = getStatusDisplay(s.estado);
    return info.group === activeTab;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) + " - " + 
           d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis solicitudes</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Consulta, filtra y gestiona el historial de todas tus solicitudes realizadas en el sistema.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tabs de Filtro */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-semibold gap-2 overflow-x-auto pb-0.5">
        {(["TODAS", "POR_LLEGAR", "EN_CAMINO", "ENTREGADAS", "CANCELADAS"] as FilterTab[]).map((tab) => {
          const isActive = activeTab === tab;
          let label = "Todas";
          if (tab === "POR_LLEGAR") label = "En proceso";
          if (tab === "EN_CAMINO") label = "En camino";
          if (tab === "ENTREGADAS") label = "Entregadas";
          if (tab === "CANCELADAS") label = "Canceladas";

          // Contar cuántas hay por grupo
          const count = tab === "TODAS" 
            ? solList.length
            : solList.filter((s) => getStatusDisplay(s.estado).group === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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

      {/* Listado / Tabla */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredSolicitudes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center">
          <span className="text-3xl mb-2">📦</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No se encontraron solicitudes.</p>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Prueba cambiando los filtros o realiza una solicitud en la página de Inicio.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredSolicitudes.map((s) => {
            const statusInfo = getStatusDisplay(s.estado);
            return (
              <div
                key={s.id}
                onClick={() => router.push(`/solicitante/solicitudes/${s.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-brand/40 hover:shadow-md transition-all"
              >
                {/* Información básica */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                      #{s.id.substring(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge variant={statusInfo.variant}>{statusInfo.text}</StatusBadge>
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Prioridad {s.prioridad.toLowerCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1 mt-1">
                    <p>
                      <strong>Fecha de solicitud:</strong> {formatDate(s.fecha_solicitada)}
                    </p>
                    <p>
                      <strong>Destino:</strong> Lat: {s.ubicacion_destino.coordinates[1].toFixed(6)}, Lng: {s.ubicacion_destino.coordinates[0].toFixed(6)}
                    </p>
                    {s.id_base && (
                      <p>
                        <strong>Base asignada:</strong> Base #{s.id_base.substring(0, 8).toUpperCase()}
                      </p>
                    )}
                    {s.motivoCancelacion && (
                      <p className="text-red-500">
                        <strong>Motivo de cancelación:</strong> {s.motivoCancelacion}
                      </p>
                    )}
                    {s.motivoAnulacion && (
                      <p className="text-red-500">
                        <strong>Motivo de anulación:</strong> {s.motivoAnulacion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Productos breakdown */}
                <div className="flex flex-col gap-1 border-t border-b border-slate-50 dark:border-slate-800 py-3 md:border-0 md:py-0 md:px-6 max-w-xs text-xs">
                  <span className="font-semibold text-slate-400 dark:text-slate-500 block mb-1">Productos:</span>
                  {s.productos && s.productos.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                      <span>• {p.productoId === "Vacunas y Suero Fisiológico" ? "Vacunas" : p.productoId === "Botiquín de Primeros Auxilios" ? "Botiquín" : "Raciones"}</span>
                      <span className="font-semibold">x{p.cantidad}</span>
                    </div>
                  ))}
                </div>

                {/* Acciones */}
                <div className="shrink-0 flex items-center justify-end">
                  {s.puedeSerCancelada ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelClick(s);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs py-1.5 px-3 border border-red-200"
                    >
                      Cancelar solicitud
                    </Button>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium italic">
                      No cancelable
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación de Cancelación */}
      {solicToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Cancelar Solicitud</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                ¿Estás seguro de que deseas cancelar la solicitud #{solicToCancel.id.substring(0, 8).toUpperCase()}? Esta acción liberará las provisiones reservadas.
              </p>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 dark:text-slate-500 font-semibold mb-1">Motivo de la cancelación (Opcional):</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Escribe el motivo aquí..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-red-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setSolicToCancel(null)}
                disabled={canceling}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                No, mantener
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={canceling}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors cursor-pointer"
              >
                {canceling ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
