import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Copy, Download, FileBarChart, FileSpreadsheet, FileText, Image as ImageIcon, Pencil, Plus, Presentation, Search, Star, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyDataset, LoadingPanel } from "@/components/datasets/EmptyDataset";
import { useActiveDataset } from "@/lib/datasets/hooks";
import { buildReport, reportTypeLabel, type Report, type ReportType } from "@/lib/reports/build";
import { useReportsStore } from "@/lib/reports/store";
import {
  exportReportCsv,
  exportReportExcel,
  exportReportPdf,
  exportElementPng,
} from "@/lib/reports/export";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

const TEMPLATES: Array<{ type: ReportType; icon: React.ElementType; desc: string }> = [
  { type: "executive", icon: FileBarChart, desc: "C-suite KPI overview with forecasts" },
  { type: "board", icon: Presentation, desc: "Quarterly board-ready summary" },
  { type: "kpi", icon: FileText, desc: "Key metrics and trend detail" },
  { type: "operational", icon: FileSpreadsheet, desc: "Ops-focused deep dive" },
];

function ReportsPage() {
  const { dataset, loading } = useActiveDataset();
  const reports = useReportsStore((s) => s.reports);
  const addReport = useReportsStore((s) => s.addReport);
  const removeReport = useReportsStore((s) => s.removeReport);
  const renameReport = useReportsStore((s) => s.renameReport);
  const toggleFav = useReportsStore((s) => s.toggleFavorite);
  const duplicateReport = useReportsStore((s) => s.duplicateReport);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");
  const [onlyFav, setOnlyFav] = useState(false);
  const [preview, setPreview] = useState<Report | null>(null);
  const [renaming, setRenaming] = useState<Report | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleting, setDeleting] = useState<Report | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<ReportType>("executive");
  const previewRef = useRef<HTMLDivElement>(null);

  const generate = (type: ReportType, name?: string) => {
    if (!dataset) { toast.error("No active dataset"); return; }
    const r = buildReport(dataset, type, name);
    addReport(r);
    setPreview(r);
    toast.success(`${reportTypeLabel(type)} generated`);
  };

  const filtered = useMemo(() => {
    return reports
      .filter((r) => typeFilter === "all" || r.type === typeFilter)
      .filter((r) => !onlyFav || r.favorite)
      .filter((r) => !query || `${r.name} ${r.datasetName}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => Number(b.favorite ?? 0) - Number(a.favorite ?? 0) || b.generatedAt - a.generatedAt);
  }, [reports, typeFilter, onlyFav, query]);

  const downloadPng = async (r: Report) => {
    setPreview(r);
    await new Promise((res) => setTimeout(res, 250));
    if (!previewRef.current) return;
    try {
      await exportElementPng(previewRef.current, r.name);
      toast.success("PNG exported");
    } catch {
      toast.error("PNG export failed");
    }
  };

  return (
    <>
      <AppHeader title="Reports" subtitle={dataset ? `Generate branded reports from ${dataset.name}` : "Generate, schedule, and share branded reports"} />
      <main className="space-y-6 p-4 sm:p-6">
        {loading && <LoadingPanel />}
        {!loading && !dataset && <EmptyDataset />}
        {!loading && dataset && (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Templates</h2>
                <Dialog open={customOpen} onOpenChange={setCustomOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gradient-primary border-0">
                      <Plus className="mr-1.5 h-4 w-4" /> Custom report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Report name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
                      <Select value={customType} onValueChange={(v) => setCustomType(v as ReportType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TEMPLATES.map((t) => (
                            <SelectItem key={t.type} value={t.type}>{reportTypeLabel(t.type)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground">Report will be generated from your active dataset: <span className="font-medium text-foreground">{dataset.name}</span>.</div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCustomOpen(false)}>Cancel</Button>
                      <Button onClick={() => { generate(customType, customName); setCustomName(""); setCustomOpen(false); }}>Generate</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => generate(t.type)}
                    className="group rounded-2xl border border-border glass p-5 text-left transition hover:border-primary/40 hover:shadow-elegant"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-white shadow-glow">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3 text-sm font-semibold">{reportTypeLabel(t.type)}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                    <div className="mt-3 text-[11px] text-primary opacity-0 transition group-hover:opacity-100">Click to generate →</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border glass">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
                <div className="text-sm font-semibold">Saved reports · {reports.length}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-52 pl-9" />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {TEMPLATES.map((t) => (
                        <SelectItem key={t.type} value={t.type}>{reportTypeLabel(t.type)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant={onlyFav ? "default" : "outline"} onClick={() => setOnlyFav((v) => !v)}>
                    <Star className={`mr-1.5 h-3.5 w-3.5 ${onlyFav ? "fill-current" : ""}`} /> Favorites
                  </Button>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  {reports.length ? "No reports match your filters." : "No reports yet. Generate one from a template above."}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((r) => (
                    <div key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_auto]">
                      <div className="min-w-0">
                        <button className="truncate text-left text-sm font-medium hover:text-primary" onClick={() => setPreview(r)}>
                          {r.name}
                        </button>
                        <div className="text-xs text-muted-foreground">{r.datasetName} · {format(r.generatedAt, "PPp")}</div>
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex w-fit">{reportTypeLabel(r.type)}</Badge>
                      <div className="hidden text-xs text-muted-foreground sm:block">{r.sections.length} sections</div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => toggleFav(r.id)} title="Favorite">
                          <Star className={`h-4 w-4 ${r.favorite ? "fill-current text-warning" : ""}`} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setRenaming(r); setRenameValue(r.name); }} title="Rename">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { const id = duplicateReport(r.id); if (id) toast.success("Report duplicated"); }} title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { exportReportPdf(r); toast.success("PDF exported"); }} title="PDF">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { exportReportExcel(r); toast.success("Excel exported"); }} title="Excel">
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { exportReportCsv(r); toast.success("CSV exported"); }} title="CSV">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => downloadPng(r)} title="PNG">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleting(r)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { exportReportPdf(preview); toast.success("PDF exported"); }}><FileText className="mr-1.5 h-3.5 w-3.5" /> PDF</Button>
                <Button size="sm" variant="outline" onClick={() => { exportReportExcel(preview); toast.success("Excel exported"); }}><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Excel</Button>
                <Button size="sm" variant="outline" onClick={() => { exportReportCsv(preview); toast.success("CSV exported"); }}><Download className="mr-1.5 h-3.5 w-3.5" /> CSV</Button>
                <Button size="sm" variant="outline" onClick={() => downloadPng(preview)}><ImageIcon className="mr-1.5 h-3.5 w-3.5" /> PNG</Button>
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => window.print()}>Print</Button>
              </div>
              <div ref={previewRef} className="overflow-auto rounded-xl border border-border bg-background p-6">
                <h1 className="text-2xl font-bold">{preview.name}</h1>
                <p className="mt-1 text-xs text-muted-foreground">{preview.datasetName} · Generated {format(preview.generatedAt, "PPp")}</p>
                <div className="mt-6 space-y-6">
                  {preview.sections.map((s, i) => (
                    <div key={i}>
                      <h2 className="border-b border-border pb-1 text-lg font-semibold">{s.heading}</h2>
                      {s.paragraphs?.map((p, j) => <p key={j} className="mt-2 text-sm leading-relaxed">{p}</p>)}
                      {s.bullets && (
                        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
                          {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      )}
                      {s.table && (
                        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/50">
                              <tr>{s.table.columns.map((c) => <th key={c} className="px-3 py-2 text-left font-semibold">{c}</th>)}</tr>
                            </thead>
                            <tbody>
                              {s.table.rows.map((r, j) => (
                                <tr key={j} className="border-t border-border">
                                  {r.map((v, k) => <td key={k} className="px-3 py-2">{String(v)}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!renaming} onOpenChange={(v) => !v && setRenaming(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename report</DialogTitle></DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(null)}>Cancel</Button>
            <Button onClick={() => { if (renaming) { renameReport(renaming.id, renameValue); toast.success("Renamed"); } setRenaming(null); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete report?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{deleting?.name}". This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleting) { removeReport(deleting.id); toast.success("Report deleted"); } setDeleting(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
