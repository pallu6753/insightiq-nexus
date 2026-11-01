import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Brain, Download, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { EmptyDataset, LoadingPanel } from "@/components/datasets/EmptyDataset";
import { useActiveDataset } from "@/lib/datasets/hooks";
import { autoForecasts, forecastMeasure, type ForecastResult } from "@/lib/analytics/forecast";
import { pickColumns } from "@/lib/datasets/aggregate";
import { toast } from "sonner";

export const Route = createFileRoute("/app/forecasting")({
  component: ForecastingPage,
});

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
};

function ForecastingPage() {
  const { dataset, loading } = useActiveDataset();
  const [horizon, setHorizon] = useState(6);
  const [selected, setSelected] = useState<string | null>(null);

  const { numeric, dates } = useMemo(() => pickColumns(dataset?.columns ?? []), [dataset]);
  const dateCol = dates[0]?.name ?? null;

  const forecasts: ForecastResult[] = useMemo(() => {
    if (!dataset) return [];
    return autoForecasts(dataset, horizon, 6);
  }, [dataset, horizon]);

  const active = useMemo(() => {
    if (!dataset || !dateCol) return null;
    const name = selected ?? forecasts[0]?.measure ?? numeric[0]?.name;
    if (!name) return null;
    return forecastMeasure(dataset.rows, dateCol, name, horizon);
  }, [dataset, dateCol, selected, forecasts, horizon, numeric]);

  const exportCsv = () => {
    if (!active) return;
    const lines = ["period,actual,forecast,upper,lower"];
    for (const p of active.points) {
      lines.push([p.key, p.actual ?? "", p.forecast?.toFixed(2) ?? "", p.upper?.toFixed(2) ?? "", p.lower?.toFixed(2) ?? ""].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.measure}-forecast.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Forecast exported`);
  };

  return (
    <>
      <AppHeader title="Forecasting" subtitle={dataset ? `${dataset.name} · ${horizon}-month horizon` : "Predictive models with confidence intervals"} />
      <main className="space-y-6 p-4 sm:p-6">
        {loading && <LoadingPanel />}
        {!loading && !dataset && <EmptyDataset />}
        {!loading && dataset && !dateCol && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No date column detected in <span className="font-medium text-foreground">{dataset.name}</span>. Upload data with at least one date column to enable forecasting.
          </div>
        )}
        {!loading && dataset && dateCol && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">Time axis: {dateCol}</Badge>
              <Badge variant="outline">{numeric.length} numeric measures</Badge>
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Horizon</span>
                  <div className="w-40">
                    <Slider min={3} max={18} step={1} value={[horizon]} onValueChange={([v]) => setHorizon(v)} />
                  </div>
                  <span className="w-10 text-sm font-medium">{horizon}m</span>
                </div>
                <Button size="sm" variant="outline" onClick={exportCsv} disabled={!active}>
                  <Download className="mr-2 h-4 w-4" /> Export forecast
                </Button>
              </div>
            </div>

            {forecasts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Not enough time-series history to forecast. Need at least 3 periods.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {forecasts.map((f) => {
                  const isActive = (selected ?? forecasts[0].measure) === f.measure;
                  const up = f.trendPct >= 0;
                  return (
                    <button
                      key={f.measure}
                      onClick={() => setSelected(f.measure)}
                      className={`text-left rounded-2xl border p-5 glass transition ${isActive ? "border-primary/60 shadow-elegant" : "border-border hover:border-primary/40"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                            <Brain className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{f.measure}</div>
                            <div className="text-xs text-muted-foreground">{f.method === "holt-winters" ? "Holt smoothing" : "Linear regression"} · {f.horizon}m</div>
                          </div>
                        </div>
                        <Badge className={up ? "bg-success/15 text-success hover:bg-success/15" : "bg-destructive/15 text-destructive hover:bg-destructive/15"}>
                          {up ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                          {up ? "+" : ""}{f.trendPct.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</div>
                          <div className="text-2xl font-bold">{f.confidence}%</div>
                          <div className="text-[10px] text-muted-foreground">MAPE {f.mape.toFixed(1)}%</div>
                        </div>
                        <div className="h-10 w-24">
                          <ResponsiveContainer>
                            <AreaChart data={f.history.slice(-8)}>
                              <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fill="var(--color-primary)" fillOpacity={0.2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full gradient-primary" style={{ width: `${f.confidence}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {active && (
              <div className="rounded-2xl border border-border glass-strong p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{active.measure} — actual vs forecast</div>
                    <div className="text-xs text-muted-foreground">{active.explanation}</div>
                  </div>
                  <Badge variant="outline">Model: {active.method === "holt-winters" ? "Holt exponential smoothing" : "Linear regression"}</Badge>
                </div>
                <div className="h-[380px] w-full">
                  <ResponsiveContainer>
                    <ComposedChart data={active.points}>
                      <defs>
                        <linearGradient id="fband" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="key" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#fband)" name="Upper 95%" />
                      <Area type="monotone" dataKey="lower" stroke="transparent" fill="var(--color-background)" name="Lower 95%" />
                      <Line type="monotone" dataKey="actual" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} name="Actual" connectNulls={false} />
                      <Line type="monotone" dataKey="forecast" stroke="var(--color-accent)" strokeWidth={2.5} strokeDasharray="5 4" dot={false} name="Forecast" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
