import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  FileSpreadsheet,
  FileUp,
  History,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseFile } from "@/lib/datasets/parse";
import { inferSchema, coerceRows, qualityScore } from "@/lib/datasets/profile";
import type { ColumnSchema, Row } from "@/lib/datasets/types";
import {
  buildDataset,
  deleteDataset,
  duplicateDataset,
  ensureSamplesSeeded,
  useDatasetMeta,
} from "@/lib/datasets/store";

export const Route = createFileRoute("/app/data-upload")({
  component: DataUploadPage,
});

interface Preview {
  fileName: string;
  fileSize: number;
  format: "csv" | "xlsx" | "json" | "tsv";
  rows: Row[];
  columns: ColumnSchema[];
  quality: number;
}

interface UploadTask {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "parsing" | "ready" | "error";
  error?: string;
}

function DataUploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [datasetName, setDatasetName] = useState("");

  const metas = useDatasetMeta((s) => s.metas);
  const setActive = useDatasetMeta((s) => s.setActive);
  const updateMeta = useDatasetMeta((s) => s.updateMeta);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    ensureSamplesSeeded();
    const list = Array.from(files);
    for (const file of list) {
      const taskId = crypto.randomUUID();
      setTasks((t) => [{ id: taskId, name: file.name, size: file.size, progress: 0, status: "parsing" }, ...t]);
      try {
        const { rows, format } = await parseFile(file, (pct) => {
          setTasks((t) => t.map((x) => (x.id === taskId ? { ...x, progress: pct } : x)));
        });
        const columns = inferSchema(rows);
        const coerced = coerceRows(rows, columns);
        const finalCols = inferSchema(coerced);
        const q = qualityScore(coerced, finalCols);
        setTasks((t) => t.map((x) => (x.id === taskId ? { ...x, progress: 100, status: "ready" } : x)));
        setPreview({
          fileName: file.name,
          fileSize: file.size,
          format,
          rows: coerced,
          columns: finalCols,
          quality: q,
        });
        setDatasetName(file.name.replace(/\.[^.]+$/, ""));
        toast.success(`${file.name} parsed`, { description: `${coerced.length.toLocaleString()} rows · ${finalCols.length} columns` });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse";
        setTasks((t) => t.map((x) => (x.id === taskId ? { ...x, status: "error", error: message } : x)));
        toast.error(`Could not parse ${file.name}`, { description: message });
      }
    }
  }, []);

  const importPreview = async () => {
    if (!preview) return;
    const name = datasetName.trim() || preview.fileName;
    try {
      const meta = await buildDataset(name, preview.rows, "upload", preview.format, preview.fileSize);
      toast.success("Dataset imported", { description: `${meta.rowCount.toLocaleString()} rows saved locally` });
      setPreview(null);
      setDatasetName("");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error("Import failed", { description: err instanceof Error ? err.message : "Unknown error" });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <AppHeader title="Data Upload" subtitle="Parse, profile, and import your datasets" />
      <main className="space-y-6 p-4 sm:p-6">
        <section
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${drag ? "border-primary bg-primary/5" : "border-border glass hover:border-primary/50"}`}
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
            <UploadCloud className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Drop files here, or browse</h3>
          <p className="mt-1 text-sm text-muted-foreground">CSV · TSV · XLSX · JSON — parsed and profiled in your browser</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".csv,.tsv,.json,.xlsx,.xls"
            hidden
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => inputRef.current?.click()} className="gradient-primary border-0">
              <FileUp className="mr-2 h-4 w-4" /> Select files
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await ensureSamplesSeeded();
                toast.success("Sample datasets loaded");
                navigate({ to: "/app" });
              }}
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> Load sample datasets
            </Button>
          </div>
        </section>

        {tasks.length > 0 && (
          <section className="rounded-2xl border border-border glass p-5">
            <div className="mb-3 text-sm font-semibold">Uploads</div>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(t.size / 1024 / 1024).toFixed(2)} MB · {t.status === "ready" ? "Ready to import" : t.status === "error" ? t.error : "Parsing…"}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setTasks((prev) => prev.filter((x) => x.id !== t.id))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Progress value={t.progress} className="mt-2 h-2" />
                </div>
              ))}
            </div>
          </section>
        )}

        {preview && (
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border glass p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Preview · {preview.fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    {preview.rows.length.toLocaleString()} rows · {preview.columns.length} columns
                  </div>
                </div>
                <Badge className="bg-success/15 text-success hover:bg-success/15">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Quality {preview.quality}%
                </Badge>
              </div>
              <div className="max-h-[380px] overflow-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card/95 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
                    <tr>
                      {preview.columns.map((c) => (
                        <th key={c.name} className="px-3 py-2 text-left">
                          <div className="font-semibold text-foreground">{c.name}</div>
                          <div className="text-[10px] font-normal text-muted-foreground">{c.type}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {preview.columns.map((c) => (
                          <td key={c.name} className="max-w-[220px] truncate px-3 py-2">
                            {r[c.name] == null ? <span className="text-muted-foreground/60">—</span> : String(r[c.name])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-border glass p-5">
              <div className="mb-3 text-sm font-semibold">Schema</div>
              <div className="space-y-2 max-h-[320px] overflow-auto">
                {preview.columns.map((c) => (
                  <div key={c.name} className="rounded-lg border border-border bg-background/40 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium">{c.name}</span>
                      <Badge variant="outline" className="text-[10px]">{c.type}</Badge>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {c.unique.toLocaleString()} unique · {c.nullCount} null
                      {c.type === "number" && c.min !== undefined && ` · min ${Number(c.min).toFixed(1)} / max ${Number(c.max).toFixed(1)}`}
                      {c.type === "date" && c.min !== undefined && ` · ${c.min} → ${c.max}`}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <input
                  className="h-9 w-full rounded-lg border border-border bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Dataset name"
                />
                <Button className="w-full gradient-primary border-0" onClick={importPreview}>
                  Import {preview.rows.length.toLocaleString()} rows
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setPreview(null)}>Cancel</Button>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border glass p-5">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Your datasets</div>
            <Badge variant="outline" className="ml-auto">{metas.length}</Badge>
          </div>
          {metas.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No datasets yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {metas.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    {m.source === "sample" ? <Sparkles className="h-4 w-4" /> : m.format === "xlsx" ? <FileSpreadsheet className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{m.name}</div>
                      <Badge variant="outline" className="text-[10px]">{m.format}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.rowCount.toLocaleString()} rows · {m.columnCount} cols · quality {m.qualityScore}% · {new Date(m.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setActive(m.id); toast.success(`Active: ${m.name}`); }}>Use</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const next = window.prompt("Rename dataset", m.name);
                        if (next && next.trim()) { updateMeta(m.id, { name: next.trim() }); toast.success("Renamed"); }
                      }}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => {
                        await duplicateDataset(m.id, `${m.name} (copy)`);
                        toast.success("Duplicated");
                      }}>
                        <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={async () => {
                          if (window.confirm(`Delete "${m.name}"?`)) {
                            await deleteDataset(m.id);
                            toast.success("Deleted");
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
