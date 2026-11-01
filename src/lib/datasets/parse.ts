import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Row } from "./types";

export interface ParseResult {
  rows: Row[];
  format: "csv" | "xlsx" | "json" | "tsv";
}

export async function parseFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<ParseResult> {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (ext === "csv" || ext === "tsv") {
    return parseDelimited(file, ext === "tsv" ? "\t" : ",", onProgress);
  }
  if (ext === "json") return parseJson(file, onProgress);
  if (ext === "xlsx" || ext === "xls") return parseXlsx(file, onProgress);
  throw new Error(`Unsupported file type: .${ext}`);
}

function parseDelimited(file: File, delimiter: string, onProgress?: (p: number) => void): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const rows: Row[] = [];
    Papa.parse<Row>(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      delimiter,
      worker: false,
      chunk: (results) => {
        rows.push(...results.data);
        if (onProgress && file.size) {
          const cursor = results.meta.cursor ?? 0;
          onProgress(Math.min(99, Math.round((cursor / file.size) * 100)));
        }
      },
      complete: () => {
        onProgress?.(100);
        resolve({ rows, format: delimiter === "\t" ? "tsv" : "csv" });
      },
      error: (err) => reject(err),
    });
  });
}

function parseJson(file: File, onProgress?: (p: number) => void): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 90));
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const rows: Row[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { data?: unknown }).data)
            ? ((data as { data: Row[] }).data)
            : [data as Row];
        onProgress?.(100);
        resolve({ rows, format: "json" });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function parseXlsx(file: File, onProgress?: (p: number) => void): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 60));
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: null, raw: true });
        onProgress?.(100);
        resolve({ rows, format: "xlsx" });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
