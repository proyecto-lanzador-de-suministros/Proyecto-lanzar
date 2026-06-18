"use client";

import { usePathname } from "next/navigation";
import DashboardShell from "@/app/components/layout/DashboardShell";
import { useEffect, useState } from "react";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";

export default function SolicitanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(0);

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
