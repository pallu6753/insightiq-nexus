import { useEffect } from "react";
import { Check, ChevronsUpDown, Database, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDatasetMeta, ensureSamplesSeeded } from "@/lib/datasets/store";
import { Link } from "@tanstack/react-router";

export function DatasetSwitcher() {
  const metas = useDatasetMeta((s) => s.metas);
  const activeId = useDatasetMeta((s) => s.activeId);
  const setActive = useDatasetMeta((s) => s.setActive);
  const active = metas.find((m) => m.id === activeId);

  useEffect(() => { ensureSamplesSeeded(); }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="glass max-w-[240px] gap-2">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{active?.name ?? "No dataset"}</span>
          {active && (
            <Badge variant="outline" className="ml-auto h-4 shrink-0 px-1 text-[10px]">
              {active.rowCount.toLocaleString()}
            </Badge>
          )}
          <ChevronsUpDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs">Active dataset</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {metas.length === 0 && (
          <div className="p-3 text-xs text-muted-foreground">
            No datasets yet. Upload one to get started.
          </div>
        )}
        {metas.map((m) => (
          <DropdownMenuItem key={m.id} onClick={() => setActive(m.id)} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${m.id === activeId ? "opacity-100 text-primary" : "opacity-0"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="truncate">{m.name}</span>
                {m.source === "sample" && <Sparkles className="h-3 w-3 shrink-0 text-primary" />}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {m.rowCount.toLocaleString()} rows · {m.columnCount} cols · quality {m.qualityScore}%
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/app/data-upload" className="text-primary">+ Upload dataset</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
