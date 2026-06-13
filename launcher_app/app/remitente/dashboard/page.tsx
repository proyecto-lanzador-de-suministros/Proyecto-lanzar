// app/remitente/dashboard/page.tsx
import AssignedRequestsTable from "@/app/components/requests/AssignedRequestsTable";
import CoverageMap from "@/app/components/map/CoverageMap";
export default function RemitenteDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <CoverageMap />
      <AssignedRequestsTable />
    </div>
  );
}
