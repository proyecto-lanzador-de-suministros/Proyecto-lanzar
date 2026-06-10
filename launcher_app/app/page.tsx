// Página de inicio. Redirige al dashboard correspondiente según el rol del usuario autenticado.
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/api/auth/login");
}
