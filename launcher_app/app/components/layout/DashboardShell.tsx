import Sidebar from "@/app/components/layout/Sidebar";
import TopBar from "@/app/components/layout/TopBar";
import { DashboardShellProps } from "@/app/components/layout/types";
import Link from "next/link";

export default function DashboardShell({
  sidebar,
  topBar,
  children,
}: DashboardShellProps) {
  const isSolicitante = sidebar.role === "solicitante";

  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar {...sidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar {...topBar} />
        <main className={`flex-1 p-6 ${isSolicitante ? "pb-24 md:pb-6" : ""}`}>
          {children}
        </main>
      </div>

      {isSolicitante && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-dark border-t border-white/10 h-16 flex items-center justify-around px-2 pb-safe">
          {/* 1. Mis solicitudes */}
          <Link
            href="/solicitante/missolicitudes"
            className={`flex flex-col items-center justify-center flex-1 py-1 no-underline transition-colors ${
              sidebar.activeHref === "/solicitante/missolicitudes"
                ? "text-brand"
                : "text-white/60 hover:text-white"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Solicitudes</span>
          </Link>

          {/* 2. Notificaciones */}
          <Link
            href="/solicitante/notificaciones"
            className={`flex flex-col items-center justify-center flex-1 py-1 no-underline transition-colors relative ${
              sidebar.activeHref === "/solicitante/notificaciones"
                ? "text-brand"
                : "text-white/60 hover:text-white"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {topBar.notificationCount > 0 && (
              <span className="absolute top-1 right-5 bg-brand w-2.5 h-2.5 rounded-full border border-surface-dark animate-pulse" />
            )}
            <span className="text-[10px] mt-0.5 font-medium">Alertas</span>
          </Link>

          {/* 3. Inicio (Dashboard) - Central Button */}
          <Link
            href="/solicitante/dashboard"
            className="flex flex-col items-center justify-center flex-1 py-1 no-underline -mt-6 relative"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 ${
                sidebar.activeHref === "/solicitante/dashboard"
                  ? "bg-brand shadow-orange-500/30 scale-105 border-4 border-surface-dark"
                  : "bg-slate-700 shadow-slate-900/30 border-4 border-surface-dark hover:bg-slate-600"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <span
              className={`text-[10px] mt-1 font-semibold ${
                sidebar.activeHref === "/solicitante/dashboard"
                  ? "text-brand"
                  : "text-white/60"
              }`}
            >
              Inicio
            </span>
          </Link>

          {/* 4. Perfil */}
          <Link
            href="/solicitante/perfil"
            className={`flex flex-col items-center justify-center flex-1 py-1 no-underline transition-colors ${
              sidebar.activeHref === "/solicitante/perfil"
                ? "text-brand"
                : "text-white/60 hover:text-white"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Perfil</span>
          </Link>

          {/* 5. Ayuda */}
          <Link
            href="/solicitante/ayuda"
            className={`flex flex-col items-center justify-center flex-1 py-1 no-underline transition-colors ${
              sidebar.activeHref === "/solicitante/ayuda"
                ? "text-brand"
                : "text-white/60 hover:text-white"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Ayuda</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
