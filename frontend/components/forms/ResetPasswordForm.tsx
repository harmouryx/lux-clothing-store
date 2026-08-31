"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient, fetchCsrfToken } from "@/lib/api";
import { toast } from "sonner";
import { Loader2Icon, CheckCircle2Icon } from "lucide-react";

/**
 * ResetPasswordForm component.
 * Dispatches password recovery link requests via Laravel Fortify (/forgot-password).
 */
export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Password reset request handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your registered email address");
      return;
    }

    setLoading(true);
    try {
      await fetchCsrfToken();
      await apiClient.post("/forgot-password", { email: trimmedEmail });
      setSubmitted(true);
      toast.success("Password reset instructions dispatched to your email");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to send reset link. Please verify the email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center space-y-6">
      {/* Header title and description */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
          Enter your details to reset your credentials
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-sm rounded-3xl border border-gray-300/80 bg-white p-7 shadow-xs">
        {submitted ? (
          <div className="text-center space-y-3 py-2">
            <CheckCircle2Icon className="size-8 text-[#7A1C24] mx-auto" />
            <p className="text-xs text-slate-700">
              A recovery link has been sent to{" "}
              <span className="font-semibold text-black">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email-reset"
                className="text-xs font-semibold text-slate-800"
              >
                Email:
              </label>
              <input
                id="email-reset"
                type="email"
                autoComplete="email"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400"
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
            className="w-full h-11 rounded-lg bg-[#7A1C24] hover:bg-[#66161D] text-white text-xs font-medium flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Continue"
            )}
          </button>
        </div>
      )}

      {/* Footer navigation links */}
      <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
        <Link href="/login" className="hover:underline">
          Log In
        </Link>
        <span>|</span>
        <Link href="/signup" className="hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}