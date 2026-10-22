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

export default function Footer() {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const { t, tArray } = useLanguage();

  const faqItems = tArray<{ q: string; a: string }>("footer.faq_items", []);

  return (
    <footer className="w-full bg-background border-t border-border pt-16 pb-8 text-foreground">
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
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              {t("footer.desc", "Contemporary luxury fashion, curated archive garments, and timeless designer collections.")}
            </p>


          </div>

          {/* Products column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t("footer.products", "PRODUCTS")}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  {t("catalog.all", "Shop All Catalog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t("footer.support", "SUPPORT")}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => setIsFaqOpen(true)}
                  className="hover:text-foreground transition-colors cursor-pointer text-left flex items-center gap-1 font-medium text-foreground"
                >
                  <HelpCircleIcon className="size-3.5 text-muted-foreground" />
                  {t("footer.faq", "Frequently Asked Questions (FAQ)")}
                </button>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t("footer.terms", "Terms of Service")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {t("footer.privacy", "Privacy Policy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t("footer.company", "COMPANY")}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a href="http://instagram.com/condelux____" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"> @condelux____ </a>
              </li>
              <li>
                <a href="http://instagram.com/skytrayzx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"> @skytrayzx </a>
              </li>
              <li>
                <span className="text-muted-foreground">Quito, Ecuador</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom legal line */}
        <div className="mt-16 pt-6 border-t border-border flex flex-col sm:flex-row items-center text-[11px] text-muted-foreground">
          <p>© 2026 LUX Store. {t("footer.rights", "All rights reserved.")}</p>
        </div>
      </div>

      {/* FAQ Dialog Modal */}
      <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6 bg-card border border-border text-card-foreground shadow-2xl">
          <DialogHeader className="space-y-1">
            <div className="size-9 rounded-full bg-muted text-foreground flex items-center justify-center mb-1">
              <HelpCircleIcon className="size-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
              {t("footer.faq_title", "Frequently Asked Questions")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("footer.faq_desc", "Everything you need to know about our luxury collections, shipping and security")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
            {faqItems.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-1">
                <div className="flex items-start gap-2">
                  <ChevronRightIcon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <h4 className="text-xs font-bold text-foreground">{item.q}</h4>
                </div>
                <p className="text-xs text-muted-foreground pl-5 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsFaqOpen(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              {t("footer.close_faq", "Got it")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}