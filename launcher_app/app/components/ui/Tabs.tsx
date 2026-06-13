import React from "react";

type TabItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function Tabs({
  items,
  value,
  onValueChange,
  className = "",
}: TabsProps) {
  const baseClasses = `inline-flex overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${className}`.trim();

  return (
    <div className={baseClasses} role="tablist" aria-label="Tabs">
      {items.map((item) => {
        const selected = item.value === value;
        const buttonClasses = `rounded-full px-4 py-2 text-sm font-medium transition ${
          selected
            ? "bg-[var(--color-interactive)] text-white"
            : "text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        } ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`.trim();

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-disabled={item.disabled}
            disabled={item.disabled}
            className={buttonClasses}
            onClick={() => !item.disabled && onValueChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
