import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Github, Mail, Sparkles } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your InsightIQ workspace"
      footer={
        <span className="text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </span>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Signed in (demo)");
          navigate({ to: "/app" });
        }}
      >
        <Button
          type="button"
          variant="outline"
          className="w-full glass border-primary/40 bg-primary/5"
          onClick={() => navigate({ to: "/app" })}
        >
          <Sparkles className="mr-2 h-4 w-4 text-primary" /> Continue as Guest (Demo Mode)
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="glass">
            <Mail className="mr-2 h-4 w-4" /> Google
          </Button>
          <Button type="button" variant="outline" className="glass">
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
        </div>
        <div className="relative my-2 text-center text-xs text-muted-foreground">
          <span className="relative z-10 bg-background px-2">or continue with email</span>
          <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pw">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="pw"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Checkbox /> Remember me for 30 days
        </label>
        <Button type="submit" className="w-full gradient-primary border-0 shadow-elegant">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
