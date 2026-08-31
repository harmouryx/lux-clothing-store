"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifyAdminRole() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          // If in dev or guest, allow viewing
          setAuthorized(true);
          setChecking(false);
          return;
        }

        const isAdmin =
          user?.roles &&
          Array.isArray(user.roles) &&
          user.roles.some((r) =>
            typeof r === "string" ? r.toLowerCase() === "admin" : r.name?.toLowerCase() === "admin"
          );

        if (!isAdmin) {
          toast.error("Access restricted: Redirecting to Client Profile");
          router.push("/profile");
          return;
        }

        setAuthorized(true);
      } catch {
        setAuthorized(true);
      } finally {
        setChecking(false);
      }
    }

    verifyAdminRole();
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
