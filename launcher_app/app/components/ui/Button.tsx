"use client";

import React from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
  as?: "button" | "a";
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Botón reutilizable con variantes y tamaños. */
export default function Button({
  variant = "primary",
  size = "md",
  as = "button",
  href,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses =
    variant === "primary"
      ? "bg-[var(--color-brand)] text-white hover:brightness-95 focus-visible:ring-[var(--color-brand)]"
      : variant === "danger"
      ? "bg-[var(--color-danger)] text-white hover:brightness-90 focus-visible:ring-[var(--color-danger)]"
      : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[var(--color-text-primary)] hover:bg-gray-50 dark:hover:bg-slate-700 focus-visible:ring-gray-300 dark:focus-visible:ring-slate-600";

  const sizeClasses =
    size === "sm"
      ? "px-2 py-1 text-sm"
      : size === "lg"
      ? "px-4 py-2 text-base"
      : "px-3 py-2 text-sm";

  const classes = `${base} ${variantClasses} ${sizeClasses} ${className}`.trim();

  if (as === "a") {
    return (
      <a
        href={disabled ? undefined : href}
        className={classes}
        aria-disabled={disabled ? "true" : undefined}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          // permitir onClick pasado en rest
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          rest.onClick?.(e);
        }}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}