import Button from "@/app/components/ui/Button";
import { listarUsuariosUseCase } from "@/src/container";
import UsuariosTable from "./UsuariosTable";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  // Fuente de verdad única: PostgreSQL vía el caso de uso del dominio.
  // La página de Clerk (actions.ts) ya sincroniza ambas fuentes al aprobar.
  const usuarios = await listarUsuariosUseCase.ejecutar();

  // Serializamos a un objeto plano simple para pasar de Server a Client Component.
  const usuariosPlain = usuarios.map((u) => ({
    id: u.id,
    estadoCuenta: u.estadoCuenta,
    rol: u.rol,
    nombre: u.nombre ?? null,
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

        {/* Tabla */}
        <UsuariosTable usuarios={usuariosPlain} />
      </div>
    </div>
  );
}