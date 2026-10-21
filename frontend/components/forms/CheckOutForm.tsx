"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import {
  ShoppingBagIcon,
  ArrowRightIcon,
  MessageCircleIcon,
  ExternalLinkIcon,
  ShieldUser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CheckOutForm() {
  const { items, subtotal, itemCount } = useCart();
  const { t } = useLanguage();

  const shippingCost = subtotal > 150 ? 0 : 15;
  const estimatedTax = subtotal * 0.15;
  const totalAmount = subtotal + shippingCost + estimatedTax;

  // Instagram direct messaging URL for checkout
  const instagramCheckoutUrl = "https://ig.me/m/condelux____";

  const handleBuyClick = () => {
    window.open(instagramCheckoutUrl, "_blank", "noopener,noreferrer");
  };

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
          <ShoppingBagIcon className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t("cart.empty", "Your shopping bag is empty")}
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          {t("checkout.empty_desc", "You do not have any items in your cart to proceed with checkout. Explore our luxury collection to find your pieces.")}
        </p>
        <Button asChild className="rounded-xl font-semibold">
          <Link href="/products" className="flex items-center gap-2">
            <span>{t("cart.explore_products", "Explore Products")}</span>
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Articles Currently Being Bought */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingBagIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t("checkout.articles_in_order", "Articles in this order:")}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {t("checkout.articles_sub", "Review the selected exclusive pieces in your order")}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {itemCount} {itemCount === 1 ? t("cart.item_singular", "item") : t("cart.item_plural", "items")}
              </Badge>
            </div>

            {/* List of articles */}
            <div className="divide-y divide-border/50">
              {items.map((item) => {
                const imageSrc = item.variant?.image_url || item.product.image_url;
                return (
                  <div key={item.id} className="py-4 first:pt-2 last:pb-2 flex gap-4 items-center">
                    {/* Thumbnail */}
                    <div className="size-20 rounded-xl bg-muted/40 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageSrc}
                          alt={item.product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ShoppingBagIcon className="size-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        href={`/products/${item.product.id || ""}`}
                        className="text-xs sm:text-sm font-bold text-foreground hover:underline truncate block"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {item.variant?.attributes?.size && (
                          <span className="font-mono bg-muted/60 px-2 py-0.5 rounded-md text-[11px] text-foreground font-medium">
                            {t("checkout.size", "Size")}: {item.variant.attributes.size}
                          </span>
                        )}
                        {item.variant?.attributes?.color && (
                          <span className="text-[11px]">
                            • {item.variant.attributes.color}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-foreground font-semibold">
                          × {item.quantity}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        ${Number(item.unitPrice).toFixed(2)} {t("checkout.each", "each")}
                      </p>
                    </div>

                    {/* Total for this line */}
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-bold text-foreground">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Luxury Guarantee Notice */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 flex items-start gap-3.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ShieldUser className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">
                {t("checkout.vip_service_title", "LUX Concierge & Direct Assistance")}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "checkout.vip_service_desc",
                  "Each piece is individually packaged and prepared with high standards. When completing your purchase, our team will personally assist you via Instagram DM to coordinate delivery details and answer any questions."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Purchase Action */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            {/* Summary Title */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {t("checkout.summary", "Order Summary")}
              </h3>
              <Badge variant="outline" className="font-mono text-xs">
                USD
              </Badge>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.subtotal", "Subtotal:")}</span>
                <span className="font-mono font-medium text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.shipping", "Express Worldwide Shipping:")}</span>
                <span className="font-mono font-medium text-foreground">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {t("cart.free_shipping", "FREE")}
                    </span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.taxes", "Estimated Taxes (15% IVA):")}</span>
                <span className="font-mono font-medium text-foreground">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3.5 text-sm font-bold text-foreground">
                <span>{t("cart.total", "Total Amount:")}</span>
                <span className="font-mono text-lg font-extrabold text-foreground">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Instagram DM Direct Purchase Button */}
            <div className="space-y-2.5 pt-1">
              <Button
                type="button"
                onClick={handleBuyClick}
                className="w-full h-12 text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer gap-2 transition-all"
              >
                <MessageCircleIcon className="size-4" />
                <span>{t("checkout.btn_buy_instagram", "Comprar en Instagram")}</span>
                <ExternalLinkIcon className="size-3.5 opacity-70" />
              </Button>

              {/* Informative Note */}
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-1">
                {t(
                  "checkout.instagram_note",
                  "Al hacer clic en Comprar, te redirigiremos a nuestro chat oficial de Instagram para confirmar disponibilidad y completar tu orden de forma ersonalizada."
                )}
              </p>
            </div>

            {/* Security Guarantee Badges */}
            {/* <div className="flex items-center justify-center gap-4 pt-2 border-t border-border text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="size-3.5 text-primary" />
                <span>{t("checkout.verified_quality", "Exclusive Pieces")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="size-3.5 text-primary" />
                <span>{t("checkout.direct_service", "Direct Support")}</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}

