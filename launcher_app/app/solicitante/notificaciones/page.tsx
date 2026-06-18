"use client";

import React, { useEffect, useState } from "react";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";

interface NotificationJSON {
  id_notificacion: string;
  mensaje: string;
  fecha_hora: string;
  id_solicitud: string;
}

export default function NotificacionesPage() {
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
    <div className="flex flex-col gap-6 font-sans max-w-4xl">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notificaciones</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Historial de todas las notificaciones de estado y alertas de tus lanzamientos.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center">
          <span className="text-3xl mb-2">🔔</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No tienes notificaciones.</p>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Los cambios en el estado de tus pedidos aparecerán aquí.</p>
        </div>
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6">
          {notificaciones.map((n) => (
            <div key={n.id_notificacion} className="relative animate-fade-in">
              {/* Indicador de punto en el timeline */}
              <span className="absolute -left-[30px] top-1 bg-white dark:bg-slate-900 border-2 border-brand w-4 h-4 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              </span>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{n.mensaje}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
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
  );
}
