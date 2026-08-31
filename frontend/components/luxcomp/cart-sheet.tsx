"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-6">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBagIcon className="size-5" />
            Shopping Cart
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-auto font-mono">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-12">
            <div className="rounded-full bg-muted p-4">
              <ShoppingBagIcon className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Browse our collection and add your favorite items.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              asChild
              className="mt-2"
            >
              <Link href="/products">Explore Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y py-2">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  <div className="size-16 rounded-md bg-muted flex items-center justify-center shrink-0 border">
                    <ShoppingBagIcon className="size-6 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-medium leading-none truncate">
                      {item.product.name}
                    </h4>
                    {item.variant?.attributes && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant.attributes.color && `Color: ${item.variant.attributes.color}`}
                        {item.variant.attributes.size && ` · Size: ${item.variant.attributes.size}`}
                      </p>
                    )}
                    <p className="text-sm font-semibold">
                      ${Number(item.unitPrice).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-none"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <MinusIcon className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-mono">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <PlusIcon className="size-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive ml-auto"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="mt-auto border-t pt-4 flex-col gap-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Taxes & Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <Separator />
              <Button asChild className="w-full" size="lg" onClick={() => setIsOpen(false)}>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
