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
  UsersIcon,
  LogOutIcon,
} from "lucide-react";
import { logout } from "@/lib/services/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelect } from "@/components/luxcomp/language-select";

const NAV_MAIN = [
  {
    key: "overview",
    defaultTitle: "Overview",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    key: "products",
    defaultTitle: "Products & Stock",
    url: "/dashboard/products",
    icon: PackageIcon,
  },
  {
    key: "orders",
    defaultTitle: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBagIcon,
  },
  {
    key: "users",
    defaultTitle: "Users",
    url: "/dashboard/users",
    icon: UsersIcon,
  },
  {
    key: "payment_methods",
    defaultTitle: "Payment Methods",
    url: "/dashboard/payment-methods",
    icon: CreditCardIcon,
  },
  {
    key: "taxes",
    defaultTitle: "Taxes",
    url: "/dashboard/taxes",
    icon: ReceiptIcon,
  },
  {
    key: "storefront",
    defaultTitle: "Storefront View",
    url: "/",
    icon: StoreIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("nav_main.signed_out", "Signed out successfully"));
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
                  <span className="truncate text-xs text-muted-foreground">
                    {t("nav_main.admin_workspace", "Admin Workspace")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav_main.management", "Management")}</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_MAIN.map((item) => {
              const isActive = pathname === item.url;
              const label = t(`nav_main.${item.key}`, item.defaultTitle);
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{label}</span>
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
          {/* Language Selector */}
          <SidebarMenuItem className="px-2 py-1">
            <LanguageSelect variant="sidebar" />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("nav_main.profile_settings", "Profile Settings")}>
              <Link href="/dashboard/profile">
                <UserIcon />
                <span>{t("nav_main.profile_settings", "Profile Settings")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={t("nav_main.sign_out", "Sign Out")}
              className="text-destructive hover:text-destructive"
            >
              <LogOutIcon />
              <span>{t("nav_main.sign_out", "Sign Out")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
