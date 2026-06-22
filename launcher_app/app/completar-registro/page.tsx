"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { completarRegistroAction } from "./actions";

const ROLES = [
  { value: "SOLICITANTE", label: "Solicitante" },
  { value: "REMITENTE", label: "Remitente" },
] as const;

export default function CompletarRegistroPage() {
  const router = useRouter();

  const [rol, setRol] = useState<"SOLICITANTE" | "REMITENTE">("SOLICITANTE");
  const [nombre, setNombre] = useState("");
  const [nombreBase, setNombreBase] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [direccion, setDireccion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nombre.trim() === "") {
      setError("Ingresá un nombre.");
      return;
    }

    setGuardando(true);

    const res = await completarRegistroAction({
      nombre,
      rol,
      ...(rol === "REMITENTE" && {
        nombreBase,
        latitud: latitud ? parseFloat(latitud) : undefined,
        longitud: longitud ? parseFloat(longitud) : undefined,
        direccion,
      }),
    });

    setGuardando(false);

    if (res && !res.success) {
      setError(res.error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-[#1A1A2E] dark:text-white">Completar registro</h1>
          <p className="text-xs text-[#6B7280] mt-1">Elegí tu tipo de usuario y completá los datos</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6B7280] font-medium">Tipo de usuario</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as typeof rol)}
              disabled={guardando}
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6B7280] font-medium">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={guardando}
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
            />
          </div>

          {rol === "REMITENTE" && (
            <>
              <hr className="border-gray-200 dark:border-slate-700" />
              <p className="text-xs font-medium text-[#6B7280]">Datos de la base</p>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#6B7280] font-medium">Nombre de la base</label>
                <input
                  type="text"
                  value={nombreBase}
                  onChange={(e) => setNombreBase(e.target.value)}
                  disabled={guardando}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-[#6B7280] font-medium">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    disabled={guardando}
                    placeholder="-38.71"
                    className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-[#6B7280] font-medium">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                    disabled={guardando}
                    placeholder="-62.26"
                    className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#6B7280] font-medium">Dirección</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  disabled={guardando}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-[#F44336] bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Completar registro"}
          </button>
        </div>
      </form>
    </main>
  );
}
