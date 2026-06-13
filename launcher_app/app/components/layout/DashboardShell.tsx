import Sidebar from "@/app/components/layout/Sidebar";
import TopBar from "@/app/components/layout/TopBar";
import { DashboardShellProps } from "@/app/components/layout/types";

export default function DashboardShell({
  sidebar,
  topBar,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar {...sidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar {...topBar} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
