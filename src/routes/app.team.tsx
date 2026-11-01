import { createFileRoute } from "@tanstack/react-router";
import { Activity, MoreHorizontal, ShieldCheck, UserPlus } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { teamMembers } from "@/lib/mock-data";

export const Route = createFileRoute("/app/team")({
  component: TeamPage,
});

const activity = [
  { who: "Sarah Chen", what: "promoted Aiko Tanaka to Analyst", when: "2h ago" },
  { who: "Marcus Rivera", what: "invited tomas@insightiq.io", when: "yesterday" },
  { who: "Priya Natarajan", what: "shared Q3 report with Finance", when: "2d ago" },
];

function TeamPage() {
  return (
    <>
      <AppHeader title="Team" subtitle="Invite members, manage roles, audit activity" />
      <main className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-border glass-strong p-5">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">Invite teammates</div>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input placeholder="name@company.com" className="flex-1" />
              <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
                <option>Viewer</option>
                <option>Analyst</option>
                <option>Admin</option>
              </select>
              <Button className="gradient-primary border-0">Send invite</Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border glass">
            <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-3 border-b border-border bg-card/40 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground md:grid">
              <div>Member</div>
              <div>Role</div>
              <div>Status</div>
              <div />
            </div>
            {teamMembers.map((m) => (
              <div
                key={m.email}
                className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center md:gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-primary text-xs font-semibold text-white">
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                  </div>
                </div>
                <div className="text-sm">{m.role}</div>
                <div>
                  <Badge
                    className={
                      m.status === "Active"
                        ? "bg-success/15 text-success hover:bg-success/15"
                        : "bg-warning/15 text-warning hover:bg-warning/15"
                    }
                  >
                    {m.status}
                  </Badge>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 justify-self-end">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border glass p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <div className="text-sm font-semibold">Roles & permissions</div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {[
                ["Owner", "Full access"],
                ["Admin", "Manage team & billing"],
                ["Analyst", "Build reports & query"],
                ["Viewer", "Read-only dashboards"],
              ].map(([r, d]) => (
                <div key={r} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
                  <span className="font-medium">{r}</span>
                  <span className="text-xs text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border glass p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">Activity log</div>
            </div>
            <ul className="space-y-3 text-sm">
              {activity.map((a, i) => (
                <li key={i}>
                  <div><span className="font-medium">{a.who}</span> {a.what}</div>
                  <div className="text-xs text-muted-foreground">{a.when}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </>
  );
}
