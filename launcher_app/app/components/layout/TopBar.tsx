"use client";

import { useUser } from "@clerk/nextjs";
import { TopBarConfig } from "./types";

export default function TopBar({
  role,
  subtitle,
  notificationCount,
}: TopBarConfig) {
  const { user } = useUser();

  const fullName = user?.fullName ?? "Usuario";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-center justify-between px-8 py-1.5 bg-bg-card border-b border-slate-200 dark:border-slate-700">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          ¡Hola, {fullName}!
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-secondary"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 bg-brand text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1">
              {notificationCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-interactive flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-semibold">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text-primary leading-tight">
              {fullName}
            </p>
            <p className="text-xs text-text-secondary">{role}</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-secondary hidden sm:block"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </header>
  );
}
