"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ReceiptIcon,
  StoreIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";
import { logout } from "@/lib/services/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const NAV_MAIN = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Products & Stock",
    url: "/dashboard/products",
    icon: PackageIcon,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBagIcon,
  },
  {
    title: "Payment Methods",
    url: "/dashboard/payment-methods",
    icon: CreditCardIcon,
  },
  {
    title: "Taxes",
    url: "/dashboard/taxes",
    icon: ReceiptIcon,
  },
  {
    title: "Storefront View",
    url: "/",
    icon: StoreIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="size-8 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                  <Image
                    src="/lux_assets/lux_logo_1.png"
                    alt="LUX Logo"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold font-mono">LUX STORE</span>
                  <span className="truncate text-xs text-muted-foreground">Admin Workspace</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_MAIN.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile Settings">
              <Link href="/dashboard/profile">
                <UserIcon />
                <span>Profile Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out" className="text-destructive hover:text-destructive">
              <LogOutIcon />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
