"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import { PlusIcon, CheckIcon } from "lucide-react";

interface ProductCardProps {
  product: Product;
  badge?: string;
  badgeType?: "discount" | "new";
  originalPrice?: number;
}

export function ProductCard({
  product,
  badge,
  badgeType = "discount",
  originalPrice,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);
  const price = Number(product.base_price) || 0;
  const oldPrice = originalPrice;

  const totalStock = product.variants?.reduce(
    (acc, v) => acc + (v.stock?.quantity !== undefined ? Number(v.stock.quantity) : 0),
    0
  );
  const isOutOfStock =
    product.variants && product.variants.length > 0
      ? (totalStock ?? 0) <= 0
      : false;

  return (
    <div className="group flex flex-col space-y-3 cursor-pointer">
      {/* Product Image / Box Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/40 border border-border flex items-center justify-center p-6 transition-all duration-300 group-hover:bg-muted/70 group-hover:shadow-sm">
        {/* Out of Stock or Custom Badge */}
        {isOutOfStock ? (
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-slate-900 text-white font-mono shadow-2xs">
              {t("detail.sold_out", "SOLD OUT")}
            </span>
          </div>
        ) : badge ? (
          <div className="absolute top-3.5 right-3.5 z-10">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                badgeType === "discount"
                  ? "text-red-700 bg-background border border-red-200 shadow-2xs"
                  : "text-foreground bg-background shadow-2xs font-semibold"
              }`}
            >
              {badge}
            </span>
          </div>
        ) : null}

        {/* Product Visual */}
        <Link
          href={`/products/${product.id}`}
          className="size-full flex items-center justify-center"
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                isOutOfStock ? "opacity-60 grayscale-50" : ""
              }`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 select-none transition-transform duration-300 group-hover:scale-105 text-center p-4">
              <div className="size-20 rounded-2xl bg-card border border-border shadow-xs flex flex-col items-center justify-center p-2">
                <span className="font-mono text-sm font-extrabold tracking-widest text-foreground">
                  LUX
                </span>
                <span className="text-[7px] uppercase tracking-wider text-muted-foreground mt-0.5 font-mono">
                  Apparel
                </span>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground line-clamp-1">
                {product.name}
              </span>
            </div>
          )}
        </Link>

        {/* Quick Add Overlay on Hover */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
              setIsAdded(true);
              setTimeout(() => setIsAdded(false), 1200);
            }}
            className={`absolute bottom-3 inset-x-3 py-2 text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer transform translate-y-1 group-hover:translate-y-0 flex items-center justify-center gap-1.5 ${
              isAdded
                ? "bg-emerald-700 text-white pointer-events-none"
                : "bg-slate-900 hover:bg-black text-white"
            }`}
          >
            {isAdded ? (
              <>
                <CheckIcon className="size-3.5" />
                <span>{t("catalog.added_to_cart", "Added to Bag")}</span>
              </>
            ) : (
              <>
                <PlusIcon className="size-3.5" />
                <span>{t("catalog.add_to_cart", "Add to Bag")}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Product Details Row */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <Link
          href={`/products/${product.id}`}
          className="font-semibold text-foreground truncate max-w-[65%] hover:underline transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 shrink-0 font-mono">
          {oldPrice && oldPrice > price && (
            <span className="text-muted-foreground line-through text-[11px]">
              ${oldPrice.toFixed(2)}
            </span>
          )}
          <span className="font-bold text-foreground">${price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
