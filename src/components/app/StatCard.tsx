import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "success" | "violet" | "warning";
}) {
  const up = delta >= 0;
  const accentClass: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
    violet: "bg-violet/15 text-violet",
    warning: "bg-warning/15 text-warning",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border glass p-5 transition hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${accentClass[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta)}%
        </div>
      </div>
      <div className="mt-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
      </div>
    </div>
  );
}
