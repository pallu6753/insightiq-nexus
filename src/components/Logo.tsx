import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg gradient-primary shadow-glow">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className="text-lg">
        Insight<span className="gradient-text">IQ</span>
      </span>
    </Link>
  );
}
