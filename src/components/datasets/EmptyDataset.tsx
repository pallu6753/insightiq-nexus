import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function EmptyDataset({ hint }: { hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border glass p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <Database className="h-5 w-5" />
      </div>
      <div className="mt-3 text-sm font-semibold">No active dataset</div>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
        {hint ?? "Upload a CSV, XLSX, or JSON file — or pick a sample dataset — to populate this view."}
      </p>
      <Button asChild size="sm" className="mt-4 gradient-primary border-0">
        <Link to="/app/data-upload">Upload dataset</Link>
      </Button>
    </div>
  );
}

export function LoadingPanel({ label = "Loading dataset…" }: { label?: string }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border glass p-6">
      <div className="h-4 w-40 animate-pulse rounded bg-muted/60" />
      <div className="h-32 animate-pulse rounded bg-muted/40" />
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
