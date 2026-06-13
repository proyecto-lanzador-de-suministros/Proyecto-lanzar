// app/components/dashboard/ActivityStatItem.tsx
import React from "react";

export interface ActivityStatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
}

export default function ActivityStatItem({
  icon,
  label,
  value,
  colorClass,
}: ActivityStatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${colorClass} mt-0.5`}>{icon}</span>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      </div>
    </div>
  );
}
