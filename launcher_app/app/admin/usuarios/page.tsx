import Avatar from "@/app/components/ui/Avatar";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import { listarUsuariosUseCase } from "@/src/container";
import React from "react";
import { aprobarUsuario } from "./actions";
import { eliminarCuentaAction } from "@/src/actions/usuarios.actions";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  // Fuente de verdad única: PostgreSQL vía el caso de uso del dominio.
  // La página de Clerk (actions.ts) ya sincroniza ambas fuentes al aprobar.
  const usuarios = await listarUsuariosUseCase.ejecutar();

  return (
    <div className="min-h-screen bg-[#f4f7f6] dark:bg-slate-950 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-[#64748b] dark:text-slate-400 mt-1 text-sm md:text-base">
              Administración de cuentas, roles y permisos de acceso en el sistema.
            </p>
          </div>
          <Button variant="primary" size="md">
            + Nuevo Usuario
          </Button>
        </div>

        {/* Tabla */}
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

                  return (
                    <tr
                      key={usuario.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
                        <div className="flex items-center justify-end gap-2">
                          {estadoNormalizado === "pendiente" && (
                            <form action={aprobarUsuario.bind(null, usuario.id, rolNormalizado)}>
                              <button
                                type="submit"
                                className="bg-[#1565C0] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                              >
                                Aprobar
                              </button>
                            </form>
                          )}
                          <form
                            action={async () => {
                              "use server";
                              await eliminarCuentaAction(usuario.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Eliminar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}