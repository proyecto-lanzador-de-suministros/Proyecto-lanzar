"use client";

import { usePathname } from "next/navigation";
import DashboardShell from "@/app/components/layout/DashboardShell";
import { useEffect, useState } from "react";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";

export default function RemitenteLayout({
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

    const interval = setInterval(fetchNotifCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <DashboardShell
      sidebar={{ activeHref: pathname, role: "remitente" }}
      topBar={{
        role: "Remitente",
        subtitle: "Gestioná las solicitudes asignadas y el stock de tu base.",
        notificationCount,
      }}
    >
      {children}
    </DashboardShell>
  );
}
