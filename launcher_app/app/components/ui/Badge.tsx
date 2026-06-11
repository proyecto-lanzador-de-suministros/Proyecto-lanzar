import React from "react";

type BadgeVariant = "solicitante" | "remitente" | "default";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({
  variant = "default",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const variantClasses =
    variant === "solicitante"
      ? "bg-[var(--color-badge-solicitante-bg)] text-[var(--color-badge-solicitante-text)]"
      : variant === "remitente"
      ? "bg-[var(--color-badge-remitente-bg)] text-[var(--color-badge-remitente-text)]"
      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100";

  const classes = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${variantClasses} ${className}`.trim();

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
