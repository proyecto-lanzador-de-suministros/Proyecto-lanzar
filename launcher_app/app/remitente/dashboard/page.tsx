// app/remitente/dashboard/page.tsx
import AssignedRequestsTable from "@/app/components/requests/AssignedRequestsTable";
import CoverageMap from "@/app/components/map/CoverageMap";
import ActivitySummary from "@/app/components/activity/ActivitySummary";
import StockCard from "@/app/components/stock/StockCard";
import NotificationsPanel from "@/app/components/notifications/NotificationsPanel";

export default function RemitenteDashboardPage() {
  return (
    <div className="flex gap-3 h-full">
      {/* Columna principal */}
      <div className="flex flex-col gap-3 flex-3/4 min-w-0 overflow-auto">
        <CoverageMap />
        <AssignedRequestsTable />
      </div>
      {/*Col derecha */}
      <div className="flex flex-col gap-2 flex-1/4 shrink-0 overflow-auto">
        <StockCard />
        <ActivitySummary />
        <NotificationsPanel />
      </div>
    </div>
  );
}
