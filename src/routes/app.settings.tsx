import { createFileRoute } from "@tanstack/react-router";
import { Bell, Building2, Copy, Key, Lock, Moon, Plug, Sun } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <AppHeader title="Settings" subtitle="Workspace, security, and integrations" />
      <main className="p-4 sm:p-6">
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card/40">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="org">Organization</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="mt-5">
            <Card title="Appearance" desc="Choose how InsightIQ looks for you.">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { name: "Dark", icon: Moon, active: true },
                  { name: "Light", icon: Sun, active: false },
                ].map((t) => (
                  <button
                    key={t.name}
                    className={`rounded-xl border p-4 text-left transition ${
                      t.active ? "border-primary bg-primary/5" : "border-border bg-background/40 hover:border-primary/40"
                    }`}
                  >
                    <t.icon className="h-5 w-5 text-primary" />
                    <div className="mt-2 text-sm font-medium">{t.name}</div>
                  </button>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-5 space-y-4">
            <Card title="Notifications" desc="Decide how you'd like to hear from us." icon={Bell}>
              {[
                "Email me weekly insights",
                "Email me critical alerts",
                "Slack notifications",
                "Mobile push notifications",
                "Product updates",
              ].map((n) => (
                <div key={n} className="flex items-center justify-between border-t border-border py-3 first:border-0">
                  <span className="text-sm">{n}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-5 space-y-4">
            <Card title="Security" desc="Protect your workspace and your data." icon={Lock}>
              <div className="space-y-3">
                {[
                  "Require SSO for all members",
                  "Enforce 2FA for admins",
                  "Session timeout after 30 days",
                  "IP allowlist",
                ].map((s) => (
                  <div key={s} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3">
                    <span className="text-sm">{s}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-5">
            <Card title="API Keys" desc="Programmatic access to InsightIQ." icon={Key}>
              <div className="space-y-2">
                {[
                  { name: "Production", key: "iq_live_••••••••f3a2", created: "Jan 2025" },
                  { name: "Staging", key: "iq_test_••••••••8b71", created: "Mar 2025" },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
                    <div>
                      <div className="text-sm font-medium">{k.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{k.key}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden text-xs text-muted-foreground sm:inline">{k.created}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="mt-2 gradient-primary border-0">Generate new key</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-5">
            <Card title="Integrations" desc="Connect InsightIQ to your stack." icon={Plug}>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Slack", "Salesforce", "HubSpot", "Zapier", "Notion", "PagerDuty"].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4">
                    <div className="text-sm font-medium">{i}</div>
                    <Badge variant="outline">Connect</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="org" className="mt-5">
            <Card title="Organization" desc="Your workspace details." icon={Building2}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Organization name</Label>
                  <Input defaultValue="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label>Workspace URL</Label>
                  <Input defaultValue="acme.insightiq.io" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Default timezone</Label>
                  <Input defaultValue="America / New York" />
                </div>
              </div>
              <Button className="mt-5 gradient-primary border-0">Save changes</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function Card({
  title,
  desc,
  children,
  icon: Icon,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border glass p-6">
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
