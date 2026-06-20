import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth/login",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isRemitenteRoute = createRouteMatcher([
  "/remitente(.*)",
]);

const isSolicitanteRoute = createRouteMatcher([
  "/solicitante(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Rutas públicas: no requieren sesión
  if (isPublicRoute(req)) return NextResponse.next();

  // Para todo lo demás, exigir sesión activa
  const { sessionClaims } = await auth.protect();
  const rol = sessionClaims?.metadata?.rol as string | undefined;

  // Protección por rol: admin
  if (isAdminRoute(req) && rol !== "admin") {
    const url = new URL("/api/auth/login", req.url);
    return NextResponse.redirect(url);
  }

  // Protección por rol: remitente
  if (isRemitenteRoute(req) && rol !== "remitente") {
    const url = new URL("/api/auth/login", req.url);
    return NextResponse.redirect(url);
  }

  // Protección por rol: solicitante
  if (isSolicitanteRoute(req) && rol !== "solicitante") {
    const url = new URL("/api/auth/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
export const runtime = "nodejs";