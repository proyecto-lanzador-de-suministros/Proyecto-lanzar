"use client";

import { useState, useTransition } from "react";
import Avatar from "@/app/components/ui/Avatar";
import Badge from "@/app/components/ui/Badge";
import { aprobarUsuario } from "./actions";
import { eliminarCuentaAction, rechazarCuentaAction } from "@/src/actions/usuarios.actions";
import ModalEditarCuenta from "./ModalEditarCuenta";

interface UsuarioPlain {
  id: string;
  estadoCuenta: string;
  rol: string;
  nombre: string | null;
}

interface UsuariosTableProps {
  usuarios: UsuarioPlain[];
}

type ModalState =
  | { tipo: "ninguno" }
  | { tipo: "confirmar-eliminar"; usuario: UsuarioPlain }
  | { tipo: "confirmar-eliminar-con-activas"; usuario: UsuarioPlain; cantidadActivas: number }
  | { tipo: "confirmar-rechazar"; usuario: UsuarioPlain }
  | { tipo: "editar-cuenta"; usuario: UsuarioPlain };

export default function UsuariosTable({ usuarios }: UsuariosTableProps) {
  const [modal, setModal] = useState<ModalState>({ tipo: "ninguno" });
  const [erroresPorUsuario, setErroresPorUsuario] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [accionandoId, setAccionandoId] = useState<string | null>(null);

  function limpiarError(usuarioId: string) {
    setErroresPorUsuario((prev) => {
      const copia = { ...prev };
      delete copia[usuarioId];
      return copia;
    });
  }

  function handleAprobar(usuarioId: string, rolNormalizado: string) {
    limpiarError(usuarioId);
    setAccionandoId(usuarioId);
    startTransition(async () => {
      try {
        await aprobarUsuario(usuarioId, rolNormalizado);
      } catch (err) {
        setErroresPorUsuario((prev) => ({
          ...prev,
          [usuarioId]: err instanceof Error ? err.message : "Error al aprobar la cuenta.",
        }));
      } finally {
        setAccionandoId(null);
      }
    });
  }

  function abrirConfirmacionEliminar(usuario: UsuarioPlain) {
    limpiarError(usuario.id);
    setModal({ tipo: "confirmar-eliminar", usuario });
  }

  function abrirConfirmacionRechazar(usuario: UsuarioPlain) {
    limpiarError(usuario.id);
    setModal({ tipo: "confirmar-rechazar", usuario });
  }

  function abrirEdicionCuenta(usuario: UsuarioPlain) {
    limpiarError(usuario.id);
    setModal({ tipo: "editar-cuenta", usuario });
  }

  function cerrarModal() {
    setModal({ tipo: "ninguno" });
  }

  function ejecutarRechazo(usuario: UsuarioPlain) {
    setAccionandoId(usuario.id);
    startTransition(async () => {
      const res = await rechazarCuentaAction(usuario.id);
      if (!res.success) {
        setErroresPorUsuario((prev) => ({
          ...prev,
          [usuario.id]: res.error ?? "Error al rechazar la cuenta.",
        }));
      }
      cerrarModal();
      setAccionandoId(null);
    });
  }

  function ejecutarEliminacion(usuario: UsuarioPlain, forzarConActivas: boolean) {
    setAccionandoId(usuario.id);
    startTransition(async () => {
      const res = await eliminarCuentaAction(usuario.id, forzarConActivas);

      if (res.success) {
        cerrarModal();
        setAccionandoId(null);
        return;
      }

      if (res.requiresConfirmation) {
        setModal({
          tipo: "confirmar-eliminar-con-activas",
          usuario,
          cantidadActivas: res.cantidadActivas ?? 0,
        });
        setAccionandoId(null);
        return;
      }

      // Error genérico
      setErroresPorUsuario((prev) => ({
        ...prev,
        [usuario.id]: res.error ?? "Error al eliminar la cuenta.",
      }));
      cerrarModal();
      setAccionandoId(null);
    });
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
              {usuarios.map((usuario) => {
                const rolNormalizado = usuario.rol.toLowerCase() as
                  | "solicitante"
                  | "remitente"
                  | "administrador";

                const estadoNormalizado = usuario.estadoCuenta.toLowerCase();
                const enCurso = isPending && accionandoId === usuario.id;
                const errorUsuario = erroresPorUsuario[usuario.id];

                return (
                  <tr
                    key={usuario.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors align-top"
                  >
                    {/* Usuario */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar alt={usuario.nombre ?? usuario.id} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {usuario.nombre ?? "Sin nombre"}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {usuario.id.substring(0, 12)}…
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4 capitalize">
                      <Badge
                        variant={
                          rolNormalizado === "remitente"
                            ? "remitente"
                            : rolNormalizado === "solicitante"
                            ? "solicitante"
                            : "default"
                        }
                      >
                        {rolNormalizado}
                      </Badge>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          estadoNormalizado === "aprobada"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : estadoNormalizado === "pendiente"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {estadoNormalizado === "pendiente" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {usuario.estadoCuenta.charAt(0) +
                          usuario.estadoCuenta.slice(1).toLowerCase()}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center justify-end gap-2">
                          {estadoNormalizado === "pendiente" && (
                            <>
                              <button
                                type="button"
                                disabled={enCurso}
                                onClick={() => handleAprobar(usuario.id, rolNormalizado)}
                                className="bg-[#1565C0] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {enCurso ? "Aprobando..." : "Aprobar"}
                              </button>
                              <button
                                type="button"
                                disabled={enCurso}
                                onClick={() => abrirConfirmacionRechazar(usuario)}
                                className="text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            disabled={enCurso}
                            onClick={() => abrirEdicionCuenta(usuario)}
                            className="text-[#1565C0] border border-blue-200 bg-blue-50 hover:bg-[#1565C0] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={enCurso}
                            onClick={() => abrirConfirmacionEliminar(usuario)}
                            className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {enCurso ? "Procesando..." : "Eliminar"}
                          </button>
                        </div>
                        {errorUsuario && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 max-w-[220px] text-right">
                            {errorUsuario}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: confirmación simple antes de eliminar (CU-05, paso 2) */}
      {modal.tipo === "confirmar-eliminar" && (
        <ConfirmModal
          titulo="Eliminar cuenta"
          mensaje={
            <>
              ¿Estás seguro de que querés eliminar la cuenta de{" "}
              <strong>{modal.usuario.nombre ?? modal.usuario.id}</strong>? Esta
              acción no se puede deshacer.
            </>
          }
          confirmLabel="Sí, eliminar"
          confirmVariant="danger"
          loading={isPending}
          onCancel={cerrarModal}
          onConfirm={() => ejecutarEliminacion(modal.usuario, false)}
        />
      )}

      {/* Modal: confirmación adicional por solicitudes activas (CU-05, nota del paso 3) */}
      {modal.tipo === "confirmar-eliminar-con-activas" && (
        <ConfirmModal
          titulo="El usuario tiene solicitudes activas"
          mensaje={
            <>
              <strong>{modal.usuario.nombre ?? modal.usuario.id}</strong> tiene{" "}
              <strong>{modal.cantidadActivas}</strong> solicitud
              {modal.cantidadActivas !== 1 ? "es" : ""} activa
              {modal.cantidadActivas !== 1 ? "s" : ""} en el sistema. Si
              continuás, la cuenta se eliminará de todas formas. ¿Querés
              continuar?
            </>
          }
          confirmLabel="Sí, eliminar de todas formas"
          confirmVariant="danger"
          loading={isPending}
          onCancel={cerrarModal}
          onConfirm={() => ejecutarEliminacion(modal.usuario, true)}
        />
      )}

      {/* Modal: confirmación de rechazo de cuenta (CU-02, Caso A) */}
      {modal.tipo === "confirmar-rechazar" && (
        <ConfirmModal
          titulo="Rechazar cuenta"
          mensaje={
            <>
              ¿Confirmás que querés rechazar la cuenta de{" "}
              <strong>{modal.usuario.nombre ?? modal.usuario.id}</strong>? La
              cuenta quedará marcada como <strong>Rechazada</strong> — el
              registro no se elimina, a diferencia de "Eliminar".
            </>
          }
          confirmLabel="Sí, rechazar"
          confirmVariant="danger"
          loading={isPending}
          onCancel={cerrarModal}
          onConfirm={() => ejecutarRechazo(modal.usuario)}
        />
      )}

      {/* Modal: editar información de cuenta y login (CU-03/CU-04) */}
      {modal.tipo === "editar-cuenta" && (
        <ModalEditarCuenta
          usuario={modal.usuario}
          onClose={cerrarModal}
          onSaved={() => {}}
        />
      )}
    </>
  );
}

// ── Modal de confirmación reutilizable (local a este archivo) ──────────────

interface ConfirmModalProps {
  titulo: string;
  mensaje: React.ReactNode;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmModal({
  titulo,
  mensaje,
  confirmLabel,
  confirmVariant = "primary",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-white mb-2">
          {titulo}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {mensaje}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-semibold text-[#6B7280] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#1565C0] hover:bg-[#0D47A1]"
            }`}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}