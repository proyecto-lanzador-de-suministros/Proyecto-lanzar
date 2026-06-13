// app/components/dashboard/ActivitySummary.tsx
import ActivityStatItem from "@/app/components/activity/ActivityStatItem";
import DropdownTrigger from "../ui/DropdownTrigger";

const STATS_MOCK = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
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
    label: "Entregas realizadas",
    value: 12,
    colorClass: "text-[var(--color-info)]",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
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
    label: "Entregas exitosas",
    value: 12,
    colorClass: "text-[var(--color-success)]",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "En camino",
    value: 2,
    colorClass: "text-[var(--color-warning)]",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    label: "Canceladas",
    value: 1,
    colorClass: "text-[var(--color-danger)]",
  },
];

export default function ActivitySummary() {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Resumen de actividad
        </h2>
        <DropdownTrigger className="text-xs py-1 px-2">
          Este mes
        </DropdownTrigger>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {STATS_MOCK.map((stat) => (
          <ActivityStatItem key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
