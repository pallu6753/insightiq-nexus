import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, BarChart3, Download, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyDataset, LoadingPanel } from "@/components/datasets/EmptyDataset";
import { useActiveDataset } from "@/lib/datasets/hooks";
import { aggregate, formatKpi, pickColumns, type Aggregation } from "@/lib/datasets/aggregate";
import { toast } from "sonner";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  color: "var(--color-foreground)",
  fontSize: 12,
};

const palette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

type ChartKind = "bar" | "line" | "pie";

function AnalyticsPage() {
  const { dataset, loading } = useActiveDataset();

  const { categorical, numeric } = useMemo(
    () => (dataset ? pickColumns(dataset.columns) : { categorical: [], numeric: [], dates: [], highCard: [] }),
    [dataset],
  );

  const [dimension, setDimension] = useState<string | null>(null);
  const [measure, setMeasure] = useState<string | null>(null);
  const [agg, setAgg] = useState<Aggregation>("sum");
  const [chart, setChart] = useState<ChartKind>("bar");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState("");

  const dim = dimension ?? categorical[0]?.name ?? null;
  const meas = measure ?? numeric[0]?.name ?? null;

  const data = useMemo(() => {
    if (!dataset || !dim) return [];
    let out = aggregate(dataset.rows, dim, meas, agg);
    if (filter) {
      const q = filter.toLowerCase();
      out = out.filter((r) => r.key.toLowerCase().includes(q));
    }
    out.sort((a, b) => (sortDir === "desc" ? b.value - a.value : a.value - b.value));
    return out.slice(0, 50);
  }, [dataset, dim, meas, agg, sortDir, filter]);

  const exportCsv = () => {
    if (!data.length) return;
    const lines = [`${dim},${agg}_${meas ?? "count"}`, ...data.map((r) => `"${r.key}",${r.value}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  return (
    <>
      <AppHeader title="Analytics" subtitle={dataset ? `Interactive pivot on ${dataset.name}` : "Pivot, group, and drill into your data"} />
      <main className="space-y-6 p-4 sm:p-6">
        {loading && <LoadingPanel />}
        {!loading && !dataset && <EmptyDataset />}
        {!loading && dataset && (
          <>
            <div className="grid gap-3 rounded-2xl border border-border glass p-4 md:grid-cols-5">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Dimension</div>
                <Select value={dim ?? ""} onValueChange={(v) => setDimension(v)}>
                  <SelectTrigger><SelectValue placeholder="Pick a dimension" /></SelectTrigger>
                  <SelectContent>
                    {[...categorical, ...dataset.columns.filter((c) => c.type === "date")].map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name} <span className="text-muted-foreground">({c.type})</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Measure</div>
                <Select value={meas ?? ""} onValueChange={(v) => setMeasure(v)}>
                  <SelectTrigger><SelectValue placeholder="Pick a measure" /></SelectTrigger>
                  <SelectContent>
                    {numeric.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Aggregation</div>
                <Select value={agg} onValueChange={(v) => setAgg(v as Aggregation)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="min">Min</SelectItem>
                    <SelectItem value="max">Max</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Filter</div>
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search dimension…"
                  className="h-9 w-full rounded-md border border-border bg-background/60 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Chart</div>
                <div className="flex gap-1">
                  <Button variant={chart === "bar" ? "default" : "outline"} size="sm" onClick={() => setChart("bar")}><BarChart3 className="h-3.5 w-3.5" /></Button>
                  <Button variant={chart === "line" ? "default" : "outline"} size="sm" onClick={() => setChart("line")}><LineIcon className="h-3.5 w-3.5" /></Button>
                  <Button variant={chart === "pie" ? "default" : "outline"} size="sm" onClick={() => setChart("pie")}><PieIcon className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={exportCsv}><Download className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border glass-strong p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{agg.toUpperCase()} of {meas ?? "count"} by {dim ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{data.length} groups · top 50</div>
                </div>
                <Badge variant="outline">{dataset.rowCount.toLocaleString()} rows scanned</Badge>
              </div>
              <div className="h-[360px] w-full">
                {data.length === 0 ? (
                  <div className="grid h-full place-items-center text-sm text-muted-foreground">Pick a dimension and measure to begin.</div>
                ) : chart === "bar" ? (
                  <ResponsiveContainer>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="key" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} dy={12} height={70} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : chart === "line" ? (
                  <ResponsiveContainer>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="key" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} dy={12} height={70} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.slice(0, 8)} dataKey="value" nameKey="key" innerRadius={60} outerRadius={110} paddingAngle={3}>
                        {data.slice(0, 8).map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border glass p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Pivot table</div>
                <Button size="sm" variant="ghost" onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}>
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5" /> Sort {sortDir}
                </Button>
              </div>
              <div className="max-h-[360px] overflow-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card/95 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
                    <tr>
                      <th className="px-3 py-2 text-left">{dim}</th>
                      <th className="px-3 py-2 text-right">{agg}({meas ?? "*"})</th>
                      <th className="px-3 py-2 text-right">% of total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const total = data.reduce((a, b) => a + b.value, 0) || 1;
                      return data.map((r) => (
                        <tr key={r.key} className="border-t border-border">
                          <td className="px-3 py-2">{r.key}</td>
                          <td className="px-3 py-2 text-right font-mono">{formatKpi(r.value, "number")}</td>
                          <td className="px-3 py-2 text-right text-muted-foreground">{((r.value / total) * 100).toFixed(1)}%</td>
                        </tr>
                      ));
                    })()}
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
