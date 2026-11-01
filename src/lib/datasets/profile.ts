import type { ColumnSchema, ColumnType, Row } from "./types";

const DATE_RE = /^\d{4}-\d{1,2}-\d{1,2}([T\s]\d{1,2}:\d{2}(:\d{2})?)?$/;
const NUM_RE = /^-?\d+(\.\d+)?$/;

function detectType(values: unknown[]): ColumnType {
  let num = 0, date = 0, bool = 0, total = 0;
  for (const raw of values) {
    if (raw === null || raw === undefined || raw === "") continue;
    total++;
    if (typeof raw === "number" && Number.isFinite(raw)) { num++; continue; }
    if (typeof raw === "boolean") { bool++; continue; }
    const s = String(raw).trim();
    if (s === "true" || s === "false") { bool++; continue; }
    if (NUM_RE.test(s)) { num++; continue; }
    if (DATE_RE.test(s) || !Number.isNaN(Date.parse(s)) && /\d{4}/.test(s) && /[-/]/.test(s)) { date++; continue; }
  }
  if (!total) return "string";
  if (num / total > 0.85) return "number";
  if (date / total > 0.85) return "date";
  if (bool / total > 0.9) return "boolean";
  return "string";
}

export function coerce(value: unknown, type: ColumnType): unknown {
  if (value === null || value === undefined || value === "") return null;
  switch (type) {
    case "number": {
      const n = typeof value === "number" ? value : Number(String(value).replace(/[,$\s]/g, ""));
      return Number.isFinite(n) ? n : null;
    }
    case "boolean": {
      if (typeof value === "boolean") return value;
      const s = String(value).toLowerCase();
      return s === "true" || s === "1" || s === "yes";
    }
    case "date": {
      const t = Date.parse(String(value));
      return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
    }
    default:
      return String(value);
  }
}

export function inferSchema(rows: Row[], sampleSize = 500): ColumnSchema[] {
  if (!rows.length) return [];
  const cols = Array.from(
    rows.slice(0, 50).reduce<Set<string>>((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set()),
  );
  const sample = rows.slice(0, sampleSize);
  return cols.map((name) => {
    const values = sample.map((r) => r[name]);
    const type = detectType(values);
    const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
    const distinct = new Set(nonNull.map((v) => String(v)));
    const col: ColumnSchema = {
      name,
      type,
      nullable: nonNull.length < values.length,
      unique: distinct.size,
      nullCount: values.length - nonNull.length,
      sample: Array.from(distinct).slice(0, 5),
    };
    if (type === "number") {
      const nums = nonNull.map((v) => Number(v)).filter((n) => Number.isFinite(n));
      if (nums.length) {
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
        col.min = min; col.max = max; col.mean = mean; col.stddev = Math.sqrt(variance);
      }
    } else if (type === "date") {
      const dates = nonNull.map((v) => Date.parse(String(v))).filter((n) => Number.isFinite(n));
      if (dates.length) {
        col.min = new Date(Math.min(...dates)).toISOString().slice(0, 10);
        col.max = new Date(Math.max(...dates)).toISOString().slice(0, 10);
      }
    }
    return col;
  });
}

export function coerceRows(rows: Row[], schema: ColumnSchema[]): Row[] {
  return rows.map((r) => {
    const out: Row = {};
    for (const col of schema) out[col.name] = coerce(r[col.name], col.type);
    return out;
  });
}

export function qualityScore(rows: Row[], schema: ColumnSchema[]): number {
  if (!rows.length || !schema.length) return 0;
  const total = rows.length * schema.length;
  const nulls = schema.reduce((a, c) => a + c.nullCount, 0);
  const completeness = 1 - nulls / Math.max(total, 1);
  // duplicate rows in a small sample
  const seen = new Set<string>();
  let dupes = 0;
  for (const r of rows.slice(0, 2000)) {
    const key = schema.map((c) => String(r[c.name] ?? "")).join("|");
    if (seen.has(key)) dupes++;
    else seen.add(key);
  }
  const uniqueness = 1 - dupes / Math.min(rows.length, 2000);
  return Math.round((completeness * 0.7 + uniqueness * 0.3) * 100);
}

export function detectOutliers(values: number[]): { lower: number; upper: number; count: number } {
  if (values.length < 4) return { lower: 0, upper: 0, count: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
  const q1 = q(0.25), q3 = q(0.75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr, upper = q3 + 1.5 * iqr;
  const count = values.filter((v) => v < lower || v > upper).length;
  return { lower, upper, count };
}
