import { createFileRoute } from "@tanstack/react-router";
import {
  Cloud,
  Database,
  FileSpreadsheet,
  FileText,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Server,
  Sheet,
  Snowflake,
} from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dataSources } from "@/lib/mock-data";

export const Route = createFileRoute("/app/data-sources")({
  component: DataSourcesPage,
});

const connectors = [
  { name: "CSV", icon: FileText, desc: "Upload flat files" },
  { name: "Excel", icon: FileSpreadsheet, desc: "XLSX & XLS" },
  { name: "Google Sheets", icon: Sheet, desc: "Live sync" },
  { name: "PostgreSQL", icon: Database, desc: "Direct connection" },
  { name: "SQL Database", icon: Server, desc: "MySQL, SQL Server" },
  { name: "Snowflake", icon: Snowflake, desc: "Cloud warehouse" },
  { name: "REST API", icon: Globe, desc: "Custom endpoints" },
  { name: "Cloud Storage", icon: Cloud, desc: "S3, GCS, Azure Blob" },
];

function statusTone(s: string) {
  if (s === "Connected") return "bg-success/15 text-success";
  if (s === "Syncing") return "bg-info/15 text-info";
  return "bg-destructive/15 text-destructive";
}

function DataSourcesPage() {
  return (
    <>
      <AppHeader title="Data Sources" subtitle="Connect, monitor, and govern every source of truth" />
      <main className="space-y-6 p-4 sm:p-6">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Connect a new source
            </h2>
            <Button size="sm" className="gradient-primary border-0">
              <Plus className="mr-1.5 h-4 w-4" /> Custom connector
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {connectors.map((c) => (
              <button
                key={c.name}
                className="group rounded-2xl border border-border glass p-4 text-left transition hover:border-primary/40 hover:shadow-elegant"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active connections
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search sources"
                className="h-9 w-56 rounded-lg border border-border bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border glass">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-border bg-card/40 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
              <div>Source</div>
              <div>Type</div>
              <div>Status</div>
              <div>Rows</div>
              <div>Last updated</div>
              <div />
            </div>
            {dataSources.map((s) => (
              <div
                key={s.name}
                className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-3"
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.type}</div>
                <div>
                  <Badge className={`${statusTone(s.status)} hover:${statusTone(s.status)}`}>{s.status}</Badge>
                </div>
                <div className="text-sm">{s.rows}</div>
                <div className="text-sm text-muted-foreground">{s.updated}</div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
