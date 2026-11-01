import type { Dataset, Row } from "@/lib/datasets/types";
import { pickColumns, timeSeries } from "@/lib/datasets/aggregate";

export interface ForecastPoint {
  key: string;
  actual: number | null;
  forecast: number | null;
  upper: number | null;
  lower: number | null;
}

export interface ForecastResult {
  measure: string;
  dateCol: string;
  history: Array<{ key: string; value: number }>;
  points: ForecastPoint[];
  horizon: number;
  method: "holt-winters" | "linear" | "naive";
  confidence: number; // 0-100
  trendPct: number;
  mape: number; // mean absolute percent error on holdout
  explanation: string;
}

function mean(a: number[]) {
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
}
function stddev(a: number[]) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
}

// Simple Holt (double exponential smoothing) — captures level + trend
function holt(values: number[], horizon: number, alpha = 0.5, beta = 0.3) {
  if (values.length < 2) return { fitted: values.slice(), forecast: Array(horizon).fill(values.at(-1) ?? 0) };
  let level = values[0];
  let trend = values[1] - values[0];
  const fitted: number[] = [level];
  for (let i = 1; i < values.length; i++) {
    const prevLevel = level;
    level = alpha * values[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    fitted.push(level);
  }
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) forecast.push(level + h * trend);
  return { fitted, forecast };
}

function linearForecast(values: number[], horizon: number) {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const mx = mean(xs);
  const my = mean(values);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (values[i] - my); den += (xs[i] - mx) ** 2; }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  const fitted = xs.map((x) => intercept + slope * x);
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) forecast.push(intercept + slope * (n - 1 + h));
  return { fitted, forecast };
}

function nextMonthKey(key: string, step: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + step, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function forecastMeasure(
  rows: Row[],
  dateCol: string,
  measure: string,
  horizon = 6,
): ForecastResult | null {
  const history = timeSeries(rows, dateCol, measure, "month");
  if (history.length < 3) return null;
  const values = history.map((h) => h.value);

  // holdout last 20% for MAPE
  const holdoutSize = Math.max(1, Math.min(3, Math.floor(values.length * 0.2)));
  const train = values.slice(0, values.length - holdoutSize);
  const test = values.slice(values.length - holdoutSize);
  let method: ForecastResult["method"] = "holt-winters";
  let holdout: number[];
  if (train.length >= 3) {
    holdout = holt(train, holdoutSize).forecast;
  } else {
    method = "linear";
    holdout = linearForecast(train.length ? train : values, holdoutSize).forecast;
  }
  const errs = test.map((v, i) => (v === 0 ? 0 : Math.abs((holdout[i] - v) / v)));
  const mape = mean(errs) * 100;

  const { fitted, forecast } = method === "holt-winters"
    ? holt(values, horizon)
    : linearForecast(values, horizon);

  const residuals = values.map((v, i) => v - (fitted[i] ?? v));
  const sigma = stddev(residuals);
  const band = Math.max(sigma * 1.96, mean(values) * 0.05);

  const points: ForecastPoint[] = history.map((h, i) => ({
    key: h.key,
    actual: h.value,
    forecast: fitted[i] ?? null,
    upper: null,
    lower: null,
  }));
  for (let h = 1; h <= horizon; h++) {
    const key = nextMonthKey(history.at(-1)!.key, h);
    const f = forecast[h - 1];
    points.push({
      key,
      actual: null,
      forecast: f,
      upper: f + band * Math.sqrt(h),
      lower: f - band * Math.sqrt(h),
    });
  }

  const first = values[0] || 1;
  const last = forecast.at(-1) ?? values.at(-1) ?? 0;
  const trendPct = ((last - first) / Math.abs(first)) * 100;
  const confidence = Math.max(40, Math.min(99, Math.round(100 - mape - Math.min(20, sigma / (Math.abs(mean(values)) + 1) * 40))));

  const direction = trendPct >= 0 ? "grow" : "decline";
  const explanation =
    `Using ${method === "holt-winters" ? "Holt exponential smoothing" : "linear regression"} on ${values.length} ${dateCol} periods, ` +
    `${measure} is projected to ${direction} by ${trendPct.toFixed(1)}% over the next ${horizon} months. ` +
    `Backtest MAPE ${mape.toFixed(1)}%.`;

  return { measure, dateCol, history, points, horizon, method, confidence, trendPct, mape, explanation };
}

export function autoForecasts(dataset: Dataset, horizon = 6, max = 4): ForecastResult[] {
  const { numeric, dates } = pickColumns(dataset.columns);
  const dateCol = dates[0]?.name;
  if (!dateCol) return [];
  const priority = ["revenue", "sales", "amount", "profit", "orders", "units", "customers", "cost", "value"];
  const scored = numeric
    .map((c) => ({ c, score: priority.findIndex((p) => c.name.toLowerCase().includes(p)) }))
    .sort((a, b) => (a.score === -1 ? 999 : a.score) - (b.score === -1 ? 999 : b.score));
  const out: ForecastResult[] = [];
  for (const { c } of scored) {
    const f = forecastMeasure(dataset.rows, dateCol, c.name, horizon);
    if (f) out.push(f);
    if (out.length >= max) break;
  }
  return out;
}
