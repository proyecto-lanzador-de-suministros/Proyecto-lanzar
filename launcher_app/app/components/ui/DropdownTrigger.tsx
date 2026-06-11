import React from "react";

export interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export default function DropdownTrigger({
  className = "",
  children,
  disabled,
  ...rest
}: DropdownTriggerProps) {
  const classes = `inline-flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim();

  return (
    <button type="button" className={classes} disabled={disabled} {...rest}>
      <span>{children}</span>
      <span aria-hidden="true" className="text-slate-500">
        ▼
      </span>
    </button>
  );
}
