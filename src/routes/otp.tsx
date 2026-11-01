import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/otp")({
  component: OtpPage,
});

function OtpPage() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Verify your identity"
      subtitle="Enter the 6-digit code from your authenticator app."
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Verified");
          navigate({ to: "/app" });
        }}
      >
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={value} onChange={setValue}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          type="submit"
          disabled={value.length < 6}
          className="w-full gradient-primary border-0 shadow-elegant"
        >
          Verify
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Didn't receive a code?{" "}
          <button type="button" className="text-primary hover:underline">
            Resend
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
