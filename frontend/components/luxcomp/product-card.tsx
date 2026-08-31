"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

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
  const price = Number(product.base_price) || 47.99;
  const oldPrice = originalPrice || (badgeType === "discount" ? price * 1.25 : undefined);

  return (
    <div className="group flex flex-col space-y-3 cursor-pointer">
      {/* Product Image / Box Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#F6F6F6] border border-slate-100 flex items-center justify-center p-6 transition-all duration-300 group-hover:bg-[#EFEFEF] group-hover:shadow-sm">
        {/* Badge in top right */}
        {badge && (
          <div className="absolute top-3.5 right-3.5 z-10">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                badgeType === "discount"
                  ? "text-[#C4222E] bg-white border border-[#C4222E]/20 shadow-2xs"
                  : "text-slate-900 bg-white shadow-2xs font-semibold"
              }`}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Product Visual / Box + Bottle Placeholder */}
        <Link
          href={`/products/${product.id}`}
          className="size-full flex items-center justify-center gap-3"
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center gap-2.5 select-none transition-transform duration-300 group-hover:scale-105">
              {/* White Bottle Placeholder */}
              <div className="w-14 h-26 bg-white rounded-t-lg rounded-b-md shadow-xs border border-gray-200/70 flex flex-col items-center justify-center p-2 text-center">
                <div className="w-5 h-2.5 bg-gray-100 rounded-t-sm mb-1" />
                <span className="text-[7px] font-bold text-gray-800 uppercase tracking-tighter">
                  Skin-Clinic
                </span>
                <span className="text-[5px] text-gray-400 leading-none mt-1">
                  Pure Hydrator
                </span>
              </div>

              {/* Cardboard Box Placeholder */}
              <div
                className={`w-12 h-30 rounded-sm shadow-xs border flex flex-col justify-start p-2 ${
                  badgeType === "discount"
                    ? "bg-[#334226] text-white border-transparent"
                    : "bg-[#273B38] text-white border-transparent"
                }`}
              >
                <span className="text-[7px] font-bold uppercase tracking-tighter">
                  Skin-Clinic
                </span>
                <span className="text-[5px] opacity-70 leading-none mt-1">
                  50ml / 1.7oz
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Quick Add Overlay on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
            toast.success(`Added ${product.name} to cart`);
          }}
          className="absolute bottom-3 inset-x-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer transform translate-y-1 group-hover:translate-y-0"
        >
          Add to Cart
        </button>
      </div>

      {/* Product Details Row */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <Link
          href={`/products/${product.id}`}
          className="font-semibold text-slate-900 truncate max-w-[65%] hover:text-black transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 shrink-0 font-mono">
          {oldPrice && oldPrice > price && (
            <span className="text-slate-400 line-through text-[11px]">
              ${oldPrice.toFixed(2)}
            </span>
          )}
          <span className="font-bold text-slate-900">${price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
