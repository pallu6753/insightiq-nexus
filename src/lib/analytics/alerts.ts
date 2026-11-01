import type { Dataset } from "@/lib/datasets/types";
import { forecastMeasure } from "./forecast";
import { pickColumns } from "@/lib/datasets/aggregate";

export type AlertSeverity = "high" | "medium" | "low";
export type AlertKind =
  | "missing_values"
  | "outlier"
  | "threshold"
  | "forecast_anomaly"
  | "data_quality"
  | "duplicate"
  | "stale_data";

export interface Alert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  detail: string;
  column?: string;
  metric?: number;
  createdAt: number;
  source: string;
}

function pctile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const i = Math.floor((sorted.length - 1) * p);
  return sorted[i];
}

export function generateAlerts(dataset: Dataset): Alert[] {
  const out: Alert[] = [];
  const now = Date.now();
  const { numeric, dates } = pickColumns(dataset.columns);

  // Missing values
  for (const c of dataset.columns) {
    const pct = dataset.rowCount ? c.nullCount / dataset.rowCount : 0;
    if (pct >= 0.4) {
      out.push({
        id: `${c.name}-nulls`,
        kind: "missing_values",
        severity: pct >= 0.7 ? "high" : "medium",
        title: `High missing values in ${c.name}`,
        detail: `${(pct * 100).toFixed(1)}% of rows are missing this column (${c.nullCount.toLocaleString()} of ${dataset.rowCount.toLocaleString()}).`,
        column: c.name,
        metric: pct,
        createdAt: now,
        source: "Data profiler",
      });
    } else if (pct >= 0.1) {
      out.push({
        id: `${c.name}-nulls-low`,
        kind: "data_quality",
        severity: "low",
        title: `Missing values in ${c.name}`,
        detail: `${(pct * 100).toFixed(1)}% null (${c.nullCount.toLocaleString()} rows). Consider imputation.`,
        column: c.name,
        metric: pct,
        createdAt: now,
        source: "Data profiler",
      });
    }
  }

  // Outliers using IQR
  for (const c of numeric.slice(0, 8)) {
    const values: number[] = [];
    for (const r of dataset.rows) {
      const v = r[c.name];
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n)) values.push(n);
    }
    if (values.length < 20) continue;
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = pctile(sorted, 0.25);
    const q3 = pctile(sorted, 0.75);
    const iqr = q3 - q1;
    if (iqr <= 0) continue;
    const lo = q1 - 3 * iqr;
    const hi = q3 + 3 * iqr;
    const outliers = values.filter((v) => v < lo || v > hi);
    if (outliers.length) {
      const pct = outliers.length / values.length;
      out.push({
        id: `${c.name}-outliers`,
        kind: "outlier",
        severity: pct >= 0.05 ? "high" : pct >= 0.01 ? "medium" : "low",
        title: `${outliers.length} outliers in ${c.name}`,
        detail: `Values outside [${lo.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${hi.toLocaleString(undefined, { maximumFractionDigits: 2 })}]. Max observed: ${Math.max(...outliers).toLocaleString()}.`,
        column: c.name,
        metric: pct,
        createdAt: now,
        source: "IQR anomaly detector",
      });
    }
  }

  // Forecast anomalies — last actual vs prior trend
  const dateCol = dates[0]?.name;
  if (dateCol) {
    for (const c of numeric.slice(0, 3)) {
      const f = forecastMeasure(dataset.rows, dateCol, c.name, 1);
      if (!f || f.history.length < 4) continue;
      const last = f.history.at(-1)!.value;
      const prevValues = f.history.slice(0, -1).map((h) => h.value);
      const avgPrev = prevValues.reduce((a, b) => a + b, 0) / prevValues.length;
      if (avgPrev === 0) continue;
      const delta = (last - avgPrev) / Math.abs(avgPrev);
      if (Math.abs(delta) >= 0.25) {
        out.push({
          id: `${c.name}-forecast-anom`,
          kind: "forecast_anomaly",
          severity: Math.abs(delta) >= 0.5 ? "high" : "medium",
          title: `${c.name} ${delta > 0 ? "spike" : "drop"} vs trend`,
          detail: `Latest ${f.history.at(-1)!.key} value of ${last.toLocaleString()} is ${(delta * 100).toFixed(1)}% ${delta > 0 ? "above" : "below"} the prior average of ${avgPrev.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
          column: c.name,
          metric: delta,
          createdAt: now,
          source: "Trend detector",
        });
      }
    }
  }

  // Overall data quality
  if (dataset.qualityScore < 70) {
    out.push({
      id: `quality-overall`,
      kind: "data_quality",
      severity: dataset.qualityScore < 50 ? "high" : "medium",
      title: `Dataset quality score ${dataset.qualityScore}/100`,
      detail: `Consider cleaning missing values and duplicates before running production analysis.`,
      createdAt: now,
      source: "Quality engine",
      metric: dataset.qualityScore / 100,
    });
  }

  // Stale data — most recent date > 60 days
  if (dateCol) {
    let maxT = 0;
    for (const r of dataset.rows) {
      const v = r[dateCol];
      const t = typeof v === "number" ? v : Date.parse(String(v));
      if (Number.isFinite(t) && t > maxT) maxT = t;
    }
    if (maxT > 0) {
      const daysOld = (Date.now() - maxT) / (1000 * 60 * 60 * 24);
      if (daysOld > 60) {
        out.push({
          id: `stale-${dateCol}`,
          kind: "stale_data",
          severity: daysOld > 180 ? "high" : "medium",
          title: `${dateCol} data appears stale`,
          detail: `Most recent record is ${Math.round(daysOld)} days old. Refresh to keep dashboards current.`,
          column: dateCol,
          metric: daysOld,
          createdAt: now,
          source: "Freshness monitor",
        });
      }
    }
  }

  const order: Record<AlertSeverity, number> = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}
