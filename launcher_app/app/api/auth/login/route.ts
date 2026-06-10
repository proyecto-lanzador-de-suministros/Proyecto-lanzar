// Route handler de Next.js. Actúa como driver adapter HTTP para POST /api/auth/login.
//como auth se delega a clerk, este
// archivo serviría como proxy nomás(ej):

import { authAdapter } from "@/src/container";

export async function GET(req: Request) {
  console.log("get de login....");
  const usuario = await authAdapter.obtenerUsuarioActual(req);
  console.log("se obtuvo user actual");
  if (!usuario) {
    return Response.redirect(new URL("/sign-in", req.url));
  }

  switch (usuario.rol) {
    case "admin":
      return Response.redirect(new URL("/admin/dashboard", req.url));
    case "remitente":
      return Response.redirect(new URL("/remitente/dashboard", req.url));
    case "solicitante":
      return Response.redirect(new URL("/solicitante/dashboard", req.url));
  }
}
