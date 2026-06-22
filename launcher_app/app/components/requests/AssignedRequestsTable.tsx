"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { consultarSolicitudesPendientesAction } from "@/src/actions/solicitudes.actions";

const STATUS_VARIANT: Record<string, "info" | "success" | "danger" | "warning"> = {
  "En preparación": "warning",
  "Lista": "warning",
  "En camino": "info",
  "Lanzada": "info",
  "Completada": "success",
  "Entregada": "success",
  "Cancelada": "danger",
  "Anulada": "danger",
  "Rechazada": "danger",
  "Asignada": "warning",
  "Creada": "warning",
};

interface SolicitudItem {
  id: string;
  solicitanteNombre: string;
  estado: string;
  prioridad: string;
  fecha_solicitada: string;
}

export default function AssignedRequestsTable() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    consultarSolicitudesPendientesAction().then((res) => {
      if (res.success && res.data) {
        setSolicitudes(res.data.slice(0, 5));
        setTotal(res.data.length);
      }
    });
  }, []);

  if (solicitudes.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Solicitudes asignadas
          </h2>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none">
            {total}
          </span>
        </div>
        <button
          onClick={() => router.push("/remitente/solicitudes")}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ver todas
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            {["ID", "Solicitante", "Estado", "Prioridad", "Acciones"].map((col) => (
              <th
                key={col}
                className="pb-2 text-left text-xs font-medium text-slate-400 dark:text-slate-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => {
            const variant = STATUS_VARIANT[s.estado] || "warning";
            return (
              <tr
                key={s.id}
                className="border-b border-slate-50 dark:border-slate-800 last:border-0"
              >
                <td className="py-3 font-mono font-medium text-slate-700 dark:text-slate-200 text-xs">
                  #{s.id?.substring(0, 8).toUpperCase()}
                </td>
                <td className="py-3 text-xs text-slate-600 dark:text-slate-300">
                  {s.solicitanteNombre}
                </td>
                <td className="py-3">
                  <StatusBadge variant={variant}>{s.estado}</StatusBadge>
                </td>
                <td className="py-3 text-xs text-slate-500">{s.prioridad}</td>
                <td className="py-3">
                  <button
                    onClick={() => router.push(`/remitente/solicitudes/${s.id}`)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
