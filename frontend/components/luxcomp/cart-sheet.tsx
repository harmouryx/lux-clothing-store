"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2Icon, PlusIcon, MinusIcon, ShoppingBagIcon } from "lucide-react";

export function CartSheet() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { t } = useLanguage();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-6 bg-card border-border">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShoppingBagIcon className="size-4.5" />
            <span>{t("cart.title", "Your Shopping Bag")}</span>
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-auto font-mono text-xs">
                {itemCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-12">
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <ShoppingBagIcon className="size-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{t("cart.empty", "Your shopping bag is empty")}</p>
              <p className="text-xs text-muted-foreground">
                {t("catalog.subtitle", "Browse our collection and add your favorite items.")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              asChild
              className="mt-2 text-xs border-border"
            >
              <Link href="/products">{t("cart.explore_products", "Explore Products")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-border/40 py-2">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 flex gap-3.5 items-start">
                  <div className="size-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 border border-border overflow-hidden">
                    {item.product.image_url || item.variant?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.variant?.image_url || item.product.image_url}
                        alt={item.product.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <ShoppingBagIcon className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-foreground leading-snug truncate">
                      {item.product.name}
                    </h4>
                    {item.variant?.attributes && (
                      <p className="text-[11px] text-muted-foreground">
                        {item.variant.attributes.size && `Size: ${item.variant.attributes.size}`}
                        {item.variant.attributes.color && ` · ${item.variant.attributes.color}`}
                      </p>
                    )}
                    <p className="text-xs font-bold font-mono text-foreground">
                      ${Number(item.unitPrice).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 rounded-none text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <MinusIcon className="size-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-mono font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 rounded-none text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <PlusIcon className="size-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive ml-auto cursor-pointer"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="mt-auto border-t border-border pt-4 flex-col gap-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.subtotal", "Subtotal:")}</span>
                  <span className="font-bold font-mono text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{t("cart.taxes", "Estimated Taxes:")}</span>
                  <span>{t("cart.calculated_at_checkout", "Calculated at checkout")}</span>
                </div>
              </div>
              <Separator />
              <Button
                asChild
                className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl h-11"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/checkout">{t("cart.checkout", "Proceed to Checkout")}</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
