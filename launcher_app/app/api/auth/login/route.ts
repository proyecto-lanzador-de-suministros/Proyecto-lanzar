// Route handler de Next.js. Actúa como driver adapter HTTP para POST /api/auth/login.
//como auth se delega a clerk, este
// archivo serviría como proxy nomás(ej):
/**
import { authAdapter } from "@/container";

export async function GET(req: Request) {
  const usuario = await authAdapter.obtenerUsuarioActual(req);
  if (!usuario) return Response.redirect("/sign-in");

  switch (usuario.rol) {
    case "admin": return Response.redirect("/admin/dashboard");
    case "remitente": return Response.redirect("/remitente/dashboard");
    case "solicitante": return Response.redirect("/solicitante/dashboard");
  }
}
 */
export {};