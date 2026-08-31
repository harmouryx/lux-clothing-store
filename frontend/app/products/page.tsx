"use client";

import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { ProductCard } from "@/components/luxcomp/product-card";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/services/products";
import { FiSearch, FiSliders } from "react-icons/fi";

const DEFAULT_LINEUP: Array<{
  product: Product;
  badge?: string;
  badgeType?: "discount" | "new";
  originalPrice?: number;
}> = [
  {
    product: { id: "lineup-1", name: "Face Toner", base_price: 47.99, tax_applied_id: 1 },
    badge: "-20%",
    badgeType: "discount",
    originalPrice: 59.99,
  },
  {
    product: { id: "lineup-2", name: "Body Wash", base_price: 49.99, tax_applied_id: 1 },
  },
  {
    product: { id: "lineup-3", name: "Body Serum", base_price: 49.99, tax_applied_id: 1 },
    badge: "New",
    badgeType: "new",
  },
  {
    product: { id: "lineup-4", name: "Hydrating Cleanser", base_price: 38.00, tax_applied_id: 1 },
    badge: "-15%",
    badgeType: "discount",
    originalPrice: 45.00,
  },
  {
    product: { id: "lineup-5", name: "Night Repair Cream", base_price: 65.00, tax_applied_id: 1 },
  },
  {
    product: { id: "lineup-6", name: "Exfoliating Scrub", base_price: 42.50, tax_applied_id: 1 },
    badge: "New",
    badgeType: "new",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"default" | "price-asc" | "price-desc">("default");

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

  const rawList = useMemo(() => {
    return products.length > 0
      ? products.map((p, idx) => ({
          product: p,
          badge: idx % 3 === 0 ? "-20%" : idx % 3 === 2 ? "New" : undefined,
          badgeType: (idx % 3 === 0 ? "discount" : "new") as "discount" | "new",
          originalPrice: idx % 3 === 0 ? Number(p.base_price) * 1.25 : undefined,
        }))
      : DEFAULT_LINEUP;
  }, [products]);

  const filteredList = useMemo(() => {
    let result = rawList.filter((item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (sortOption === "price-asc") {
      result.sort((a, b) => Number(a.product.base_price) - Number(b.product.base_price));
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => Number(b.product.base_price) - Number(a.product.base_price));
    }

    return result;
  }, [rawList, searchQuery, sortOption]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-10 space-y-8">
        {/* Header Title & Clean Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Curated Lineup
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Select */}
            <div className="relative w-48">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-medium transition-colors"
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredList.map((item, idx) => (
              <ProductCard
                key={`${item.product.id}-${idx}`}
                product={item.product}
                badge={item.badge}
                badgeType={item.badgeType}
                originalPrice={item.originalPrice}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <FiSliders className="size-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No products match your criteria</p>
            <p className="text-xs text-gray-500">Try clearing your search query or changing filters</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSortOption("default");
              }}
              className="px-4 py-2 text-xs font-semibold text-[#7A1C24] hover:underline"
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