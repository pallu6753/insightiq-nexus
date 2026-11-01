import type { Dataset } from "@/lib/datasets/types";
import { autoKpis, aggregate, pickColumns, timeSeries, formatKpi } from "@/lib/datasets/aggregate";
import { autoForecasts, type ForecastResult } from "@/lib/analytics/forecast";
import { generateAlerts, type Alert } from "@/lib/analytics/alerts";

export type ReportType = "executive" | "board" | "kpi" | "operational";

export interface ReportSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { columns: string[]; rows: (string | number)[][] };
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  datasetId: string;
  datasetName: string;
  generatedAt: number;
  sections: ReportSection[];
  favorite?: boolean;
}

const TYPE_LABELS: Record<ReportType, string> = {
  executive: "Executive Report",
  board: "Board Report",
  kpi: "KPI Report",
  operational: "Operational Report",
};

export function reportTypeLabel(t: ReportType) {
  return TYPE_LABELS[t];
}

function pct(v: number) {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

export function buildReport(dataset: Dataset, type: ReportType, name?: string): Report {
  const kpis = autoKpis(dataset);
  const { numeric, dates, categorical } = pickColumns(dataset.columns);
  const dateCol = dates[0]?.name ?? null;
  const measure = numeric[0]?.name ?? null;
  const forecasts: ForecastResult[] = autoForecasts(dataset, 6, 3);
  const alerts: Alert[] = generateAlerts(dataset).slice(0, 8);

  const sections: ReportSection[] = [];

  sections.push({
    heading: "Executive Summary",
    paragraphs: [
      `${TYPE_LABELS[type]} generated from ${dataset.name} covering ${dataset.rowCount.toLocaleString()} records across ${dataset.columnCount} columns. Overall data quality score ${dataset.qualityScore}/100.`,
      forecasts[0]
        ? `${forecasts[0].measure} is projected to ${forecasts[0].trendPct >= 0 ? "grow" : "decline"} by ${pct(forecasts[0].trendPct)} over the next ${forecasts[0].horizon} months with ${forecasts[0].confidence}% model confidence.`
        : `No time-series signal detected — consider adding a date column for forecasting.`,
    ],
  });

  sections.push({
    heading: "Key Metrics",
    table: {
      columns: ["Metric", "Value"],
      rows: kpis.map((k) => [k.label, formatKpi(k.value, k.format)]),
    },
  });

  if (dateCol && measure) {
    const series = timeSeries(dataset.rows, dateCol, measure, "month");
    if (series.length) {
      const first = series[0].value;
      const last = series.at(-1)!.value;
      const delta = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;
      sections.push({
        heading: `${measure} Trend`,
        paragraphs: [
          `Over ${series.length} periods, ${measure} moved from ${formatKpi(first, "number")} to ${formatKpi(last, "number")} (${pct(delta)}).`,
        ],
        table: {
          columns: [dateCol, measure],
          rows: series.slice(-12).map((s) => [s.key, Number(s.value.toFixed(2))]),
        },
      });
    }
  }

  if (categorical[0] && measure) {
    const cat = categorical[0].name;
    const top = aggregate(dataset.rows, cat, measure, "sum").slice(0, 10);
    if (top.length) {
      sections.push({
        heading: `Top ${cat} by ${measure}`,
        table: {
          columns: [cat, measure],
          rows: top.map((t) => [t.key, Number(t.value.toFixed(2))]),
        },
      });
    }
  }

  if (forecasts.length) {
    sections.push({
      heading: "Forecast Outlook",
      bullets: forecasts.map((f) => f.explanation),
      table: {
        columns: ["Measure", "Method", "Horizon", "Trend", "Confidence", "MAPE"],
        rows: forecasts.map((f) => [
          f.measure,
          f.method,
          `${f.horizon}m`,
          pct(f.trendPct),
          `${f.confidence}%`,
          `${f.mape.toFixed(1)}%`,
        ]),
      },
    });
  }

  if (alerts.length) {
    sections.push({
      heading: "Alerts & Data Quality",
      table: {
        columns: ["Severity", "Title", "Detail", "Source"],
        rows: alerts.map((a) => [a.severity.toUpperCase(), a.title, a.detail, a.source]),
      },
    });
  } else {
    sections.push({
      heading: "Alerts & Data Quality",
      paragraphs: ["No critical alerts detected. Dataset passes quality checks."],
    });
  }

  sections.push({
    heading: "Recommended Next Steps",
    bullets: [
      forecasts[0] ? `Monitor ${forecasts[0].measure} weekly against the projected ${pct(forecasts[0].trendPct)} trajectory.` : `Add a date column to unlock forecasting.`,
      alerts[0] ? `Investigate: ${alerts[0].title}.` : `Maintain current data hygiene standards.`,
      `Share this report with stakeholders using PDF or Excel export.`,
    ],
  });

  return {
    id: crypto.randomUUID(),
    name: name?.trim() || `${TYPE_LABELS[type]} — ${dataset.name}`,
    type,
    datasetId: dataset.id,
    datasetName: dataset.name,
    generatedAt: Date.now(),
    sections,
  };
}
