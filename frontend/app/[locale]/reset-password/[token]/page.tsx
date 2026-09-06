"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { apiClient, fetchCsrfToken } from "@/lib/api";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

interface ResetTokenPageProps {
  params: Promise<{ token: string }>;
}

export default function ResetTokenPage({ params }: ResetTokenPageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password || !passwordConfirmation) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await fetchCsrfToken();
      await apiClient.post("/reset-password", {
        token,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password has been reset successfully! Please log in.");
      router.push("/login");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to reset password. Please verify your token and email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Enter your email and new password to finalize account recovery
            </p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-gray-300/80 bg-white p-7 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">Email:</label>
                <input
                  type="email"
                  placeholder="e.g. user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">New Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">Confirm Password:</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-[#7A1C24] hover:bg-[#66161D] text-white text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
                >
                  {loading ? <Loader2Icon className="size-4 animate-spin" /> : "Reset Password"}
                </button>
              </div>
            </form>
          </div>

          <div className="text-[11px] text-slate-700 font-medium">
            <Link href="/login" className="hover:underline">
              Back to Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
