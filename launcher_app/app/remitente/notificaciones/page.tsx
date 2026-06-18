"use client";

import React, { useEffect, useState } from "react";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";
import DashboardShell from "@/app/components/layout/DashboardShell";

interface NotificationJSON {
  id_notificacion: string;
  mensaje: string;
  fecha_hora: string;
  id_solicitud: string;
}

export default function RemitenteNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<NotificationJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await obtenerNotificacionesAction();
      if (res.success && res.data) {
        setNotificaciones(res.data);
      } else {
        setError(res.error || "No se pudieron cargar las notificaciones.");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) + " - " + 
           d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
  };

  return (
    <DashboardShell
      sidebar={{ activeHref: "/remitente/notificaciones" }}
      topBar={{
        role: "Remitente",
        subtitle: "Historial de notificaciones y alertas operativas.",
        notificationCount: 0,
      }}
    >
      <div className="flex flex-col gap-6 font-sans max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        
        {/* Cabecera */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Notificaciones de Base</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Alertas operativas de tu base de lanzamiento asignada.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
            <span className="text-3xl mb-2 block">🔔</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No tienes notificaciones.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Los avisos de asignaciones y cancelaciones aparecerán aquí.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6">
            {notificaciones.map((n) => (
              <div key={n.id_notificacion} className="relative animate-fade-in text-xs">
                {/* Indicador de punto en el timeline */}
                <span className="absolute -left-[30px] top-1 bg-white dark:bg-slate-900 border-2 border-brand w-4 h-4 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                </span>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{n.mensaje}</p>
                  <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400">
                    <span>{formatDate(n.fecha_hora)}</span>
                    <span>•</span>
                    <span className="font-mono">Solicitud #{n.id_solicitud.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
