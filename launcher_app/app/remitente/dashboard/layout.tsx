// app/remitente/dashboard/layout.tsx
import DashboardShell from "@/app/components/layout/DashboardShell";

export default function RemitenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      sidebar={{ activeHref: "/remitente/dashboard" }}
      topBar={{
        role: "Remitente",
        subtitle: "Este es tu panel. Como remitente",
        notificationCount: 2,
      }}
    >
      {children}
    </DashboardShell>
  );
}
