// app/components/dashboard/NotificationItem.tsx
import React from "react";

export type NotificacionTipo = "nueva" | "en_camino" | "entregada";

export interface NotificationItemProps {
  tipo: NotificacionTipo;
  titulo: string;
  descripcion: string;
  hora: string;
}

const TIPO_CONFIG: Record<
  NotificacionTipo,
  { icon: React.ReactNode; colorClass: string }
> = {
  nueva: {
    colorClass: "text-[var(--color-warning)]",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  en_camino: {
    colorClass: "text-[var(--color-info)]",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
  },
  entregada: {
    colorClass: "text-[var(--color-success)]",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
};

export default function NotificationItem({
  tipo,
  titulo,
  descripcion,
  hora,
}: NotificationItemProps) {
  const { icon, colorClass } = TIPO_CONFIG[tipo];

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className={`mt-0.5 shrink-0 ${colorClass}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
          {titulo}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {descripcion}
        </p>
      </div>
      <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
        {hora}
      </span>
    </div>
  );
}
