"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { TopBarConfig } from "./types";

export default function TopBar({
  role,
  subtitle,
  notificationCount,
}: TopBarConfig) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = user?.fullName ?? "Usuario";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleBellClick = () => {
    router.push(`/${role.toLowerCase()}/notificaciones`);
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-1.5 bg-[#1565C0] md:bg-bg-card border-b border-white/10 md:border-slate-200 dark:md:border-slate-700">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white md:text-text-primary">
          ¡Hola, {fullName}!
        </h1>
        <p className="text-xs md:text-sm text-white/80 md:text-text-secondary mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded-lg hover:bg-white/10 md:hover:bg-slate-100 dark:md:hover:bg-slate-800 transition-colors cursor-pointer"
        >
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
            className="text-white md:text-text-secondary"
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

        {/* Menu desplegable de Perfil */}
        <div className="relative">
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-interactive border border-white/20 md:border-slate-200 dark:md:border-slate-700">
              {mounted && user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white text-sm font-semibold">{initials}</span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white md:text-text-primary leading-tight">
                {fullName}
              </p>
              <p className="text-xs text-white/70 md:text-text-secondary">{role}</p>
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
              className="text-white md:text-text-secondary hidden sm:block"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs">
              {role.toLowerCase() === "solicitante" && (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/solicitante/perfil");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    👤 Mi Perfil
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/solicitante/ayuda");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    ❓ Ayuda
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                </>
              )}
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                  router.push("/sign-in");
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
