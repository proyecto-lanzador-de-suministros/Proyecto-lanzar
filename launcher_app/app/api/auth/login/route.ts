import { iniciarSesionUseCase } from "@/src/container";

export async function GET(req: Request) {
  try {
    const url = await iniciarSesionUseCase.ejecutar(req);
    return Response.redirect(new URL(url, req.url));
  } catch {
    return Response.redirect(new URL("/sign-in", req.url));
  }
}
