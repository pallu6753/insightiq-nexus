import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  return (
    <AuthShell title="Set a new password" subtitle="Make it strong. Make it memorable.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Password updated");
          navigate({ to: "/login" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" required />
        </div>
        <Button type="submit" className="w-full gradient-primary border-0 shadow-elegant">
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
