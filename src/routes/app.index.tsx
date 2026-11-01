import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Activity, Database, Download, RefreshCw, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyDataset, LoadingPanel } from "@/components/datasets/EmptyDataset";
import { useActiveDataset } from "@/lib/datasets/hooks";
import { aggregate, autoKpis, formatKpi, pickColumns, timeSeries } from "@/lib/datasets/aggregate";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  color: "var(--color-foreground)",
  fontSize: 12,
};

function DashboardPage() {
  const { dataset, loading } = useActiveDataset();

  const analysis = useMemo(() => {
    if (!dataset) return null;
    const { numeric, dates, categorical } = pickColumns(dataset.columns);
    const primaryMeasure = numeric[0]?.name ?? null;
    const dateCol = dates[0]?.name ?? null;
    const kpis = autoKpis(dataset);
    const series = dateCol && primaryMeasure ? timeSeries(dataset.rows, dateCol, primaryMeasure) : [];
    const cat1 = categorical[0]?.name ?? null;
    const cat2 = categorical[1]?.name ?? null;
    const pie = cat1 && primaryMeasure
      ? aggregate(dataset.rows, cat1, primaryMeasure, "sum").slice(0, 6)
      : [];
    const bar = cat2 && primaryMeasure
      ? aggregate(dataset.rows, cat2, primaryMeasure, "sum").slice(0, 8)
      : cat1 && primaryMeasure
        ? aggregate(dataset.rows, cat1, primaryMeasure, "count").slice(0, 8)
        : [];
    return { primaryMeasure, dateCol, kpis, series, pie, bar, cat1, cat2 };
  }, [dataset]);

  const exportCsv = () => {
    if (!dataset) return;
    const cols = dataset.columns.map((c) => c.name);
    const escape = (v: unknown) => {
      if (v == null) return "";
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [cols.join(",")];
    for (const r of dataset.rows) lines.push(cols.map((c) => escape(r[c])).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataset.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  return (
    <>
      <AppHeader title="Executive Dashboard" subtitle={dataset ? `${dataset.name} · ${dataset.rowCount.toLocaleString()} rows` : "Live from your active dataset"} />
      <main className="space-y-6 p-4 sm:p-6">
        {loading && <LoadingPanel />}
        {!loading && !dataset && <EmptyDataset />}
        {!loading && dataset && analysis && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1"><Database className="h-3 w-3 text-primary" /> {dataset.name}</Badge>
              <Badge variant="outline">{dataset.rowCount.toLocaleString()} rows</Badge>
              <Badge variant="outline">{dataset.columnCount} columns</Badge>
              <Badge className="bg-success/15 text-success hover:bg-success/15">Quality {dataset.qualityScore}%</Badge>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success("Dashboard refreshed")}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
                <Button size="sm" className="gradient-primary border-0" onClick={exportCsv}>
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {analysis.kpis.map((k) => (
                <div key={k.label} className="rounded-2xl border border-border glass p-4">
                  <div className="truncate text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
                  <div className="mt-1 text-2xl font-bold">{formatKpi(k.value, k.format)}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">across {dataset.rowCount.toLocaleString()} rows</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <ChartCard title={analysis.dateCol && analysis.primaryMeasure ? `${analysis.primaryMeasure} over time` : "Time series"} subtitle={analysis.dateCol ?? "No date column detected"} className="lg:col-span-2">
                {analysis.series.length ? (
                  <ResponsiveContainer>
                    <AreaChart data={analysis.series}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="key" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyPanel note="Upload data with a date and numeric column to see a trend." />
                )}
              </ChartCard>

              <ChartCard title={analysis.cat1 ? `${analysis.cat1} breakdown` : "Breakdown"} subtitle={analysis.primaryMeasure ? `by ${analysis.primaryMeasure}` : ""}>
                {analysis.pie.length ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={analysis.pie} dataKey="value" nameKey="key" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {analysis.pie.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyPanel note="Add a categorical column to enable breakdown." />
                )}
              </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <ChartCard title={analysis.cat2 ? `Top ${analysis.cat2}` : analysis.cat1 ? `Top ${analysis.cat1}` : "Top categories"} subtitle="Sorted by measure" className="lg:col-span-2">
                {analysis.bar.length ? (
                  <ResponsiveContainer>
                    <BarChart data={analysis.bar} layout="vertical" margin={{ left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                      <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="key" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={110} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="var(--color-primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyPanel note="Not enough categorical + numeric data." />
                )}
              </ChartCard>

              <div className="rounded-2xl border border-border glass-strong p-5">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Auto Insights</div>
                    <div className="text-xs text-muted-foreground">Generated from schema</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  {analysis.primaryMeasure && (
                    <li className="rounded-lg border border-border bg-background/40 p-3">
                      <div className="text-xs text-muted-foreground">Primary measure</div>
                      <div className="font-medium">{analysis.primaryMeasure}</div>
                    </li>
                  )}
                  {analysis.dateCol && (
                    <li className="rounded-lg border border-border bg-background/40 p-3">
                      <div className="text-xs text-muted-foreground">Time axis</div>
                      <div className="font-medium">{analysis.dateCol}</div>
                    </li>
                  )}
                  {analysis.pie[0] && (
                    <li className="rounded-lg border border-border bg-background/40 p-3">
                      <div className="text-xs text-muted-foreground">Top {analysis.cat1}</div>
                      <div className="font-medium">{analysis.pie[0].key}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatKpi(analysis.pie[0].value, "number")} · {((analysis.pie[0].value / analysis.pie.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}% of total
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-border glass p-5">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">Sample rows</div>
                <Badge variant="outline" className="ml-auto">first 20 of {dataset.rowCount.toLocaleString()}</Badge>
              </div>
              <div className="max-h-[360px] overflow-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card/95 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
                    <tr>
                      {dataset.columns.map((c) => (
                        <th key={c.name} className="px-3 py-2 text-left">{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.rows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {dataset.columns.map((c) => (
                          <td key={c.name} className="max-w-[220px] truncate px-3 py-2">
                            {r[c.name] == null ? <span className="text-muted-foreground/60">—</span> : String(r[c.name])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border glass p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      <div className="h-[260px] w-full">{children}</div>
    </div>
  );
}

function EmptyPanel({ note }: { note: string }) {
  return (
    <div className="grid h-full place-items-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground">
      {note}
    </div>
  );
}
