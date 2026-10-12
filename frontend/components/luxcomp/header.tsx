"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import { CartSheet } from "./cart-sheet";
import { SearchDialog } from "./search-dialog";
import DarkModeSelector from "@/components/luxcomp/dark-mode-selector";
import { getCurrentUser, logout } from "@/lib/services/auth";
import { User } from "@/lib/types";
import {
  SearchIcon,
  UserIcon,
  ShoppingBagIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { itemCount, setIsOpen: setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const activeUser = await getCurrentUser();
      setUser(activeUser);
    }
    loadUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch {
      setUser(null);
      router.push("/login");
    }
  };

  const isAdmin =
    user?.roles &&
    Array.isArray(user.roles) &&
    user.roles.some((r: string | { name?: string }) =>
      typeof r === "string" ? r.toLowerCase() === "admin" : r.name?.toLowerCase() === "admin"
    );

  return (
    <>
      <header className="w-full bg-background border-b  border-border sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 relative">
          {/* Left: Search Trigger */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 -ml-2 text-accent-foreground hover:text-accent transition-colors cursor-pointer"
              aria-label={t("header.search_aria", "Search products")}
            >
              <SearchIcon className="size-5" />
            </button>
          </div>

          {/* Center: Brand Logo centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-85">
              <Image
                src="/lux_assets/lux_logo_1.png"
                alt="LUX Logo"
                width={80}
                height={32}
                className="h-7 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right: Language toggle, User & Bag */}
          <div className="flex items-center gap-3 sm:gap-4">


            <DarkModeSelector />

            {/* User Account Icon / Dropdown */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1.5 flex items-center gap-1.5 text-accent-foreground hover:text-accent transition-colors cursor-pointer"
                  aria-label="User Account Menu"
                >
                  <UserIcon className="size-5" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground rounded-2xl shadow-xl border border-border py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-bold text-popover-foreground truncate">
                        {user.name} {user.last_name || ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <SlidersHorizontalIcon className="size-3.5 text-muted-foreground" />
                        {t("nav.profile", "My Profile & Orders")}
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <LayoutDashboardIcon className="size-3.5" />
                          {t("nav.dashboard", "Admin Dashboard")}
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors text-left font-medium cursor-pointer"
                      >
                        <LogOutIcon className="size-3.5" />
                        {t("nav.logout", "Sign Out")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="p-1.5 text-foreground hover:text-foreground/80 transition-colors"
                aria-label="User Account"
              >
                <UserIcon className="size-5" />
              </Link>
            )}

            {/* Shopping Bag Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
              aria-label="Shopping Bag"
            >
              <ShoppingBagIcon className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground font-mono">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <CartSheet />
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
