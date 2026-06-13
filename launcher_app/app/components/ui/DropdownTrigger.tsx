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
  const classes = `inline-flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim();

  return (
    <button type="button" className={classes} disabled={disabled} {...rest}>
      <span>{children}</span>
      <span aria-hidden="true" className="text-slate-500">
        ▼
      </span>
    </button>
  );
}
