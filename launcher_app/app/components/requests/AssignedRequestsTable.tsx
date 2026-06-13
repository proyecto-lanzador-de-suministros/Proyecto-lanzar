// src/components/dashboard/SolicitudesTable.tsx
import StatusBadge, { StatusBadgeProps } from "@/app/components/ui/StatusBadge";
// TODO: reemplazar mocks e interfcaces helpers por las reales (importarlas)
type EstadoSolicitud =
  | "en_preparacion"
  | "en_camino"
  | "entregada"
  | "cancelada";

interface Solicitud {
  id: string;
  destino: string;
  provincia: string;
  estado: EstadoSolicitud;
  entregaEstimada: string;
}

const ESTADO_CONFIG: Record<
  EstadoSolicitud,
  { label: string; variant: StatusBadgeProps["variant"] }
> = {
  en_preparacion: { label: "En preparación", variant: "warning" },
  en_camino: { label: "En camino", variant: "info" },
  entregada: { label: "Entregada", variant: "success" },
  cancelada: { label: "Cancelada", variant: "danger" },
};

const SOLICITUDES_MOCK: Solicitud[] = [
  {
    id: "#SOL-1248",
    destino: "Plaza Italia, Córdoba",
    provincia: "Córdoba, Córdoba",
    estado: "en_preparacion",
    entregaEstimada: "Hoy, 15:30 - 16:00 hs",
  },
  {
    id: "#SOL-1187",
    destino: "Nueva Córdoba",
    provincia: "Córdoba, Córdoba",
    estado: "en_camino",
    entregaEstimada: "Hoy, 15:00 - 16:00 hs",
  },
  {
    id: "#SOL-1089",
    destino: "Centro, Rosario",
    provincia: "Rosario, Santa Fe",
    estado: "entregada",
    entregaEstimada: "Ayer, 16:45 hs",
  },
];

export default function AssignedRequestsTable() {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Solicitudes asignadas
          </h2>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none">
            3
          </span>
        </div>
        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Ver todas
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            {["ID", "Destino", "Estado", "Entrega estimada", "Acciones"].map(
              (col) => (
                <th
                  key={col}
                  className="pb-2 text-left text-xs font-medium text-slate-400 dark:text-slate-500"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {SOLICITUDES_MOCK.map((s) => {
            const { label, variant } = ESTADO_CONFIG[s.estado];
            return (
              <tr
                key={s.id}
                className="border-b border-slate-50 dark:border-slate-800 last:border-0"
              >
                <td className="py-3 font-medium text-slate-700 dark:text-slate-200">
                  {s.id}
                </td>
                <td className="py-3">
                  <p className="text-slate-700 dark:text-slate-200">
                    {s.destino}
                  </p>
                  <p className="text-xs text-slate-400">{s.provincia}</p>
                </td>
                <td className="py-3">
                  <StatusBadge variant={variant}>{label}</StatusBadge>
                </td>
                <td className="py-3 text-slate-500 dark:text-slate-400">
                  {s.entregaEstimada}
                </td>
                <td className="py-3">
                  <button className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
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
