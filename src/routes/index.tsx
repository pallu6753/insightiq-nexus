import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Database,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revenueTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InsightIQ — Turn Data into Intelligent Decisions" },
      {
        name: "description",
        content:
          "AI-powered analytics, forecasting, business intelligence, and intelligent recommendations from one unified enterprise platform.",
      },
    ],
  }),
  component: Landing,
});

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Documentation", href: "#docs" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const logos = ["Acme Corp", "Globex", "Initech", "Umbrella", "Soylent", "Hooli", "Vandelay"];

const features = [
  {
    icon: Bot,
    title: "AI Copilot",
    desc: "Ask questions in plain English. Get charts, insights, and recommendations in seconds.",
  },
  {
    icon: LineChart,
    title: "Predictive Forecasting",
    desc: "Revenue, demand, churn, and inventory forecasts with confidence intervals.",
  },
  {
    icon: Database,
    title: "Unified Data Layer",
    desc: "Connect Snowflake, Postgres, REST APIs, CSV, and Google Sheets in minutes.",
  },
  {
    icon: BarChart3,
    title: "Executive Dashboards",
    desc: "Beautiful, real-time KPIs tailored for finance, sales, ops, and marketing.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "SOC 2 Type II, SSO, SCIM, role-based access, and audit logs out of the box.",
  },
  {
    icon: Workflow,
    title: "Automated Workflows",
    desc: "Smart alerts, anomaly detection, and decision triggers that act for you.",
  },
];

const steps = [
  { n: "01", title: "Connect", desc: "Plug into your warehouse, databases, files, or APIs." },
  { n: "02", title: "Model", desc: "AI auto-detects metrics, dimensions, and relationships." },
  { n: "03", title: "Decide", desc: "Ask the Copilot, share insights, automate the next action." },
];

const benefits = [
  "Reduce time-to-insight by 84%",
  "Forecast accuracy up to 96%",
  "Replace 5+ legacy BI tools",
  "Deploy in days, not quarters",
  "Governed by default — SOC 2, HIPAA-ready",
  "Built for analyst and executive alike",
];

const testimonials = [
  {
    quote:
      "InsightIQ replaced our entire BI stack. Our finance team gets executive reports automatically every Monday — and the Copilot answers questions our analysts used to spend hours on.",
    name: "Elena Park",
    role: "VP Finance, Northwind",
  },
  {
    quote:
      "The forecasting accuracy is genuinely shocking. We caught a demand spike three weeks before it would have hit us, and our inventory team was ready.",
    name: "David Okafor",
    role: "Head of Ops, Helix Logistics",
  },
  {
    quote:
      "Snowflake → InsightIQ → boardroom in one afternoon. The Copilot is the closest thing I've seen to a real analytics teammate.",
    name: "Mira Holcomb",
    role: "Chief Data Officer, Aldrich Group",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "$49",
    blurb: "For small teams getting started with modern BI.",
    features: ["5 users", "10 data sources", "Daily refresh", "Email support"],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Business",
    price: "$249",
    blurb: "Everything growing companies need to scale insight.",
    features: [
      "Unlimited users",
      "Unlimited sources",
      "Hourly refresh",
      "AI Copilot included",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "Governance, security, and scale for the Fortune 1000.",
    features: ["SSO + SCIM", "Audit logs", "Dedicated cluster", "24/7 SLA", "Solutions engineer"],
    cta: "Book demo",
    highlight: false,
  },
];

const faqs = [
  {
    q: "How long does it take to deploy InsightIQ?",
    a: "Most teams are live within a day. Enterprise rollouts with SSO and governance complete in under two weeks.",
  },
  {
    q: "Where does my data live?",
    a: "InsightIQ queries your warehouse directly. Your data never leaves your perimeter unless you choose to mirror it.",
  },
  {
    q: "Is my data used to train AI models?",
    a: "Never. The Copilot uses isolated, customer-scoped context. Nothing is used for model training.",
  },
  {
    q: "Do you offer on-prem or VPC deployment?",
    a: "Yes — Enterprise customers can deploy in their own AWS, Azure, or GCP environment.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="glass hidden sm:inline-flex">
              <Link to="/app">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> Explore demo
              </Link>
            </Button>
            <Button asChild size="sm" className="gradient-primary border-0 shadow-elegant">
              <Link to="/register">
                Start free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute inset-x-0 -top-32 -z-0 h-[500px] bg-[radial-gradient(ellipse_at_top,theme(colors.indigo.500/0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="mr-1.5 h-3 w-3" /> New · AI Copilot 2.0 is here
            </Badge>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Turn data into{" "}
              <span className="gradient-text">intelligent decisions.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              AI-powered analytics, forecasting, business intelligence, and intelligent
              recommendations — from one unified enterprise platform.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gradient-primary border-0 shadow-elegant">
                <Link to="/register">
                  Start free <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass border-primary/40 bg-primary/5">
                <Link to="/app">
                  <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> Explore interactive demo
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a href="#contact">Book enterprise demo</a>
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              No sign-up required · Sample datasets pre-loaded · Full product access
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> 14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-success" /> SOC 2 Type II
              </span>
            </div>
          </div>

          {/* Hero product preview */}
          <div className="relative mx-auto mt-16 max-w-6xl">
            <div className="absolute -inset-1 rounded-3xl gradient-primary opacity-30 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border glass-strong p-2 shadow-elegant">
              <div className="rounded-2xl bg-card/80 p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Revenue trend
                    </div>
                    <div className="text-2xl font-semibold">$1.24M ARR</div>
                  </div>
                  <Badge className="bg-success/15 text-success hover:bg-success/15">
                    <TrendingUp className="mr-1 h-3 w-3" /> +24.6%
                  </Badge>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer>
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        fill="url(#heroFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by data teams at category-defining companies
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {logos.map((l) => (
              <span key={l} className="text-base font-semibold tracking-tight text-muted-foreground">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Platform</Badge>
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            One platform. <span className="gradient-text">Every decision.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            From raw data to executive recommendations — InsightIQ unifies the entire decision
            intelligence lifecycle.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-border glass p-6 transition hover:shadow-elegant"
            >
              <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl gradient-primary text-white shadow-glow transition group-hover:scale-105">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="solutions" className="bg-card/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">How it works</Badge>
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              From data to decision in three steps.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border glass p-7">
                <div className="text-sm font-mono text-primary">{s.n}</div>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-4">Benefits</Badge>
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Built for the way modern enterprises actually work.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Replace fragmented BI tools with a single, AI-native platform that scales from analyst
              to boardroom.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl gradient-primary opacity-20 blur-2xl" />
            <div className="relative grid gap-4 rounded-3xl border border-border glass-strong p-6">
              <div className="flex items-center justify-between rounded-xl bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-success/15 text-success">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Time-to-insight</div>
                    <div className="text-xs text-muted-foreground">Avg across customers</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-success">-84%</div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                    <LineChart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Forecast accuracy</div>
                    <div className="text-xs text-muted-foreground">90-day window</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">96%</div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Sources connected</div>
                    <div className="text-xs text-muted-foreground">Per customer avg</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">38</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Loved by data leaders</Badge>
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              The new standard for decision intelligence.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex h-full flex-col justify-between rounded-2xl border border-border glass p-7"
              >
                <blockquote className="text-sm leading-relaxed text-foreground/90">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-sm font-semibold text-white">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Scale to enterprise. No surprise charges.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 ${
                p.highlight
                  ? "border-primary/40 glass-strong shadow-elegant"
                  : "border-border glass"
              }`}
            >
              {p.highlight && (
                <Badge className="absolute -top-3 left-6 gradient-primary border-0 text-white">
                  Most popular
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                {p.price !== "Custom" && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>
              <Button
                asChild
                className={`mt-6 w-full ${p.highlight ? "gradient-primary border-0" : ""}`}
                variant={p.highlight ? "default" : "outline"}
              >
                <Link to="/register">{p.cta}</Link>
              </Button>
              <ul className="mt-7 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card/30 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Questions, answered.
            </h2>
          </div>
          <div className="mt-12 divide-y divide-border rounded-2xl border border-border glass">
            {faqs.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
                  {f.q}
                  <span className="text-primary transition group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border glass-strong p-12 text-center">
          <div className="absolute inset-0 gradient-mesh opacity-60" />
          <div className="relative">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to make smarter decisions?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Start your free trial today — or talk to our team about your enterprise rollout.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gradient-primary border-0 shadow-elegant">
                <Link to="/register">
                  Start free trial <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#contact">Book a demo</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              InsightIQ is the AI-powered decision intelligence platform for the modern enterprise.
            </p>
          </div>
          {[
            { title: "Product", items: ["Features", "Pricing", "AI Copilot", "Forecasting", "Integrations"] },
            { title: "Company", items: ["About", "Careers", "Blog", "Press", "Contact"] },
            { title: "Resources", items: ["Documentation", "Changelog", "Security", "Status", "Support"] },
          ].map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold">{c.title}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {c.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-foreground">{i}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
            <div>© {new Date().getFullYear()} InsightIQ, Inc. All rights reserved.</div>
            <div className="flex gap-5">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">SOC 2</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
