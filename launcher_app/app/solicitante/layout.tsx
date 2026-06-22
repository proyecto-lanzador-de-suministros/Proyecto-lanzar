"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import DashboardShell from "@/app/components/layout/DashboardShell";
import { useEffect, useState } from "react";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";

export default function SolicitanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    const rol = user?.publicMetadata?.rol as string | undefined;
    if (rol !== "solicitante") {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;

  const fetchNotifCount = () => {
    obtenerNotificacionesAction().then((res) => {
      if (res.success && res.data) {
        setNotificationCount(res.data.length);
      }
    });
  };

  useEffect(() => {
    fetchNotifCount();

    // Polling opcional para actualizaciones de notificaciones cada 15s
    const interval = setInterval(fetchNotifCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <DashboardShell
      sidebar={{ activeHref: pathname, role: "solicitante" }}
      topBar={{
        role: "Solicitante",
        subtitle: "Este es el estado de tus solicitudes y envíos.",
        notificationCount,
      }}
    >
      {children}
    </DashboardShell>
  );
}
