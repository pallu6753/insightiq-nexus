import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toPng } from "html-to-image";
import type { Dataset } from "@/lib/datasets/types";
import type { Report } from "./build";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safe(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, "_").slice(0, 80);
}

export function exportDatasetCsv(dataset: Dataset) {
  const cols = dataset.columns.map((c) => c.name);
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of dataset.rows) lines.push(cols.map((c) => escape(r[c])).join(","));
  download(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${safe(dataset.name)}.csv`);
}

export function exportReportCsv(report: Report) {
  const lines: string[] = [];
  lines.push(`"${report.name}"`);
  lines.push(`"Generated: ${new Date(report.generatedAt).toISOString()}"`);
  lines.push("");
  for (const s of report.sections) {
    lines.push(`"${s.heading}"`);
    if (s.paragraphs) for (const p of s.paragraphs) lines.push(`"${p.replace(/"/g, '""')}"`);
    if (s.bullets) for (const b of s.bullets) lines.push(`"- ${b.replace(/"/g, '""')}"`);
    if (s.table) {
      lines.push(s.table.columns.map((c) => `"${c}"`).join(","));
      for (const r of s.table.rows) lines.push(r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    }
    lines.push("");
  }
  download(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${safe(report.name)}.csv`);
}

export function exportReportExcel(report: Report) {
  const wb = XLSX.utils.book_new();
  const summary = [
    ["Report", report.name],
    ["Type", report.type],
    ["Dataset", report.datasetName],
    ["Generated", new Date(report.generatedAt).toISOString()],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Overview");
  report.sections.forEach((s, i) => {
    const aoa: (string | number)[][] = [[s.heading]];
    if (s.paragraphs) for (const p of s.paragraphs) aoa.push([p]);
    if (s.bullets) for (const b of s.bullets) aoa.push([`• ${b}`]);
    if (s.table) {
      aoa.push([]);
      aoa.push(s.table.columns);
      for (const r of s.table.rows) aoa.push(r);
    }
    const sheetName = safe(s.heading).slice(0, 30) || `Section ${i + 1}`;
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), sheetName);
  });
  XLSX.writeFile(wb, `${safe(report.name)}.xlsx`);
}

export function exportDatasetExcel(dataset: Dataset) {
  const wb = XLSX.utils.book_new();
  const dataSheet = XLSX.utils.json_to_sheet(dataset.rows.slice(0, 100000));
  XLSX.utils.book_append_sheet(wb, dataSheet, "Data");
  const schemaAoa: (string | number)[][] = [["Column", "Type", "Nullable", "Unique", "Nulls"]];
  for (const c of dataset.columns) schemaAoa.push([c.name, c.type, c.nullable ? "yes" : "no", c.unique, c.nullCount]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(schemaAoa), "Schema");
  XLSX.writeFile(wb, `${safe(dataset.name)}.xlsx`);
}

export function exportReportPdf(report: Report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(report.name, margin, y);
  y += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`${report.datasetName} · Generated ${new Date(report.generatedAt).toLocaleString()}`, margin, y);
  y += 16;
  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;
  doc.setTextColor(20);

  for (const s of report.sections) {
    if (y > 720) { doc.addPage(); y = margin; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(s.heading, margin, y);
    y += 16;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (s.paragraphs) {
      for (const p of s.paragraphs) {
        const lines = doc.splitTextToSize(p, pageWidth - margin * 2);
        if (y + lines.length * 12 > 780) { doc.addPage(); y = margin; }
        doc.text(lines, margin, y);
        y += lines.length * 12 + 4;
      }
    }
    if (s.bullets) {
      for (const b of s.bullets) {
        const lines = doc.splitTextToSize(`• ${b}`, pageWidth - margin * 2);
        if (y + lines.length * 12 > 780) { doc.addPage(); y = margin; }
        doc.text(lines, margin, y);
        y += lines.length * 12 + 4;
      }
    }
    if (s.table) {
      autoTable(doc, {
        startY: y + 4,
        head: [s.table.columns],
        body: s.table.rows.map((r) => r.map((v) => String(v))),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 251] },
        margin: { left: margin, right: margin },
      });
      // @ts-expect-error jspdf-autotable augments doc
      y = doc.lastAutoTable.finalY + 16;
    } else {
      y += 8;
    }
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`InsightIQ · Page ${i} of ${pages}`, pageWidth - margin, 820, { align: "right" });
  }

  doc.save(`${safe(report.name)}.pdf`);
}

export async function exportElementPng(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
    cacheBust: true,
  });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  download(blob, `${safe(filename)}.png`);
}
