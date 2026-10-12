"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient, fetchCsrfToken } from "@/lib/api";
import { toast } from "sonner";
import { Loader2Icon, CheckCircle2Icon } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

/**
 * ResetPasswordForm component.
 * Dispatches password recovery link requests via Laravel Fortify (/forgot-password).
 */
export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  // Password reset request handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error(t("auth.reset_enter_email", "Please enter your registered email address"));
      return;
    }

    setLoading(true);
    try {
      await fetchCsrfToken();
      await apiClient.post("/forgot-password", { email: trimmedEmail });
      setSubmitted(true);
      toast.success(t("auth.reset_instructions_sent", "Password reset instructions dispatched to your email"));
    } catch (err: any) {
      const msg =
        err.response?.data?.message || t("auth.reset_link_failed", "Failed to send reset link. Please verify the email.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center space-y-6">
      {/* Header title and description */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {t("auth.reset_title", "Reset Your Password")}
        </h1>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {t("auth.reset_desc", "Enter your details to reset your credentials")}
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-xs">
        {submitted ? (
          <div className="text-center space-y-3 py-2">
            <CheckCircle2Icon className="size-8 text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">
              {t("auth.recovery_link_sent", "A recovery link has been sent to")}{" "}
              <span className="font-semibold text-foreground">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email-reset"
                className="text-xs font-semibold text-foreground"
              >
                {t("auth.email", "Email:")}
              </label>
              <input
                id="email-reset"
                type="email"
                autoComplete="email"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-muted/50 text-xs text-foreground border border-border focus:outline-hidden focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                required
              />
            </div>
          </form>
        )}
      </div>

      {/* Action button */}
      {!submitted && (
        <div className="w-full max-w-sm">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              t("auth.continue", "Continue")
            )}
          </button>
        </div>
      )}

      {/* Footer navigation links */}
      <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
        <Link href="/login" className="hover:text-foreground hover:underline transition-colors">
          {t("auth.login_link", "Log In")}
        </Link>
        <span>|</span>
        <Link href="/signup" className="hover:text-foreground hover:underline transition-colors">
          {t("auth.sign_up_link", "Sign Up")}
        </Link>
      </div>
    </div>
  );
}