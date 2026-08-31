"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { User, Order } from "@/lib/types";
import {
  getCurrentUser,
  logout,
  updateProfileInformation,
  enableTwoFactor,
  disableTwoFactor,
  getTwoFactorQrCode,
  getTwoFactorSecretKey,
  getTwoFactorRecoveryCodes,
  confirmTwoFactor,
  confirmPassword,
} from "@/lib/services/auth";
import { getOrders } from "@/lib/services/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  Loader2Icon,
  QrCodeIcon,
  KeyIcon,
  LogOutIcon,
  LockIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // 2FA Management State
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [isEnablingStep, setIsEnablingStep] = useState(false);

  // Fortify Password Confirmation Modal State
  const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  const loadUserData = async () => {
    try {
      const [data, ordersData] = await Promise.all([
        getCurrentUser(),
        getOrders().catch(() => []),
      ]);
      if (data) {
        setUser(data);
        setName(data.name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setIs2faEnabled(!!data.two_factor_confirmed_at);
        setRealOrders(ordersData);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email address");
      return;
    }

    setSaving(true);
    try {
      await updateProfileInformation({
        name: name.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      toast.success("Profile details updated successfully");
      loadUserData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile details");
    } finally {
      setSaving(false);
    }
  };

  const start2faSetup = async () => {
    const [qrData, keyData] = await Promise.all([
      getTwoFactorQrCode().catch(() => ({ svg: "" })),
      getTwoFactorSecretKey().catch(() => ({ secretKey: "" })),
    ]);
    setQrSvg(qrData.svg);
    setSecretKey(keyData.secretKey);
    setIsEnablingStep(true);
    toast.info("Scan the QR code with your authenticator app");
  };

  const handleEnable2Fa = async () => {
    setTwoFaLoading(true);
    try {
      await enableTwoFactor();
      await start2faSetup();
    } catch (error: any) {
      if (error.response?.status === 423 || error.response?.data?.message?.includes("password")) {
        // Password confirmation required by Fortify
        setIsPasswordConfirmOpen(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to start 2FA setup");
      }
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirmPasswordFor2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPasswordInput) {
      toast.error("Please enter your current password");
      return;
    }

    setTwoFaLoading(true);
    try {
      await confirmPassword(confirmPasswordInput);
      setIsPasswordConfirmOpen(false);
      setConfirmPasswordInput("");
      await enableTwoFactor();
      await start2faSetup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Incorrect password. Please try again.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirm2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCode || confirmCode.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setTwoFaLoading(true);
    try {
      await confirmTwoFactor(confirmCode);
      const codes = await getTwoFactorRecoveryCodes().catch(() => []);
      setRecoveryCodes(codes);
      setIs2faEnabled(true);
      setIsEnablingStep(false);
      toast.success("2FA is now active on your account!");
      loadUserData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2Fa = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;

    setTwoFaLoading(true);
    try {
      await disableTwoFactor();
      setIs2faEnabled(false);
      setIsEnablingStep(false);
      setQrSvg(null);
      setSecretKey(null);
      toast.success("2FA disabled successfully");
      loadUserData();
    } catch (error: any) {
      if (error.response?.status === 423) {
        setIsPasswordConfirmOpen(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to disable 2FA");
      }
    } finally {
      setTwoFaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2Icon className="size-8 animate-spin text-[#7A1C24]" />
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin =
    user?.roles &&
    Array.isArray(user.roles) &&
    user.roles.some((r: string | { name?: string }) =>
      typeof r === "string" ? r.toLowerCase() === "admin" : r.name?.toLowerCase() === "admin"
    );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-10 space-y-10">
        {/* Header Title with User Greeting & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
                My Profile & Orders
              </h1>
              <Badge variant="secondary" className="font-mono text-xs capitalize">
                {isAdmin ? "Admin Account" : "Client Account"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Manage your personal information, order history, and 2FA security settings
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button asChild size="sm" className="bg-[#7A1C24] hover:bg-[#66161D] text-white">
                <a href="/dashboard">Admin Dashboard</a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs gap-1.5 border-gray-300"
            >
              <LogOutIcon className="size-3.5" /> Sign Out
            </Button>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Account Details & 2FA Management */}
          <div className="space-y-6 lg:col-span-5">
            {/* User Personal Information Container */}
            <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <UserIcon className="size-4" /> Personal Information
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-800">First Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-slate-900 shadow-2xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-800">Last Name</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-slate-300 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-slate-900 shadow-2xs"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    {saving && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* 2FA Security Management Container */}
            <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheckIcon className="size-4" /> Two-Factor Authentication
                </h3>
                <Badge
                  variant={is2faEnabled ? "secondary" : "outline"}
                  className="font-mono text-[10px]"
                >
                  {is2faEnabled ? "ENABLED" : "DISABLED"}
                </Badge>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Add an extra layer of security using Google Authenticator or Authy TOTP passcodes
              </p>

              {!is2faEnabled && !isEnablingStep && (
                <Button
                  onClick={handleEnable2Fa}
                  disabled={twoFaLoading}
                  className="w-full bg-slate-900 hover:bg-black text-white text-xs"
                >
                  {twoFaLoading ? (
                    <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                  ) : (
                    <QrCodeIcon className="size-3.5 mr-1.5" />
                  )}
                  Enable 2FA Security
                </Button>
              )}

              {/* 2FA Setup Step: Display QR & Verification Input */}
              {isEnablingStep && (
                <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in-50">
                  {qrSvg ? (
                    <div
                      className="size-44 mx-auto p-2 bg-white rounded-xl border border-gray-200 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  ) : (
                    <div className="text-center text-xs text-gray-400">Loading QR Code...</div>
                  )}

                  {secretKey && (
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-gray-500 font-medium">Secret Key:</span>
                      <p className="font-mono text-xs font-bold text-slate-800 select-all bg-gray-100 py-1 px-2 rounded">
                        {secretKey}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleConfirm2Fa} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800">
                        Enter 6-Digit Authenticator Passcode:
                      </label>
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                        className="bg-white border border-slate-300 text-slate-900 text-center font-mono text-sm tracking-widest font-bold focus:ring-1 focus:ring-slate-900 shadow-2xs"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-1/2 text-xs border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold"
                        onClick={() => setIsEnablingStep(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={twoFaLoading}
                        size="sm"
                        className="w-1/2 bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        {twoFaLoading && <Loader2Icon className="size-3.5 animate-spin mr-1" />}
                        Confirm 2FA
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {is2faEnabled && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={handleDisable2Fa}
                    disabled={twoFaLoading}
                    className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {twoFaLoading ? (
                      <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                    ) : (
                      "Disable Two-Factor Authentication"
                    )}
                  </Button>
                </div>
              )}

              {recoveryCodes.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5 text-xs">
                    <KeyIcon className="size-3.5" /> Emergency Recovery Codes
                  </div>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[10px] bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    {recoveryCodes.map((code, idx) => (
                      <div key={idx} className="select-all text-slate-800">{code}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBagIcon className="size-4" /> My Orders ({realOrders.length})
                </h3>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <Table className="w-full border-collapse">
                  <TableHeader className="bg-gray-50 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-28 px-4 py-3 text-left font-semibold text-xs text-gray-500">Order ID</TableHead>
                      <TableHead className="w-36 px-4 py-3 text-left font-semibold text-xs text-gray-500">Total Amount</TableHead>
                      <TableHead className="w-28 px-4 py-3 text-left font-semibold text-xs text-gray-500">Status</TableHead>
                      <TableHead className="w-32 px-4 py-3 text-right font-semibold text-xs text-gray-500">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {realOrders.length > 0 ? (
                      realOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">
                            ORD-{order.id}
                          </TableCell>
                          <TableCell className="px-4 py-3 font-mono font-bold text-xs text-slate-900">
                            ${Number(order.total_amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {(() => {
                              const s = (order.status || "").toLowerCase();
                              if (s === "paid") {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                    PAID
                                  </span>
                                );
                              }
                              if (s === "shipped") {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                                    SHIPPED
                                  </span>
                                );
                              }
                              if (s === "cancelled") {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                                    CANCELLED
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-100/80 text-amber-900 border border-amber-300 font-bold shadow-2xs">
                                  PENDING
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right font-mono text-xs text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={4} className="h-28 text-center text-xs text-slate-500 bg-white">
                          No order history found for your account.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fortify Password Confirmation Dialog */}
      <Dialog open={isPasswordConfirmOpen} onOpenChange={setIsPasswordConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-white border border-slate-200">
          <DialogHeader className="space-y-2 text-center">
            <div className="size-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center mx-auto">
              <LockIcon className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Confirm Current Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              For your security, please confirm your current password to proceed with 2FA setup.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmPasswordFor2Fa} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Current Password *</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                className="bg-white text-slate-900 border-slate-300 text-xs font-medium focus:ring-1 focus:ring-slate-900"
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPasswordConfirmOpen(false);
                  setConfirmPasswordInput("");
                }}
                className="w-1/2 text-xs border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={twoFaLoading}
                className="w-1/2 bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
              >
                {twoFaLoading && <Loader2Icon className="size-3.5 animate-spin mr-1" />}
                Confirm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
