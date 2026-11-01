import type { ColumnSchema, Dataset, Row } from "./types";

export type Aggregation = "sum" | "avg" | "min" | "max" | "count";

export function aggregate(
  rows: Row[],
  groupBy: string,
  measure: string | null,
  agg: Aggregation,
): Array<{ key: string; value: number }> {
  const buckets = new Map<string, number[]>();
  for (const r of rows) {
    const key = r[groupBy] == null ? "—" : String(r[groupBy]);
    if (!buckets.has(key)) buckets.set(key, []);
    if (agg === "count") buckets.get(key)!.push(1);
    else if (measure) {
      const v = r[measure];
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n)) buckets.get(key)!.push(n);
    }
  }
  const out: Array<{ key: string; value: number }> = [];
  for (const [key, arr] of buckets) {
    let value = 0;
    switch (agg) {
      case "sum":
      case "count": value = arr.reduce((a, b) => a + b, 0); break;
      case "avg": value = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; break;
      case "min": value = arr.length ? Math.min(...arr) : 0; break;
      case "max": value = arr.length ? Math.max(...arr) : 0; break;
    }
    out.push({ key, value });
  }
  return out.sort((a, b) => b.value - a.value);
}

export function pickColumns(schema: ColumnSchema[]) {
  const numeric = schema.filter((c) => c.type === "number");
  const dates = schema.filter((c) => c.type === "date");
  const categorical = schema.filter(
    (c) => (c.type === "string" || c.type === "boolean") && c.unique > 1 && c.unique <= 50,
  );
  const highCard = schema.filter((c) => c.type === "string" && c.unique > 50);
  return { numeric, dates, categorical, highCard };
}

export interface AutoKpi {
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  column?: string;
}

export function autoKpis(ds: Dataset): AutoKpi[] {
  const { numeric } = pickColumns(ds.columns);
  const kpis: AutoKpi[] = [{ label: "Rows", value: ds.rowCount, format: "number" }];
  const priority = ["revenue", "sales", "amount", "total", "price", "cost", "profit", "value"];
  const scored = numeric
    .map((c) => ({ c, score: priority.findIndex((p) => c.name.toLowerCase().includes(p)) }))
    .sort((a, b) => (a.score === -1 ? 999 : a.score) - (b.score === -1 ? 999 : b.score));
  for (const { c } of scored.slice(0, 5)) {
    const sum = ds.rows.reduce((a, r) => {
      const v = r[c.name];
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? a + n : a;
    }, 0);
    const isCurrency = /revenue|sales|amount|price|cost|profit|value|total/i.test(c.name);
    kpis.push({
      label: c.name,
      value: sum,
      format: isCurrency ? "currency" : "number",
      column: c.name,
    });
  }
  return kpis.slice(0, 6);
}

export function formatKpi(v: number, format: AutoKpi["format"]): string {
  if (format === "currency") {
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }
  if (format === "percent") return `${(v * 100).toFixed(1)}%`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

export function timeSeries(
  rows: Row[],
  dateCol: string,
  measure: string,
  granularity: "day" | "month" = "month",
): Array<{ key: string; value: number }> {
  const bucket = new Map<string, number>();
  for (const r of rows) {
    const dateVal = r[dateCol];
    if (dateVal == null) continue;
    const t = Date.parse(String(dateVal));
    if (Number.isNaN(t)) continue;
    const d = new Date(t);
    const key = granularity === "month"
      ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      : d.toISOString().slice(0, 10);
    const v = r[measure];
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) continue;
    bucket.set(key, (bucket.get(key) ?? 0) + n);
  }
  return Array.from(bucket.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, value }));
}
