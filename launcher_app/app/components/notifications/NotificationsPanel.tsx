// app/components/dashboard/NotificationsPanel.tsx
import NotificationItem, { NotificationItemProps } from "./NotificationItem";

// TODO: reemplazar por datos reales
const NOTIFICACIONES_MOCK: NotificationItemProps[] = [
  {
    tipo: "nueva",
    titulo: "Nueva solicitud asignada",
    descripcion: "Tenés una nueva solicitud #SOL-1260 asignada.",
    hora: "Hoy, 11:23",
  },
  {
    tipo: "en_camino",
    titulo: "Solicitud en camino",
    descripcion: "La solicitud #SOL-1187 ya está en camino.",
    hora: "Hoy, 10:15",
  },
  {
    tipo: "entregada",
    titulo: "Entrega completada",
    descripcion: "La solicitud #SOL-1089 fue entregada correctamente.",
    hora: "Ayer, 16:45",
  },
];

export default function NotificationsPanel() {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Notificaciones recientes
        </h2>
        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Ver todas
        </button>
      </div>

      <div>
        {NOTIFICACIONES_MOCK.map((n) => (
          <NotificationItem key={n.hora} {...n} />
        ))}
      </div>
    </section>
  );
}
