// app/remitente/dashboard/page.tsx
import AssignedRequestsTable from "@/app/components/requests/AssignedRequestsTable";

export default function RemitenteDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <AssignedRequestsTable />
    </div>
  );
}
