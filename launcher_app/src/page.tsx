import { listarUsuariosUseCase } from "@/src/container";
import { aprobarCuentaAction, eliminarCuentaAction } from "@/src/actions/usuarios.actions";

export default async function UsuariosAdminPage() {
  // Recuperamos a todos los usuarios ejecutando el caso de uso
  const usuarios = await listarUsuariosUseCase.ejecutar();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Usuarios</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th className="py-3 px-4 font-semibold">Nombre / Base</th>
              <th className="py-3 px-4 font-semibold">Rol</th>
              <th className="py-3 px-4 font-semibold">Estado de Cuenta</th>
              <th className="py-3 px-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">{usuario.nombre}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    {usuario.rol}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    usuario.estadoCuenta === "APROBADA" ? "bg-green-100 text-green-800" :
                    usuario.estadoCuenta === "PENDIENTE" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {usuario.estadoCuenta}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  {usuario.estadoCuenta === "PENDIENTE" && (
                    <form action={aprobarCuentaAction.bind(null, usuario.id) as (formData: FormData) => void}>
                      <button type="submit" className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded shadow-sm transition-colors">
                        Aprobar
                      </button>
                    </form>
                  )}
                  <form action={eliminarCuentaAction.bind(null, usuario.id) as (formData: FormData) => void}>
                    <button type="submit" className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded shadow-sm transition-colors">
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}