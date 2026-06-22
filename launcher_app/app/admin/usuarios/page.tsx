import { listarUsuariosUseCase } from "@/src/container";
import AdminUsuariosClient from "./AdminUsuariosClient";

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

  return <AdminUsuariosClient usuarios={usuariosPlain} />;
}