import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Bell, Check, Search, ShieldAlert, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EmptyDataset, LoadingPanel } from "@/components/datasets/EmptyDataset";
import { useActiveDataset } from "@/lib/datasets/hooks";
import { generateAlerts, type Alert, type AlertKind } from "@/lib/analytics/alerts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/alerts")({
  component: AlertsPage,
});

const RULE_DEFS: Array<{ kind: AlertKind; label: string; desc: string; icon: React.ElementType }> = [
  { kind: "missing_values", label: "Missing values", desc: "Columns with high null rates", icon: AlertTriangle },
  { kind: "outlier", label: "Statistical outliers", desc: "IQR-based anomaly detection", icon: Zap },
  { kind: "forecast_anomaly", label: "Trend anomalies", desc: "Spikes and drops vs history", icon: TrendingDown },
  { kind: "data_quality", label: "Data quality", desc: "Overall dataset health", icon: ShieldAlert },
  { kind: "stale_data", label: "Stale data", desc: "Records older than 60 days", icon: TrendingUp },
];

function severityTone(s: string) {
  if (s === "high") return "bg-destructive/15 text-destructive";
  if (s === "medium") return "bg-warning/15 text-warning";
  return "bg-info/15 text-info";
}

function AlertsPage() {
  const { dataset, loading } = useActiveDataset();
  const [enabled, setEnabled] = useState<Record<AlertKind, boolean>>({
    missing_values: true, outlier: true, threshold: true, forecast_anomaly: true, data_quality: true, duplicate: true, stale_data: true,
  });
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [ack, setAck] = useState<Record<string, boolean>>({});

  const alerts: Alert[] = useMemo(() => (dataset ? generateAlerts(dataset) : []), [dataset]);
  const filtered = useMemo(() => {
    return alerts
      .filter((a) => enabled[a.kind])
      .filter((a) => severityFilter === "all" || a.severity === severityFilter)
      .filter((a) => !query || `${a.title} ${a.detail} ${a.column ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  }, [alerts, enabled, severityFilter, query]);

  const counts = useMemo(() => ({
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,
  }), [alerts]);

  return (
    <>
      <AppHeader title="Alerts" subtitle={dataset ? `${alerts.length} alerts from ${dataset.name}` : "Smart, AI-powered notifications"} />
      <main className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        {loading && <LoadingPanel />}
        {!loading && !dataset && <EmptyDataset />}
        {!loading && dataset && (
          <>
            <section className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search alerts…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-1 rounded-lg border border-border p-1">
                  {(["all", "high", "medium", "low"] as const).map((s) => (
                    <Button key={s} size="sm" variant={severityFilter === s ? "default" : "ghost"} onClick={() => setSeverityFilter(s)} className="capitalize h-7 px-3 text-xs">
                      {s}{s !== "all" ? ` · ${counts[s]}` : ""}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border glass">
                {filtered.length === 0 ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    {alerts.length ? "No alerts match your filters." : "No alerts detected. Dataset passes quality checks."}
                  </div>
                ) : (
                  filtered.map((a) => (
                    <div key={a.id} className={`flex items-start gap-3 border-b border-border p-4 last:border-0 ${ack[a.id] ? "opacity-50" : ""}`}>
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${severityTone(a.severity)}`}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${severityTone(a.severity)} hover:${severityTone(a.severity)} capitalize`}>{a.severity}</Badge>
                          {a.column && <Badge variant="outline">{a.column}</Badge>}
                          <span className="text-xs text-muted-foreground">{a.source}</span>
                        </div>
                        <div className="mt-1 text-sm font-medium">{a.title}</div>
                        <div className="text-xs text-muted-foreground">{a.detail}</div>
                      </div>
                      <Button
                        size="sm"
                        variant={ack[a.id] ? "ghost" : "outline"}
                        onClick={() => {
                          setAck((s) => ({ ...s, [a.id]: !s[a.id] }));
                          toast.success(ack[a.id] ? "Alert reopened" : "Alert acknowledged");
                        }}
                        className="shrink-0"
                      >
                        <Check className="mr-1 h-3 w-3" /> {ack[a.id] ? "Reopen" : "Acknowledge"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <aside className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rules</h2>
              <div className="rounded-2xl border border-border glass p-3">
                {RULE_DEFS.map((r) => (
                  <div key={r.kind} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-accent/20">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <r.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{r.label}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.desc}</div>
                    </div>
                    <Switch
                      checked={enabled[r.kind]}
                      onCheckedChange={(v) => {
                        setEnabled((s) => ({ ...s, [r.kind]: v }));
                        toast.success(`${r.label} ${v ? "enabled" : "disabled"}`);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border glass p-4 text-xs text-muted-foreground">
                Alerts run live against the active dataset. Change datasets to re-scan.
              </div>
            </aside>
          </>
        )}
      </main>
    </>
  );
}
