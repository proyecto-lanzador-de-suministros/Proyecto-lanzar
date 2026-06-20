"use client";

import React, { useEffect, useState } from "react";
import {
  obtenerDetalleCuentaAction,
  editarInfoCuentaAction,
  resetearPasswordAction,
  actualizarEmailLoginAction,
} from "./actions";

interface UsuarioPlain {
  id: string;
  estadoCuenta: string;
  rol: string;
  nombre: string | null;
}

interface ModalEditarCuentaProps {
  usuario: UsuarioPlain;
  onClose: () => void;
  onSaved: () => void;
}

export default function ModalEditarCuenta({ usuario, onClose, onSaved }: ModalEditarCuentaProps) {
  const rolNormalizado = usuario.rol.toLowerCase();

  const [loadingDetalle, setLoadingDetalle] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [permisosRol, setPermisosRol] = useState("");
  const [email, setEmail] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");

  const [guardandoInfo, setGuardandoInfo] = useState(false);
  const [guardandoEmail, setGuardandoEmail] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const [mensajeInfo, setMensajeInfo] = useState<string | null>(null);
  const [mensajeEmail, setMensajeEmail] = useState<string | null>(null);
  const [mensajePassword, setMensajePassword] = useState<string | null>(null);

  useEffect(() => {
    obtenerDetalleCuentaAction(usuario.id, rolNormalizado).then((res) => {
      if (res.success && res.data) {
        const d = res.data as Record<string, string>;
        setNombre(d.nombre ?? "");
        setContacto(d.contacto ?? "");
        setPermisosRol(d.permisos_rol ?? "");
        setEmail(d.email ?? "");
        setNuevoEmail(d.email ?? "");
      } else {
        setError(res.error ?? "No se pudo cargar la información de la cuenta.");
      }
      setLoadingDetalle(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuardarInfo = async () => {
    setGuardandoInfo(true);
    setMensajeInfo(null);
    const res = await editarInfoCuentaAction(usuario.id, rolNormalizado, {
      nombre,
      ...(rolNormalizado === "solicitante" && { contacto }),
      ...((rolNormalizado === "administrador" || rolNormalizado === "admin") && { permisos_rol: permisosRol }),
    });
    if (res.success) {
      setMensajeInfo("Datos actualizados correctamente.");
      onSaved();
    } else {
      setMensajeInfo(res.error ?? "No se pudo guardar.");
    }
    setGuardandoInfo(false);
  };

  const handleGuardarEmail = async () => {
    if (nuevoEmail === email) return;
    setGuardandoEmail(true);
    setMensajeEmail(null);
    const res = await actualizarEmailLoginAction(usuario.id, nuevoEmail);
    if (res.success) {
      setEmail(nuevoEmail);
      setMensajeEmail("Email de acceso actualizado.");
    } else {
      setMensajeEmail(res.error ?? "No se pudo actualizar el email.");
    }
    setGuardandoEmail(false);
  };

  const handleGuardarPassword = async () => {
    if (nuevaPassword.length < 8) {
      setMensajePassword("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setGuardandoPassword(true);
    setMensajePassword(null);
    const res = await resetearPasswordAction(usuario.id, nuevaPassword);
    if (res.success) {
      setMensajePassword("Contraseña actualizada correctamente.");
      setNuevaPassword("");
    } else {
      setMensajePassword(res.error ?? "No se pudo actualizar la contraseña.");
    }
    setGuardandoPassword(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-white">Editar cuenta</h2>
            <p className="text-xs text-[#6B7280] font-mono mt-0.5">#{usuario.id.substring(0, 12)}…</p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none">×</button>
        </div>

        {loadingDetalle ? (
          <div className="py-10 flex justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F5A623]" />
            <span className="text-sm text-[#6B7280]">Cargando datos...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2">{error}</p>
        ) : (
          <div className="space-y-6">
            {/* Datos de cuenta (CU-04) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1A1A2E] dark:text-white">Información de la cuenta</h3>

              {rolNormalizado === "remitente" ? (
                <p className="text-xs text-[#6B7280] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Esta cuenta es una base remitente. Para editar nombre de base, ubicación o
                  capacidad de pista, usá la sección{" "}
                  <a href="/admin/remitentes" className="font-semibold text-[#1565C0] hover:underline">
                    Remitentes
                  </a>.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#6B7280] font-medium">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800"
                    />
                  </div>

                  {rolNormalizado === "solicitante" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#6B7280] font-medium">Contacto</label>
                      <input
                        type="text"
                        value={contacto}
                        onChange={(e) => setContacto(e.target.value)}
                        className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800"
                      />
                    </div>
                  )}

                  {(rolNormalizado === "administrador" || rolNormalizado === "admin") && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#6B7280] font-medium">Permisos / rol interno</label>
                      <input
                        type="text"
                        value={permisosRol}
                        onChange={(e) => setPermisosRol(e.target.value)}
                        className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800"
                      />
                    </div>
                  )}

                  {mensajeInfo && (
                    <p className={`text-xs ${mensajeInfo.includes("correctamente") ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                      {mensajeInfo}
                    </p>
                  )}

                  <button
                    onClick={handleGuardarInfo}
                    disabled={guardandoInfo}
                    className="w-full bg-[#1565C0] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0D47A1] transition disabled:opacity-50"
                  >
                    {guardandoInfo ? "Guardando..." : "Guardar datos de cuenta"}
                  </button>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#1A1A2E] dark:text-white">Información de login (CU-03)</h3>
              <p className="text-[11px] text-[#6B7280]">
                Gestionado por Clerk. El cambio de email puede no estar soportado según la
                versión del SDK instalada — verificalo antes de usarlo en producción.
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#6B7280] font-medium">Email de acceso</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={nuevoEmail}
                    onChange={(e) => setNuevoEmail(e.target.value)}
                    className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={handleGuardarEmail}
                    disabled={guardandoEmail || nuevoEmail === email}
                    className="px-3 py-2 rounded-lg bg-blue-50 text-[#1565C0] text-xs font-semibold hover:bg-[#1565C0] hover:text-white transition disabled:opacity-50"
                  >
                    {guardandoEmail ? "..." : "Cambiar"}
                  </button>
                </div>
                {mensajeEmail && (
                  <p className={`text-xs ${mensajeEmail.includes("actualizado") ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                    {mensajeEmail}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#6B7280] font-medium">Nueva contraseña</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={handleGuardarPassword}
                    disabled={guardandoPassword || nuevaPassword.length === 0}
                    className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-500 hover:text-white transition disabled:opacity-50"
                  >
                    {guardandoPassword ? "..." : "Restablecer"}
                  </button>
                </div>
                {mensajePassword && (
                  <p className={`text-xs ${mensajePassword.includes("correctamente") ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                    {mensajePassword}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}