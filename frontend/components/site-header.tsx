"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/luxcomp/theme-toggle";
import { Button } from "@/components/ui/button";
import { StoreIcon } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.includes("/products")) return "Products & Inventory";
    if (path.includes("/orders")) return "Orders & Sales";
    if (path.includes("/profile")) return "Profile & Account";
    return "Dashboard Overview";
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur-sm transition-all">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-sm font-semibold text-foreground">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Link href="/" target="_blank">
            <StoreIcon className="size-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
