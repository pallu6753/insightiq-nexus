import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { DemoBanner } from "@/components/app/DemoBanner";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1">
          <DemoBanner />
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
