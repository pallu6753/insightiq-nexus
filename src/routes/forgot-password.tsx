import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Forgot password?"
      subtitle="We'll email you a secure link to reset it."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Reset link sent");
          navigate({ to: "/reset-password" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required />
        </div>
        <Button type="submit" className="w-full gradient-primary border-0 shadow-elegant">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
