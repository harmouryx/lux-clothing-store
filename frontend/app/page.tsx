"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { ProductCard } from "@/components/luxcomp/product-card";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/services/products";
import { useLanguage } from "@/hooks/use-language";
import { ShoppingBagIcon } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProducts();
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-8 space-y-10">

        {/* Best Sellers Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t("catalog.title", "Featured Collection")}
            </h2>
            <Link
              href="/products"
              className="text-xs font-semibold text-slate-700 hover:text-black transition-colors"
            >
              {t("catalog.all", "View all products")} &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="aspect-[4/5] w-full rounded-2xl bg-slate-100" />
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-8">
              <ShoppingBagIcon className="size-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">
                {t("catalog.empty.title", "No products are currently published")}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t("catalog.empty.desc", "Our catalog is being updated. Products created in the administration panel will appear here automatically.")}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}