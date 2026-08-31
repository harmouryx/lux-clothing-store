"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/services/auth";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/**
 * RegisterForm component.
 * Collects name, last_name, email, password, and password_confirmation
 * for Fortify registration (/register).
 */
export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedLastName || !trimmedEmail || !password || !passwordConfirmation) {
      toast.error("Please fill in all required registration fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: trimmedName,
        last_name: trimmedLastName,
        email: trimmedEmail,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Account created successfully");
      router.push("/profile");
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.errors?.password?.[0] ||
        "Registration failed. Please try again.";

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
          Create an Account
        </h1>
        <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
          Enter your personal credentials to shop everything you need
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-sm rounded-3xl border border-gray-300/80 bg-white p-7 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name field */}
          <div className="space-y-1">
            <label htmlFor="name-reg" className="text-xs font-semibold text-slate-800">
              First Name:
            </label>
            <input
              id="name-reg"
              type="text"
              placeholder="e.g. Jane"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Last Name field */}
          <div className="space-y-1">
            <label htmlFor="lastname-reg" className="text-xs font-semibold text-slate-800">
              Last Name:
            </label>
            <input
              id="lastname-reg"
              type="text"
              placeholder="e.g. Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label htmlFor="email-reg" className="text-xs font-semibold text-slate-800">
              Email:
            </label>
            <input
              id="email-reg"
              type="email"
              autoComplete="email"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label htmlFor="password-reg" className="text-xs font-semibold text-slate-800">
              Password:
            </label>
            <div className="relative">
              <input
                id="password-reg"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-slate-900 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1">
            <label htmlFor="password-confirm-reg" className="text-xs font-semibold text-slate-800">
              Confirm Password:
            </label>
            <div className="relative">
              <input
                id="password-confirm-reg"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-slate-900 transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
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
        <Link href="/login" className="hover:underline">
          Log In
        </Link>
        <span>|</span>
        <Link href="/reset-password" className="hover:underline">
          Reset Password
        </Link>
      </div>
    </div>
  );
}