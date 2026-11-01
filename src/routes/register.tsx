import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Start your free trial"
      subtitle="14 days free. No credit card required."
      footer={
        <span className="text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Account created — check your email");
          navigate({ to: "/verify-email" });
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="first">First name</Label>
            <Input id="first" placeholder="Ada" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last">Last name</Label>
            <Input id="last" placeholder="Lovelace" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Acme, Inc." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Password</Label>
          <div className="relative">
            <Input id="pw" type={show ? "text" : "password"} required />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-1 pt-1 text-xs text-muted-foreground">
            {["8+ characters", "One number", "One symbol", "Mixed case"].map((r) => (
              <li key={r} className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-success" /> {r}
              </li>
            ))}
          </ul>
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
          <Checkbox className="mt-0.5" /> I agree to the{" "}
          <a className="text-primary hover:underline" href="#">
            Terms
          </a>{" "}
          and{" "}
          <a className="text-primary hover:underline" href="#">
            Privacy Policy
          </a>
          .
        </label>
        <Button type="submit" className="w-full gradient-primary border-0 shadow-elegant">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
