import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <AuthShell title="Check your inbox" subtitle="We've sent a verification link to your email.">
      <div className="rounded-2xl border border-border glass p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Click the link in the email to activate your InsightIQ account. The link expires in 24
          hours.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="gradient-primary border-0">
            <Link to="/otp">Enter code manually</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
