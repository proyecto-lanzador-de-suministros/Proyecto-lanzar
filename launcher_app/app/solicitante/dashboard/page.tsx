"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { obtenerSolicitudesSolicitanteAction } from "@/src/actions/solicitudes.actions";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";
import CoverageMap from "@/app/components/map/CoverageMap";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";

interface NotificationJSON {
  id_notificacion: string;
  mensaje: string;
  fecha_hora: string;
  id_solicitud: string;
}

export default function SolicitanteDashboard() {
  const { user } = useUser();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificationJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para la ubicación seleccionada en el mapa
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [resSol, resNotif] = await Promise.all([
        obtenerSolicitudesSolicitanteAction(),
        obtenerNotificacionesAction(),
      ]);

      if (resSol.success && resSol.data) {
        setSolicitudes(resSol.data);
      } else if (resSol.error) {
        setError(resSol.error);
      }

      if (resNotif.success && resNotif.data) {
        setNotificaciones(resNotif.data);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPoint = (lat: number, lng: number) => {
    setSelectedPoint({ lat, lng });
  };

  const router = useRouter();
  const handleCreateClick = () => {
    if (!selectedPoint) return;
    router.push(
      `/solicitante/solicitudes/nueva?lat=${selectedPoint.lat}&lon=${selectedPoint.lng}`
    );
  };

  // Agrupamiento y conteo de estados para las tarjetas
  const getCounts = () => {
    let enCamino = 0;
    let porLlegar = 0;
    let entregadas = 0;
    let canceladas = 0;

    solicitudes.forEach((s) => {
      const est = s.estado;
      if (est === EstadoSolicitud.EnCamino || est === EstadoSolicitud.Lanzada) {
        enCamino++;
      } else if (
        est === EstadoSolicitud.Creada ||
        est === EstadoSolicitud.Asignada ||
        est === EstadoSolicitud.EnPreparacion ||
        est === EstadoSolicitud.Lista
      ) {
        porLlegar++;
      } else if (est === EstadoSolicitud.Completada) {
        entregadas++;
      } else if (
        est === EstadoSolicitud.Cancelada ||
        est === EstadoSolicitud.Anulada ||
        est === EstadoSolicitud.Rechazada
      ) {
        canceladas++;
      }
    });

    return { enCamino, porLlegar, entregadas, canceladas };
  };

  const { enCamino, porLlegar, entregadas, canceladas } = getCounts();

  const getStatusDisplay = (est: EstadoSolicitud) => {
    switch (est) {
      case EstadoSolicitud.EnCamino:
      case EstadoSolicitud.Lanzada:
        return { text: "En camino", variant: "info" as const };
      case EstadoSolicitud.Completada:
        return { text: "Entregado", variant: "success" as const };
      case EstadoSolicitud.Cancelada:
      case EstadoSolicitud.Anulada:
      case EstadoSolicitud.Rechazada:
        return { text: "Cancelado", variant: "danger" as const };
      default:
        return { text: "Por llegar", variant: "warning" as const };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) + ", " + 
           d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Grid Superior: Mapa y Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Principal: Mapa y Mis Solicitudes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Card de Nueva Solicitud */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Nueva solicitud</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Haz clic en el mapa para marcar el punto de entrega y habilitar la creación.
                </p>
              </div>
              <Button
                onClick={handleCreateClick}
                disabled={!selectedPoint}
                className={`transition-all ${
                  selectedPoint
                    ? "bg-brand text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                Crear solicitud
              </Button>
            </div>

            {/* Coordenadas seleccionadas info */}
            {selectedPoint && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 text-orange-800 dark:text-orange-300 text-xs px-3 py-2 rounded-lg flex items-center justify-between">
                <span>
                  <strong>Ubicación seleccionada:</strong> Lat: {selectedPoint.lat.toFixed(6)}, Lng: {selectedPoint.lng.toFixed(6)}
                </span>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-orange-600 hover:text-orange-800 font-semibold cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
            )}

            {/* Mapa interactivo */}
            <div className="w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <CoverageMap onSelectPoint={handleSelectPoint} selectedPoint={selectedPoint} />
            </div>
          </div>

          {/* Card de Mis Solicitudes (Vista Rápida) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Mis solicitudes recientes</h2>
              <Link href="/solicitante/missolicitudes">
                <span className="text-xs text-brand hover:underline font-semibold cursor-pointer">Ver todas</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <p className="text-sm text-slate-400 dark:text-slate-500">Aún no has realizado ninguna solicitud.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Marca un punto en el mapa para comenzar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Estado</th>
                      <th className="py-3 px-2">Prioridad</th>
                      <th className="py-3 px-2">Fecha Solicitada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.slice(0, 3).map((s) => {
                      const statusInfo = getStatusDisplay(s.estado);
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-2 font-mono font-semibold text-slate-700 dark:text-slate-300">
                            #{s.id.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3 px-2">
                            <StatusBadge variant={statusInfo.variant}>{statusInfo.text}</StatusBadge>
                          </td>
                          <td className="py-3 px-2 font-medium capitalize">{s.prioridad.toLowerCase()}</td>
                          <td className="py-3 px-2 text-slate-400">{formatDate(s.fecha_solicitada)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Columna Lateral: Estado global, Notificaciones y Ayuda */}
        <div className="flex flex-col gap-6">
          
          {/* Card de Estado de Solicitudes (Contadores) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Estado de tus solicitudes</h2>
            
            <div className="flex flex-col gap-2.5">
              
              {/* En camino */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">✈️</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">En camino</span>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{enCamino}</span>
              </div>

              {/* Por llegar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/30 dark:border-orange-900/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">⏱️</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Por llegar</span>
                </div>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{porLlegar}</span>
              </div>

              {/* Entregados */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100/30 dark:border-green-900/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✅</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Entregados</span>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{entregadas}</span>
              </div>

              {/* Cancelados */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100/30 dark:border-red-900/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm">❌</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cancelados</span>
                </div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{canceladas}</span>
              </div>

            </div>
          </div>

          {/* Card de Notificaciones Recientes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notificaciones recientes</h2>
              <Link href="/solicitante/notificaciones">
                <span className="text-xs text-brand hover:underline font-semibold cursor-pointer">Ver todas</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                No tienes notificaciones recientes.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {notificaciones.slice(0, 3).map((n) => (
                  <div key={n.id_notificacion} className="flex gap-2.5 text-xs pb-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                    <span className="text-brand shrink-0">🔔</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">{n.mensaje}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{formatDate(n.fecha_hora)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card de Información Útil */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-3 text-xs">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Información útil</h2>
            
            <div className="flex flex-col gap-2">
              <Link href="/solicitante/ayuda">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">¿Cómo hacer una solicitud?</span>
                  <span className="text-slate-400">➔</span>
                </div>
              </Link>
              <Link href="/solicitante/ayuda">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Condiciones de envío</span>
                  <span className="text-slate-400">➔</span>
                </div>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}