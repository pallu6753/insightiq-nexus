import type { Dataset } from "@/lib/datasets/types";

const SYSTEM_BASE = `You are InsightIQ Copilot, an expert enterprise data analyst embedded in a decision intelligence platform.

Rules:
- Answer with concise, executive-ready insight. Use markdown: short paragraphs, bold for key numbers, bullet lists for findings, and tables when comparing.
- When asked for SQL, produce standard ANSI SQL. When asked for Python, use pandas.
- Ground every claim in the dataset provided below. If the data does not support an answer, say so and suggest what data would be needed.
- Prefer concrete numbers, deltas, and percentages over generic advice.
- End longer answers with a short "Recommended next steps" list (max 3 items) when useful.`;

function formatColumns(dataset: Dataset): string {
  return dataset.columns
    .slice(0, 40)
    .map((c) => {
      const stats: string[] = [];
      if (c.type === "number" && typeof c.min === "number" && typeof c.max === "number") {
        stats.push(`min=${c.min}, max=${c.max}`);
        if (typeof c.mean === "number") stats.push(`mean=${c.mean.toFixed(2)}`);
      }
      if (c.type === "date" && c.min && c.max) stats.push(`range=${c.min}→${c.max}`);
      stats.push(`unique=${c.unique}`);
      if (c.nullCount) stats.push(`nulls=${c.nullCount}`);
      return `  - ${c.name} (${c.type})${stats.length ? ` — ${stats.join(", ")}` : ""}`;
    })
    .join("\n");
}

function formatSampleRows(dataset: Dataset, count = 5): string {
  const rows = dataset.rows.slice(0, count);
  if (!rows.length) return "(no rows)";
  return rows
    .map((r, i) => {
      const entries = dataset.columns
        .slice(0, 8)
        .map((c) => `${c.name}=${JSON.stringify(r[c.name])}`)
        .join(", ");
      return `  ${i + 1}. ${entries}`;
    })
    .join("\n");
}

export function buildSystemPrompt(dataset: Dataset | null): string {
  if (!dataset) {
    return `${SYSTEM_BASE}\n\nNo dataset is currently active. Ask the user to upload or select a dataset before running analysis.`;
  }
  return `${SYSTEM_BASE}

## Active dataset: ${dataset.name}
- Rows: ${dataset.rowCount.toLocaleString()}
- Columns: ${dataset.columnCount}
- Data quality score: ${dataset.qualityScore}/100

### Schema
${formatColumns(dataset)}

### Sample rows (first ${Math.min(5, dataset.rows.length)})
${formatSampleRows(dataset)}

When the user asks about "the data", "revenue", "customers", "sales", etc., interpret those against these columns.`;
}

export function suggestedPromptsFor(dataset: Dataset | null): string[] {
  if (!dataset) {
    return [
      "What can you help me with?",
      "Explain what InsightIQ can do",
      "How should I prepare data for analysis?",
      "What kinds of insights should executives look for?",
    ];
  }
  const numeric = dataset.columns.find((c) => c.type === "number");
  const date = dataset.columns.find((c) => c.type === "date");
  const cat = dataset.columns.find((c) => c.type === "string" && c.unique > 1 && c.unique < 50);
  const prompts: string[] = [];
  prompts.push(`Give me an executive summary of ${dataset.name}`);
  if (numeric && date) prompts.push(`How has ${numeric.name} trended over ${date.name}?`);
  if (numeric && cat) prompts.push(`Which ${cat.name} drives the most ${numeric.name}?`);
  if (numeric) prompts.push(`Find anomalies or outliers in ${numeric.name}`);
  prompts.push(`Suggest 3 KPIs I should track for this dataset`);
  return prompts.slice(0, 4);
}
