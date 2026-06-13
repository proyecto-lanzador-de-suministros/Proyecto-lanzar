// app/remitente/dashboard/page.tsx
import AssignedRequestsTable from "@/app/components/requests/AssignedRequestsTable";
import CoverageMap from "@/app/components/map/CoverageMap";
import ActivitySummary from "@/app/components/activity/ActivitySummary";
import StockCard from "@/app/components/stock/StockCard";
import NotificationsPanel from "@/app/components/notifications/NotificationsPanel";

export default function RemitenteDashboardPage() {
  return (
    <div className="flex gap-3">
      {/* Columna principal */}
      <div className="flex flex-col gap-3 flex-3/4 min-w-0">
        <CoverageMap />
        <AssignedRequestsTable />
      </div>
      {/*Col derecha */}
      <div className="flex flex-col gap-2 w-[28%] shrink-0">
        <StockCard />
        <ActivitySummary />
        <NotificationsPanel />
      </div>
    </div>
  );
}
