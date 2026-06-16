import Avatar from "@/app/components/ui/Avatar";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import { clerkClient } from "@clerk/nextjs/server";
import React from "react";
import { aprobarUsuario } from "./actions";

export default async function AdminUsuariosPage() {
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList();

  const mappedUsers = users.map((user) => ({
    id: user.id,
    nombre: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Sin nombre",
    email: user.emailAddresses[0]?.emailAddress || "Sin correo",
    rol: (user.publicMetadata.role as string) || "solicitante",
    estado: (user.publicMetadata.status as string) || "pendiente",
    fecha: new Date(user.createdAt).toLocaleDateString("es-AR", {
      day: "2-digit", month: "short", year: "numeric",
    }),
    avatarUrl: user.imageUrl,
  }));

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

        {/* Contenido principal */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha de registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {mappedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatarUrl} alt={user.nombre} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{user.nombre}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <Badge variant={user.rol === "remitente" ? "remitente" : user.rol === "solicitante" ? "solicitante" : "default"}>
                        {user.rol}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        user.estado === 'aprobada' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                        user.estado === 'pendiente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {user.estado === 'pendiente' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        {user.estado.charAt(0).toUpperCase() + user.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.fecha}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.estado === 'pendiente' ? (
                        <form action={aprobarUsuario.bind(null, user.id, user.rol)}>
                          <button type="submit" className="bg-[#1565C0] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                            Aprobar
                          </button>
                        </form>
                      ) : (
                        <Button variant="secondary" size="sm">
                          Editar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}