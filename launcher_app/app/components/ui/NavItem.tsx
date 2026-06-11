import React from "react";

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label: string;
  active?: boolean;
  badge?: number;
  className?: string;
}

export default function NavItem({
  href,
  label,
  active = false,
  badge,
  className = "",
  ...rest
}: NavItemProps) {
  const classes = `flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    active
      ? "bg-[var(--color-interactive)] text-white"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  } ${className}`.trim();

  return (
    <a href={href} className={classes} aria-current={active ? "page" : undefined} {...rest}>
      <span>{label}</span>
      {badge !== undefined && badge !== null ? (
        <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {badge}
        </span>
      ) : null}
    </a>
  );
}
