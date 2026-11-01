import { createFileRoute } from "@tanstack/react-router";
import { Camera, Clock, Lock, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

const history = [
  { what: "Signed in from San Francisco, CA", when: "2 hours ago" },
  { what: "Updated password", when: "3 days ago" },
  { what: "Enabled 2FA", when: "1 week ago" },
  { what: "Connected Snowflake source", when: "2 weeks ago" },
];

function ProfilePage() {
  return (
    <>
      <AppHeader title="Profile" subtitle="Personal information and security" />
      <main className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-border glass p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-primary text-2xl font-bold text-white shadow-glow">
                  SC
                </div>
                <button className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-border bg-card">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <div className="text-lg font-semibold">Sarah Chen</div>
                <div className="text-sm text-muted-foreground">Owner · Acme Corp</div>
                <Badge className="mt-2 bg-success/15 text-success hover:bg-success/15">
                  <ShieldCheck className="mr-1 h-3 w-3" /> 2FA enabled
                </Badge>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input defaultValue="Sarah" />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input defaultValue="Chen" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Email</Label>
                <Input type="email" defaultValue="sarah@insightiq.io" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input defaultValue="Chief Data Officer" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+1 (415) 555-0184" />
              </div>
            </div>
            <Button className="mt-6 gradient-primary border-0">Save changes</Button>
          </div>

          <div className="rounded-2xl border border-border glass p-6">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">Password & 2FA</div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Current password</Label>
                <Input type="password" defaultValue="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>New password</Label>
                <Input type="password" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-background/40 p-4">
              <div>
                <div className="text-sm font-medium">Two-factor authentication</div>
                <div className="text-xs text-muted-foreground">Authenticator app · last used 2 hr ago</div>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="mt-5 gradient-primary border-0">Update password</Button>
          </div>
        </section>

        <aside className="rounded-2xl border border-border glass p-5">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Activity history</div>
          </div>
          <ul className="space-y-3">
            {history.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <div>{h.what}</div>
                  <div className="text-xs text-muted-foreground">{h.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </>
  );
}
