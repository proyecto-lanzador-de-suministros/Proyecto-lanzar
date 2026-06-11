// Página del dashboard del rol remitente. Muestra solicitudes asignadas y estado del stock.
import Sidebar from "@/app/components/layout/Sidebar";
import TopBar from "@/app/components/layout/TopBar";

export default function RemitenteDashboardPage() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar notificationCount={2} />
      </div>
    </div>
  );
}
