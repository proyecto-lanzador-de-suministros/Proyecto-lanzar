// app/remitente/dashboard/layout.tsx
// Layout anidado debajo de app/remitente/layout.tsx (sin DashboardShell para evitar doble envoltura)
export default function RemitenteDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
