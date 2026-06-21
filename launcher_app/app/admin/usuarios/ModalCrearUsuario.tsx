"use client";

import React, { useState } from "react";
import { crearUsuarioAction } from "./actions";

interface ModalNuevoUsuarioProps {
  onClose: () => void;
  onCreated: () => void;
}

const ROLES = [
  { value: "solicitante", label: "Solicitante" },
  { value: "remitente", label: "Remitente" },
  { value: "admin", label: "Administrador" },
] as const;

export default function ModalNuevoUsuario({ onClose, onCreated }: ModalNuevoUsuarioProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"solicitante" | "remitente" | "admin">("solicitante");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCrear = async () => {
    setError(null);

    if (nombre.trim() === "") {
      setError("Ingresá un nombre.");
      return;
    }
    if (!email.includes("@")) {
      setError("Ingresá un email válido.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setGuardando(true);
    const res = await crearUsuarioAction({ email, password, nombre, rol });

    if (res.success) {
      onCreated();
      onClose();
    } else {
      setError(res.error ?? "No se pudo crear el usuario.");
    }
    setGuardando(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !guardando) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-white">Nuevo usuario</h2>
          <button
            onClick={onClose}
            disabled={guardando}
            className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none disabled:opacity-50"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <p className="text-xs text-[#6B7280] mb-5">
          La cuenta se crea directamente aprobada, sin pasar por el flujo de registro.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6B7280] font-medium">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={guardando}
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6B7280] font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={guardando}
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6B7280] font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={guardando}
              placeholder="Mínimo 8 caracteres"
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#6B7280] font-medium">Rol</label>
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

          {rol === "remitente" && (
            <p className="text-[11px] text-[#6B7280] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              La base remitente se crea con ubicación y capacidad de pista
              pendientes — configuralas después desde "Gestión de Remitentes".
            </p>
          )}

          {error && (
            <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={guardando}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-semibold text-[#6B7280] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrear}
            disabled={guardando}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition disabled:opacity-50"
          >
            {guardando ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}