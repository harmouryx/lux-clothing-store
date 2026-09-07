"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircleIcon, ChevronRightIcon } from "lucide-react";
import { toast } from "sonner";
import { LanguageSelect } from "./language-select";

export default function Footer() {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const { t, tArray } = useLanguage();

  const faqItems = tArray<{ q: string; a: string }>("footer.faq_items", []);

  return (
    <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-8 text-slate-800">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 items-start">
          {/* Logo column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block transition-opacity hover:opacity-85">
              <Image
                src="/lux_assets/lux_logo_1.png"
                alt="LUX Logo"
                width={80}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              {t("footer.desc", "Contemporary luxury fashion, curated archive garments, and timeless designer collections.")}
            </p>

            {/* Language Switcher */}
            <div className="pt-2 flex items-center gap-2">
              <LanguageSelect variant="footer" />
            </div>
          </div>

          {/* Products column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              {t("footer.products", "PRODUCTS")}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  {t("catalog.apparel", "Apparel & Streetwear")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  {t("catalog.archive", "Archive Collection")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  {t("catalog.all", "Shop All Catalog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              {t("footer.support", "SUPPORT")}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <button
                  type="button"
                  onClick={() => setIsFaqOpen(true)}
                  className="hover:text-black transition-colors cursor-pointer text-left flex items-center gap-1 font-medium text-slate-900"
                >
                  <HelpCircleIcon className="size-3.5 text-gray-500" />
                  {t("footer.faq", "Frequently Asked Questions (FAQ)")}
                </button>
              </li>
              <li>
                <Link href="/profile" className="hover:text-black transition-colors">
                  {t("footer.my_orders", "My Orders & 2FA")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-black transition-colors">
                  {t("footer.terms", "Terms of Service")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors">
                  {t("footer.privacy", "Privacy Policy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              {t("footer.company", "COMPANY")}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <span className="text-gray-700 font-medium">LUX Store Inc.</span>
              </li>
              <li>
                <span className="text-gray-500">Quito, Ecuador</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom legal line */}
        <div className="mt-16 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 LUX Store. {t("footer.rights", "All rights reserved.")}</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-black transition-colors">
              {t("footer.terms", "Terms")}
            </Link>
            <Link href="/privacy" className="hover:text-black transition-colors">
              {t("footer.privacy", "Privacy")}
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Dialog Modal */}
      <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6 bg-white border border-slate-200">
          <DialogHeader className="space-y-1">
            <div className="size-9 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center mb-1">
              <HelpCircleIcon className="size-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {t("footer.faq_title", "Frequently Asked Questions")}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t("footer.faq_desc", "Everything you need to know about our luxury collections, shipping and security")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
            {faqItems.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                <div className="flex items-start gap-2">
                  <ChevronRightIcon className="size-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <h4 className="text-xs font-bold text-slate-900">{item.q}</h4>
                </div>
                <p className="text-xs text-slate-600 pl-5 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsFaqOpen(false)}
              className="bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
            >
              {t("footer.close_faq", "Got it")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}