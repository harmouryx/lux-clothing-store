"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/luxcomp/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StoreIcon, BellIcon, ShoppingBagIcon, ExternalLinkIcon } from "lucide-react";
import { getOrders } from "@/lib/services/orders";
import { Order } from "@/lib/types";

export function SiteHeader() {
  const pathname = usePathname();
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getOrders();
        if (Array.isArray(data)) {
          setOrders(data);
          const pending = data.filter((o) => (o.status || "").toLowerCase() === "pending");
          if (pending.length > 0) {
            setHasNewOrders(true);
          }
        }
      } catch {
        // Silently handle if unauthenticated
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (path: string) => {
    if (path.includes("/products")) return "Products & Inventory";
    if (path.includes("/orders")) return "Orders & Sales";
    if (path.includes("/taxes")) return "Taxes Management";
    if (path.includes("/payment-methods")) return "Payment Methods";
    if (path.includes("/profile")) return "Profile & Security";
    return "Dashboard Overview";
  };

  const pendingCount = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur-sm transition-all">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-sm font-semibold text-foreground">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* System Order Notifications Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative size-8 border-border text-foreground hover:bg-muted"
              title="System Notifications"
            >
              <BellIcon className="size-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
                  {pendingCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 bg-card border-border shadow-lg">
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5 text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <BellIcon className="size-3.5 text-amber-500" />
                <span>System Notifications</span>
              </span>
              {pendingCount > 0 ? (
                <Badge variant="secondary" className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
                  {pendingCount} Pending
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                  All Caught Up
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="max-h-60 overflow-y-auto space-y-1 py-1">
              {orders.length > 0 ? (
                orders.slice(0, 5).map((order) => {
                  const isPending = (order.status || "").toLowerCase() === "pending";
                  return (
                    <DropdownMenuItem
                      key={order.id}
                      asChild
                      className="cursor-pointer rounded-lg p-2.5 focus:bg-muted transition-colors"
                    >
                      <Link href="/dashboard/orders" className="flex items-start gap-2.5 w-full">
                        <div className={`mt-0.5 size-7 rounded-full flex items-center justify-center shrink-0 ${isPending ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          <ShoppingBagIcon className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground truncate">
                              Order #{order.id}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-foreground">
                              ${Number(order.total_amount || 0).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {order.shipping_info?.firstName || order.user?.name || "Customer"} · {order.status}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  No orders recorded yet
                </div>
              )}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-0">
              <Link
                href="/dashboard/orders"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>View All Orders</span>
                <ExternalLinkIcon className="size-3" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-border">
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
