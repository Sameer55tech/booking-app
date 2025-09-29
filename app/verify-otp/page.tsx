"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { resendOTP, verifyOTP } from "@/lib/auth-actions";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function VerifyOTPPage() {
  return <VerifyOTP />;
}

function VerifyOTP() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "login";
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";

  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("type", type);
    if (firstName) formData.append("firstName", firstName);
    if (lastName) formData.append("lastName", lastName);

    const result = await resendOTP(formData);

    if (result.error) {
      setResendMessage("Failed to resend code. Please try again.");
    } else {
      setResendMessage("New code sent! Check your email.");
    }

    setIsResending(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await verifyOTP(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8">
        <div>
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="token" value={otp} />

          <div className="flex flex-col items-center space-y-2">
            <label htmlFor="otp-input" className="block text-sm font-medium">
              Verification Code
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              id="otp-input"
            >
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

          <button
            type="submit"
            disabled={otp.length !== 6}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Verify
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
          {resendMessage && (
            <p className="mt-2 text-sm text-gray-600">{resendMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
