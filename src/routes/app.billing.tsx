import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Download } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

const invoices = [
  { id: "INV-2025-0006", date: "Jun 1, 2025", amount: "$249.00", status: "Paid" },
  { id: "INV-2025-0005", date: "May 1, 2025", amount: "$249.00", status: "Paid" },
  { id: "INV-2025-0004", date: "Apr 1, 2025", amount: "$249.00", status: "Paid" },
  { id: "INV-2025-0003", date: "Mar 1, 2025", amount: "$249.00", status: "Paid" },
];

const plans = [
  { name: "Starter", price: "$49", features: ["5 users", "10 sources"], cta: "Downgrade" },
  { name: "Business", price: "$249", features: ["Unlimited users", "AI Copilot"], current: true, cta: "Current plan" },
  { name: "Enterprise", price: "Custom", features: ["SSO + SCIM", "24/7 SLA"], cta: "Contact sales" },
];

function BillingPage() {
  return (
    <>
      <AppHeader title="Billing" subtitle="Manage your plan, payment, and invoices" />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border glass-strong p-5 lg:col-span-2">
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Current plan</Badge>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-2xl font-bold">Business — $249/mo</div>
                <div className="text-sm text-muted-foreground">Renews on July 1, 2025</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="gradient-primary border-0">Upgrade to Enterprise</Button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Users", "18 / Unlimited"],
                ["Data sources", "12 / Unlimited"],
                ["API requests", "284K / 1M"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
                  <div className="mt-1 text-lg font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border glass p-5">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">Payment method</div>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-background/40 p-4">
              <div className="text-sm font-medium">Visa •••• 4242</div>
              <div className="text-xs text-muted-foreground">Expires 04/27</div>
            </div>
            <Button variant="outline" className="mt-3 w-full">Update card</Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Plans
          </h2>
          <div className="grid gap-3 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-5 ${
                  p.current ? "border-primary/40 glass-strong shadow-elegant" : "border-border glass"
                }`}
              >
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-1 text-2xl font-bold">{p.price}</div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-4 w-full ${p.current ? "gradient-primary border-0" : ""}`}
                  variant={p.current ? "default" : "outline"}
                  disabled={p.current}
                >
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border glass">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="text-sm font-semibold">Invoices</div>
            <Button size="sm" variant="outline">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download all
            </Button>
          </div>
          <div className="divide-y divide-border">
            {invoices.map((i) => (
              <div key={i.id} className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <div className="font-mono text-sm">{i.id}</div>
                <div className="hidden text-sm text-muted-foreground sm:block">{i.date}</div>
                <div className="hidden text-sm sm:block">{i.amount}</div>
                <Badge className="hidden bg-success/15 text-success hover:bg-success/15 sm:inline-flex">{i.status}</Badge>
                <Button size="icon" variant="ghost" className="h-8 w-8 justify-self-end">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
