"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { ProductCard } from "@/components/luxcomp/product-card";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/services/products";

const DEFAULT_BEST_SELLERS: Array<{
  product: Product;
  badge?: string;
  badgeType?: "discount" | "new";
  originalPrice?: number;
}> = [
  {
    product: {
      id: "prod-1",
      name: "Face Toner",
      base_price: 47.99,
      tax_applied_id: 1,
    },
    badge: "-20%",
    badgeType: "discount",
    originalPrice: 59.99,
  },
  {
    product: {
      id: "prod-2",
      name: "Body Wash",
      base_price: 49.99,
      tax_applied_id: 1,
    },
    badge: undefined,
  },
  {
    product: {
      id: "prod-3",
      name: "Body Serum",
      base_price: 49.99,
      tax_applied_id: 1,
    },
    badge: "New",
    badgeType: "new",
  },
  {
    product: {
      id: "prod-4",
      name: "Face Mask",
      base_price: 49.99,
      tax_applied_id: 1,
    },
    badge: undefined,
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProducts();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    loadData();
  }, []);

  const displayList =
    products.length >= 4
      ? products.slice(0, 4).map((p, idx) => ({
          product: p,
          badge: idx === 0 ? "-20%" : idx === 2 ? "New" : undefined,
          badgeType: (idx === 0 ? "discount" : "new") as "discount" | "new",
          originalPrice: idx === 0 ? Number(p.base_price) * 1.25 : undefined,
        }))
      : DEFAULT_BEST_SELLERS;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-8 space-y-14">
        {/* Figma Hero Banner */}
        <section className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden shadow-xs bg-linear-to-r from-[#0E3B3A] via-[#164E4D] to-[#0A2E2D] flex items-center p-8 sm:p-14 text-white">
          {/* Subtle water light waves overlay */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* Hero Left Content */}
          <div className="relative z-10 max-w-lg space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Pure hydration in every drop
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-100/90 font-mono">
              ESSENCE FOR A BRIGHTER COMPLEXION
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-block px-7 py-2.5 rounded-lg bg-[#274B45]/90 hover:bg-[#203F3A] text-white text-xs font-medium backdrop-blur-sm border border-white/10 transition-colors shadow-xs"
              >
                Shop now
              </Link>
            </div>
          </div>

          {/* Floating Product Highlight Card (Bottom Right) */}
          <div className="hidden sm:flex absolute bottom-8 right-8 z-10 bg-[#1D3E3A]/85 backdrop-blur-md rounded-xl p-3 items-center gap-3 border border-white/15 shadow-lg max-w-xs">
            <div className="size-14 rounded-lg bg-white p-1.5 flex items-center justify-center gap-1 shrink-0">
              <div className="w-4 h-9 bg-gray-100 rounded-xs border border-gray-200" />
              <div className="w-3.5 h-10 bg-[#334226] rounded-xs" />
            </div>
            <div className="text-left pr-2">
              <h4 className="text-xs font-semibold text-white">Face Toner</h4>
              <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                <span className="text-white/60 line-through">$59.99</span>
                <span className="text-white font-bold">$47.99</span>
              </div>
            </div>
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Best sellers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayList.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                badge={item.badge}
                badgeType={item.badgeType}
                originalPrice={item.originalPrice}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}