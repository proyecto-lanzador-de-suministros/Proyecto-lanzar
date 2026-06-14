import React from "react";

type StatusVariant = "info" | "success" | "warning" | "danger" | "default";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  className?: string;
  children: React.ReactNode;
}

export default function StatusBadge({
  variant = "default",
  className = "",
  children,
  ...rest
}: StatusBadgeProps) {
  const variantClasses =
    variant === "info"
      ? "bg-[var(--color-info)] text-white"
      : variant === "success"
      ? "bg-[var(--color-success)] text-white"
      : variant === "warning"
      ? "bg-[var(--color-warning)] text-white"
      : variant === "danger"
      ? "bg-[var(--color-danger)] text-white"
      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100";

  const classes = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${variantClasses} ${className}`.trim();

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
