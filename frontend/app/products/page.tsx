"use client";

import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { ProductCard } from "@/components/luxcomp/product-card";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/services/products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiShoppingBag, FiSliders } from "react-icons/fi";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<"default" | "price-asc" | "price-desc">("default");
  const [activeCategory, setActiveCategory] = useState<"all" | "apparel" | "archive">("all");

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

  const filteredList = useMemo(() => {
    let result = [...products];

    if (activeCategory === "apparel") {
      result = result.filter((p) => {
        const n = p.name.toLowerCase();
        return n.includes("camiseta") || n.includes("shirt") || n.includes("tee") || n.includes("hoodie") || n.includes("jacket") || n.includes("sky");
      });
    } else if (activeCategory === "archive") {
      result = result.filter((p) => {
        const n = p.name.toLowerCase();
        return n.includes("archive") || n.includes("lux") || n.includes("drop");
      });
    }

    if (sortOption === "price-asc") {
      result.sort((a, b) => Number(a.base_price) - Number(b.base_price));
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => Number(b.base_price) - Number(a.base_price));
    }

    return result;
  }, [products, sortOption, activeCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-10 space-y-8">
        {/* Header Title & Clean Shadcn UI Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Curated Lineup
            </h1>
            <p className="text-xs text-slate-500">
              Explore our luxury apparel and archive collection designed with timeless aesthetics
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Category Filter Pills */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Pieces
              </button>
              <button
                onClick={() => setActiveCategory("apparel")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeCategory === "apparel"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Apparel & Tees
              </button>
              <button
                onClick={() => setActiveCategory("archive")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeCategory === "archive"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Archive Drops
              </button>
            </div>

            {/* Official Shadcn UI Sort Select */}
            <div className="w-48 shrink-0">
              <Select value={sortOption} onValueChange={(val) => setSortOption(val as any)}>
                <SelectTrigger className="w-full h-9 text-xs bg-white border-slate-200 text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 shadow-2xs">
                  <SelectValue placeholder="Sort by: Featured" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900 border-slate-200">
                  <SelectItem value="default" className="text-xs">
                    Sort by: Featured
                  </SelectItem>
                  <SelectItem value="price-asc" className="text-xs">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-desc" className="text-xs">
                    Price: High to Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading Skeleton State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[4/5] w-full rounded-2xl bg-slate-100" />
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State when no products in database */
          <div className="py-20 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-8">
            <FiShoppingBag className="size-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              No products available yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our catalog is currently being prepared. New products created in the admin panel will appear here automatically.
            </p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredList.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={idx % 3 === 0 ? "-20%" : idx % 3 === 2 ? "New" : undefined}
                badgeType={idx % 3 === 0 ? "discount" : "new"}
                originalPrice={idx % 3 === 0 ? Number(product.base_price) * 1.25 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <FiSliders className="size-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No products match your selected filter</p>
            <p className="text-xs text-slate-500">Try resetting the category filter to view all items</p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSortOption("default");
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}