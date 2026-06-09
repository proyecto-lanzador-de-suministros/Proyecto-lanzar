import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", // TODO: agregar rutas protegidas
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect(); //redirigir a ...
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
