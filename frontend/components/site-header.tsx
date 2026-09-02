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
import { StoreIcon, BellIcon, ShoppingBagIcon, ExternalLinkIcon, CheckCheckIcon, GlobeIcon } from "lucide-react";
import { getOrders } from "@/lib/services/orders";
import { Order } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";

export function SiteHeader() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lux_read_order_notifications");
      if (stored) {
        setReadNotificationIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage error
    }

    async function loadNotifications() {
      try {
        const data = await getOrders();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch {
        // Silently handle
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = () => {
    const allIds = orders.map((o) => o.id);
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem("lux_read_order_notifications", JSON.stringify(allIds));
    } catch {
      // Ignore
    }
  };

  const markAsRead = (id: number) => {
    if (!readNotificationIds.includes(id)) {
      const updated = [...readNotificationIds, id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem("lux_read_order_notifications", JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  };

  const getPageTitle = (path: string) => {
    if (path.includes("/users")) return lang === "ES" ? "Usuarios Registrados" : "Registered Users";
    if (path.includes("/products")) return lang === "ES" ? "Productos e Inventario" : "Products & Inventory";
    if (path.includes("/orders")) return lang === "ES" ? "Ordenes y Ventas" : "Orders & Sales";
    if (path.includes("/taxes")) return lang === "ES" ? "Gestion de Impuestos" : "Taxes Management";
    if (path.includes("/payment-methods")) return lang === "ES" ? "Metodos de Pago" : "Payment Methods";
    if (path.includes("/profile")) return lang === "ES" ? "Perfil y Seguridad" : "Profile & Security";
    return lang === "ES" ? "Resumen del Panel" : "Dashboard Overview";
  };

  const pendingOrders = orders.filter((o) => (o.status || "").toLowerCase() === "pending");
  const unreadPendingCount = pendingOrders.filter((o) => !readNotificationIds.includes(o.id)).length;

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
        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs border-border font-mono font-bold"
          onClick={() => setLang(lang === "ES" ? "EN" : "ES")}
          title={lang === "ES" ? "Switch to English" : "Cambiar a Español"}
        >
          <GlobeIcon className="size-3.5" />
          {lang}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative size-8 border-border text-foreground hover:bg-muted"
              title="System Notifications"
            >
              <BellIcon className="size-4" />
              {unreadPendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
                  {unreadPendingCount}
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
              <div className="flex items-center gap-2">
                {unreadPendingCount > 0 ? (
                  <Badge variant="secondary" className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
                    {unreadPendingCount} New
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                    All Read
                  </Badge>
                )}
                {unreadPendingCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-normal"
                    title="Mark all as read"
                  >
                    <CheckCheckIcon className="size-3" />
                    <span>Read all</span>
                  </button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="max-h-60 overflow-y-auto space-y-1 py-1">
              {orders.length > 0 ? (
                orders.slice(0, 6).map((order) => {
                  const isPending = (order.status || "").toLowerCase() === "pending";
                  const isRead = readNotificationIds.includes(order.id);
                  return (
                    <DropdownMenuItem
                      key={order.id}
                      asChild
                      className="cursor-pointer rounded-lg p-2.5 focus:bg-muted transition-colors"
                      onClick={() => markAsRead(order.id)}
                    >
                      <Link
                        href="/dashboard/orders"
                        className={`flex items-start gap-2.5 w-full ${isRead ? "opacity-60" : "opacity-100"}`}
                      >
                        <div
                          className={`mt-0.5 size-7 rounded-full flex items-center justify-center shrink-0 ${
                            isPending ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
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
