import React from "react";

type ProgressVariant = "info" | "success" | "warning" | "danger";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  variant?: ProgressVariant;
  className?: string;
}

const fillClasses: Record<ProgressVariant, string> = {
  info: "bg-[var(--color-info)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
};

export default function ProgressBar({
  value,
  label,
  variant = "info",
  className = "",
  ...rest
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={className} {...rest}>
      {label ? <div className="mb-2 text-sm font-medium text-slate-700">{label}</div> : null}
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`h-full rounded-full transition-all ${fillClasses[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-slate-500">{clamped}%</div>
    </div>
  );
}
