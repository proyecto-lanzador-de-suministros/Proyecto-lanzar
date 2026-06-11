export interface SidebarConfig {
  activeHref?: string;
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
