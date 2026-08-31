"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, getCurrentUser } from "@/lib/services/auth";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/**
 * AccessForm component.
 * Handles user authentication against Laravel Fortify / Sanctum.
 * Supports both full email (e.g. adminlux@example.com) and username handle (e.g. adminlux).
 * Automatically handles 2FA challenge and routes based on Spatie roles:
 * - Admin users -> /dashboard
 * - Regular clients -> /profile
 */
export default function AccessForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier || !password) {
      toast.error("Please provide your email address or username and password");
      return;
    }

    // Support both username handle and full email address
    const emailToSubmit = trimmedIdentifier.includes("@")
      ? trimmedIdentifier
      : `${trimmedIdentifier}@example.com`;

    setLoading(true);
    try {
      // 1. Dispatch authentication request to Fortify (/login)
      const loginRes = await login({
        email: emailToSubmit,
        password: password,
      });

      // 2. Handle Two-Factor Authentication challenge if enforced
      if (loginRes?.two_factor) {
        toast.info("Two-factor authentication required");
        router.push("/2fa");
        return;
      }

      // 3. Extract user information and Spatie roles from response or user query
      const user = loginRes?.user || (await getCurrentUser());
      const isAdmin =
        user?.roles &&
        Array.isArray(user.roles) &&
        user.roles.some((r: string | { name?: string }) =>
          typeof r === "string"
            ? r.toLowerCase() === "admin"
            : r.name?.toLowerCase() === "admin"
        );

      toast.success("Signed in successfully");

      // 4. Role-based redirect
      if (isAdmin) {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }
      router.refresh();
    } catch (error) {
      const err = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            two_factor?: boolean;
            errors?: { email?: string[] };
          };
        };
      };

      // Handle Fortify 2FA redirect status (HTTP 423)
      if (err.response?.status === 423 || err.response?.data?.two_factor) {
        router.push("/2fa");
        return;
      }

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Invalid credentials or connection error";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center space-y-6">
      {/* Header title and description */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Log In
        </h1>
        <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-sm rounded-3xl border border-gray-300/80 bg-white p-7 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-input"
              className="text-xs font-semibold text-slate-800"
            >
              Email or Username:
            </label>
            <input
              id="user-input"
              type="text"
              autoComplete="username"
              placeholder="e.g. adminlux or adminlux@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label
              htmlFor="password-input"
              className="text-xs font-semibold text-slate-800"
            >
              Password:
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              {loading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer navigation links */}
      <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
        <Link href="/signup" className="hover:underline">
          Sign up
        </Link>
        <span>|</span>
        <Link href="/reset-password" className="hover:underline">
          Reset Password
        </Link>
      </div>
    </div>
  );
}