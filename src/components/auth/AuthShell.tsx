import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 gradient-mesh opacity-90" />
        <div className="absolute inset-0 bg-background/40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md">
            <h2 className="text-balance text-4xl font-bold leading-tight">
              The decision intelligence platform for modern enterprises.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of data teams using InsightIQ to forecast, analyze, and act —
              powered by AI.
            </p>
            <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {["SC", "MR", "PN", "AT"].map((i) => (
                  <div
                    key={i}
                    className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-[10px] font-semibold text-white ring-2 ring-background"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span>Trusted by 12,000+ analysts worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
