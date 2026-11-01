import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";

export function DemoBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="relative flex items-center gap-3 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs sm:px-6">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md gradient-primary text-white">
        <Sparkles className="h-3 w-3" />
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className="font-semibold text-foreground">Demo Workspace · Sample data loaded.</span>{" "}
        <span className="text-muted-foreground">
          Everything is fully interactive. Create an account to save your work, invite your team, and enable cloud sync.
        </span>
      </span>
      <Link
        to="/register"
        className="hidden shrink-0 rounded-md gradient-primary px-3 py-1 font-medium text-white shadow-elegant sm:inline-block"
      >
        Create account
      </Link>
      <button
        onClick={() => setOpen(false)}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background/60 hover:text-foreground"
        aria-label="Dismiss demo banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
