export interface SidebarConfig {
  activeHref?: string;
  role?: string;
}

export interface TopBarConfig {
  role: string;
  subtitle: string;
  notificationCount: number;
}

export interface DashboardShellProps {
  sidebar: SidebarConfig;
  topBar: TopBarConfig;
  children: React.ReactNode;
}
