import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)", // TODO: agregar rutas no protegidas
  "/api/auth/login",
]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth(); // auth() devuelve el objeto completo
  console.log("sessionClaims:", sessionClaims);
  if (!isPublicRoute(req)) {
    await auth.protect(); //redirigir a ...
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
