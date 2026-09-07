"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import { CartSheet } from "./cart-sheet";
import { SearchDialog } from "./search-dialog";
import { LanguageSelect } from "./language-select";
import { getCurrentUser, logout } from "@/lib/services/auth";
import { User } from "@/lib/types";
import {
  SearchIcon,
  UserIcon,
  ShoppingBagIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  SlidersHorizontalIcon,
  GlobeIcon,
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
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 relative">
          {/* Left: Search Trigger */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 -ml-2 text-gray-800 hover:text-black transition-colors cursor-pointer"
              aria-label={t("header.search_aria", "Search products")}
            >
              <SearchIcon className="size-5" />
            </button>
          </div>

          {/* Center: Brand Logo centered perfectly */}
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
            {/* Visual Language Select */}
            <LanguageSelect variant="header" />

            {/* User Account Icon / Dropdown */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1.5 flex items-center gap-1.5 text-gray-800 hover:text-black transition-colors cursor-pointer"
                  aria-label="User Account Menu"
                >
                  <UserIcon className="size-5" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.name} {user.last_name || ""}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-gray-50 transition-colors"
                      >
                        <SlidersHorizontalIcon className="size-3.5 text-gray-500" />
                        {t("nav.profile", "My Profile & Orders")}
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboardIcon className="size-3.5" />
                          {t("nav.dashboard", "Admin Dashboard")}
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium cursor-pointer"
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
                className="p-1.5 text-gray-800 hover:text-black transition-colors"
                aria-label="User Account"
              >
                <UserIcon className="size-5" />
              </Link>
            )}

            {/* Shopping Bag Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 text-gray-800 hover:text-black transition-colors cursor-pointer"
              aria-label="Shopping Bag"
            >
              <ShoppingBagIcon className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white font-mono">
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