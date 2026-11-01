import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CreditCard,
  Database,
  FileBarChart,
  LayoutDashboard,
  Settings,
  Sparkles,
  TrendingUp,
  Upload,
  User,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";

const sections: Array<{
  label: string;
  items: Array<{ title: string; url: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/app", icon: LayoutDashboard },
      { title: "Data Sources", url: "/app/data-sources", icon: Database },
      { title: "Data Upload", url: "/app/data-upload", icon: Upload },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
      { title: "Forecasting", url: "/app/forecasting", icon: TrendingUp },
      { title: "AI Copilot", url: "/app/copilot", icon: Bot },
      { title: "Reports", url: "/app/reports", icon: FileBarChart },
      { title: "Alerts", url: "/app/alerts", icon: AlertTriangle },
    ],
  },
  {
    label: "Organization",
    items: [
      { title: "Team", url: "/app/team", icon: Users },
      { title: "Settings", url: "/app/settings", icon: Settings },
      { title: "Billing", url: "/app/billing", icon: CreditCard },
      { title: "Profile", url: "/app/profile", icon: User },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) =>
    url === "/app" ? pathname === "/app" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/40 p-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-primary text-sm font-semibold text-white">
            SC
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Sarah Chen</div>
            <div className="truncate text-xs text-muted-foreground">Owner · Acme Corp</div>
          </div>
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
