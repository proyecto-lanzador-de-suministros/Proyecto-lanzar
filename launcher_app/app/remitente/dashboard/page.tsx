// app/remitente/dashboard/page.tsx
import AssignedRequestsTable from "@/app/components/requests/AssignedRequestsTable";
import CoverageMap from "@/app/components/map/CoverageMap";
import ActivitySummary from "@/app/components/activity/ActivitySummary";
import StockCard from "@/app/components/stock/StockCard";

export default function RemitenteDashboardPage() {
  return (
    <div className="flex gap-6">
      {/* Columna principal */}
      <div className="flex flex-col gap-6 flex-1 min-w-0">
        <CoverageMap />
        <AssignedRequestsTable />
      </div>
      {/*Col derecha */}
      <div className="flex flex-col gap-6 w-72 shrink-0">
        <StockCard />
        <ActivitySummary />
      </div>
    </div>
  );
}
