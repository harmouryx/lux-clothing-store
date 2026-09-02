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
  GlobeIcon,
} from "lucide-react";
import { logout } from "@/lib/services/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";

const NAV_MAIN = [
  {
    title: "Overview",
    titleES: "Resumen",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Products & Stock",
    titleES: "Productos & Stock",
    url: "/dashboard/products",
    icon: PackageIcon,
  },
  {
    title: "Orders",
    titleES: "Ordenes",
    url: "/dashboard/orders",
    icon: ShoppingBagIcon,
  },
  {
    title: "Users",
    titleES: "Usuarios",
    url: "/dashboard/users",
    icon: UsersIcon,
  },
  {
    title: "Payment Methods",
    titleES: "Metodos de Pago",
    url: "/dashboard/payment-methods",
    icon: CreditCardIcon,
  },
  {
    title: "Taxes",
    titleES: "Impuestos",
    url: "/dashboard/taxes",
    icon: ReceiptIcon,
  },
  {
    title: "Storefront View",
    titleES: "Ver Tienda",
    url: "/",
    icon: StoreIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(lang === "ES" ? "Sesion cerrada correctamente" : "Signed out successfully");
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
                    {lang === "ES" ? "Panel Admin" : "Admin Workspace"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{lang === "ES" ? "Gestion" : "Management"}</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_MAIN.map((item) => {
              const isActive = pathname === item.url;
              const label = lang === "ES" ? item.titleES : item.title;
              return (
                <SidebarMenuItem key={item.title}>
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
          {/* Language Toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setLang(lang === "ES" ? "EN" : "ES")}
              tooltip={lang === "ES" ? "Switch to English" : "Cambiar a Español"}
            >
              <GlobeIcon />
              <span>{lang === "ES" ? "Idioma: Español" : "Language: English"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={lang === "ES" ? "Configuracion de Perfil" : "Profile Settings"}>
              <Link href="/dashboard/profile">
                <UserIcon />
                <span>{lang === "ES" ? "Configuracion de Perfil" : "Profile Settings"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={lang === "ES" ? "Cerrar Sesion" : "Sign Out"}
              className="text-destructive hover:text-destructive"
            >
              <LogOutIcon />
              <span>{lang === "ES" ? "Cerrar Sesion" : "Sign Out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
