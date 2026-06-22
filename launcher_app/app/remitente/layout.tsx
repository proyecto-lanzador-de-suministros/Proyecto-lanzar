"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import DashboardShell from "@/app/components/layout/DashboardShell";
import { useEffect, useState } from "react";
import { obtenerNotificacionesAction } from "@/src/actions/notificaciones.actions";

export default function RemitenteLayout({
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
    if (rol !== "remitente") {
      router.push("/");
    }
  }, [isLoaded, user, router]);

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

  if (!isLoaded) return null;

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
