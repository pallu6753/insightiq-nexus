export type ColumnType = "number" | "string" | "date" | "boolean";

export interface ColumnSchema {
  name: string;
  type: ColumnType;
  nullable: boolean;
  unique: number; // distinct count
  nullCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  stddev?: number;
  sample: unknown[]; // first few non-null values
}

export interface DatasetMeta {
  id: string;
  name: string;
  source: "upload" | "sample";
  format: "csv" | "xlsx" | "json" | "tsv";
  createdAt: number;
  updatedAt: number;
  rowCount: number;
  columnCount: number;
  sizeBytes: number;
  columns: ColumnSchema[];
  qualityScore: number; // 0-100
}

export type Row = Record<string, unknown>;

export interface Dataset extends DatasetMeta {
  rows: Row[];
}
