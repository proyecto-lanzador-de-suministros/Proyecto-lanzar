"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationItem from "./NotificationItem";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";

interface NotificacionBackend {
  id_notificacion: string;
  mensaje: string;
  fecha_hora: string;
  id_solicitud: string | null;
}

export default function NotificationsPanel() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<NotificacionBackend[]>([]);

  useEffect(() => {
    obtenerNotificacionesAction().then((res) => {
      if (res.success && res.data) {
        setNotificaciones(res.data.slice(0, 5));
      }
    });
  }, []);

  const formatHora = (fechaStr: string) => {
    const d = new Date(fechaStr);
    const ahora = new Date();
    const diffDias = Math.floor((ahora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias === 0) return `Hoy, ${d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDias === 1) return `Ayer, ${d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  };

  if (notificaciones.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Notificaciones recientes
        </h2>
        <button
          onClick={() => router.push("/remitente/notificaciones")}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ver todas
        </button>
      </div>

      <div>
        {notificaciones.map((n) => (
          <NotificationItem
            key={n.id_notificacion}
            tipo="nueva"
            titulo={n.mensaje.length > 50 ? n.mensaje.substring(0, 50) + "..." : n.mensaje}
            descripcion={n.mensaje}
            hora={formatHora(n.fecha_hora)}
          />
        ))}
      </div>
    </section>
  );
}
