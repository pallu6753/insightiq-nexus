import { Bell, Command, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DatasetSwitcher } from "@/components/datasets/DatasetSwitcher";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="hidden min-w-0 flex-1 sm:block">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <DatasetSwitcher />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search insights, reports, sources…"
            className="h-9 w-72 rounded-lg border border-border bg-background/60 pl-9 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Command className="inline h-2.5 w-2.5" />K
          </kbd>
        </div>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-xs font-semibold text-white">
          SC
        </div>
      </div>
    </header>
  );
}
