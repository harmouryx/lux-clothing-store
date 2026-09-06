"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/lib/types";
import {
  getCurrentUser,
  enableTwoFactor,
  disableTwoFactor,
  getTwoFactorQrCode,
  getTwoFactorSecretKey,
  getTwoFactorRecoveryCodes,
  confirmTwoFactor,
  confirmPassword,
  updateProfileInformation,
} from "@/lib/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ShieldCheckIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  QrCodeIcon,
  Loader2Icon,
  KeyIcon,
} from "lucide-react";

function sanitizeSvg(svg: string | null): string {
  if (!svg) return "";
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
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

  // Password Confirmation Modal for Fortify
  const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  const loadProfile = async () => {
    const data = await getCurrentUser();
    if (data) {
      setUser(data);
      setName(data.name || "");
      setLastName(data.last_name || "");
      setEmail(data.email || "");
      setIs2faEnabled(!!data.two_factor_confirmed_at);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in required profile fields");
      return;
    }

    setSaving(true);
    try {
      await updateProfileInformation({
        name: name.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      toast.success("Profile preferences updated");
      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
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
        setIsPasswordConfirmOpen(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to initiate 2FA setup");
      }
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirmPasswordFor2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPasswordInput) {
      toast.error("Please enter your current administrative password");
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
      toast.error(error.response?.data?.message || "Incorrect password confirmation");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirm2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCode || confirmCode.length < 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setTwoFaLoading(true);
    try {
      await confirmTwoFactor(confirmCode);
      const codes = await getTwoFactorRecoveryCodes().catch(() => []);
      setRecoveryCodes(codes);
      setIs2faEnabled(true);
      setIsEnablingStep(false);
      toast.success("Two-Factor Authentication is now active on your account!");
      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid 2FA confirmation code");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2Fa = async () => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication?")) return;

    setTwoFaLoading(true);
    try {
      await disableTwoFactor();
      setIs2faEnabled(false);
      setIsEnablingStep(false);
      setQrSvg(null);
      setSecretKey(null);
      setRecoveryCodes([]);
      toast.success("Two-Factor Authentication has been disabled");
      loadProfile();
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

  const initials = `${(name[0] || "A")}${(lastName[0] || "D")}`.toUpperCase();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Account & Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, workspace access, and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Card Summary */}
        <Card className="border border-border shadow-xs bg-card md:col-span-1 flex flex-col items-center text-center p-6 space-y-4 rounded-2xl">
          <Avatar className="size-20 border border-border">
            <AvatarImage src={user?.profile_picture || ""} alt={name} />
            <AvatarFallback className="font-mono text-lg font-bold bg-muted text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">{name || "Administrator"} {lastName}</h3>
            <p className="text-xs text-muted-foreground">{email || "adminlux@example.com"}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center pt-2">
            <Badge variant="secondary" className="font-mono text-xs">
              Role: Admin
            </Badge>
            <Badge variant="outline" className="font-mono text-xs gap-1 border-primary/40 text-primary">
              <ShieldCheckIcon className="size-3 text-primary" /> Spatie Verified
            </Badge>
          </div>
        </Card>

        {/* Profile Form Details */}
        <Card className="border border-border shadow-xs bg-card md:col-span-2 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Personal Information</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Update your basic administrative user profile credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 bg-background border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Last Name</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-slate-900 hover:bg-black text-white text-xs font-semibold"
                >
                  {saving && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Two-Factor Authentication Management */}
      <Card className="border border-border shadow-xs bg-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <LockIcon className="size-4" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Add an extra layer of security to your admin account using time-based one-time passwords (TOTP)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">2FA Status</p>
                <Badge variant={is2faEnabled ? "secondary" : "outline"} className="font-mono text-xs">
                  {is2faEnabled ? "Enabled & Active" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {is2faEnabled
                  ? "Your admin account requires an authenticator passcode upon login"
                  : "Protect your administrative credentials with 2FA authorization challenge"}
              </p>
            </div>

            <div>
              {is2faEnabled ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisable2Fa}
                  disabled={twoFaLoading}
                  className="text-xs font-semibold"
                >
                  {twoFaLoading && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
                  Disable 2FA
                </Button>
              ) : !isEnablingStep ? (
                <Button
                  size="sm"
                  onClick={handleEnable2Fa}
                  disabled={twoFaLoading}
                  className="bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
                >
                  {twoFaLoading && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
                  Enable 2FA
                </Button>
              ) : null}
            </div>
          </div>

          {/* 2FA Setup Step (Scan QR & Enter Code) */}
          {isEnablingStep && (
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4 animate-in fade-in-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <QrCodeIcon className="size-4" /> Step 1: Scan Authenticator QR Code
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-border max-w-[200px] mx-auto">
                  {qrSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeSvg(qrSvg) }} className="size-36" />
                  ) : (
                    <div className="size-36 flex items-center justify-center text-xs text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-muted-foreground">
                    Scan this QR code using Google Authenticator, Authy, or 1Password. If you cannot scan, use the setup key below:
                  </p>
                  {secretKey && (
                    <div className="p-2 rounded bg-muted font-mono select-all text-foreground text-[11px] break-all border border-border">
                      {secretKey}
                    </div>
                  )}

                  <form onSubmit={handleConfirm2Fa} className="space-y-2 pt-2">
                    <label className="font-semibold block text-foreground">Step 2: Enter 6-digit code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                        className="font-mono text-center tracking-widest text-sm bg-background border-border text-foreground"
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={twoFaLoading}
                        className="bg-slate-900 hover:bg-black text-white shrink-0 text-xs font-semibold"
                      >
                        {twoFaLoading && <Loader2Icon className="size-3.5 animate-spin mr-1" />}
                        Confirm
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Recovery Codes Display */}
          {recoveryCodes.length > 0 && (
            <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <KeyIcon className="size-4" /> Save Your 2FA Emergency Recovery Codes
              </div>
              <p className="text-xs text-muted-foreground">
                Store these recovery codes in a secure password manager. They allow you to regain access if you lose your authenticator device:
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-background p-3 rounded-lg border border-border">
                {recoveryCodes.map((code, idx) => (
                  <div key={idx} className="select-all text-foreground font-semibold">{code}</div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between py-2 text-xs text-muted-foreground">
            <div>
              <p className="text-sm font-medium text-foreground">Stateful Session Auth</p>
              <p>Laravel Sanctum secure HTTP-only cookies are active</p>
            </div>
            <Badge variant="secondary">Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fortify Password Confirmation Modal */}
      <Dialog open={isPasswordConfirmOpen} onOpenChange={setIsPasswordConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">Confirm Administrative Password</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              For security reasons, please confirm your current admin password to proceed with 2FA configuration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmPasswordFor2Fa} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                className="bg-background border-border text-foreground text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordConfirmOpen(false)}
                className="text-xs border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={twoFaLoading}
                className="bg-slate-900 hover:bg-black text-white text-xs font-semibold"
              >
                {twoFaLoading && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
                Confirm Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
