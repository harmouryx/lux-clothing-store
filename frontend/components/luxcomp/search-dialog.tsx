"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/services/products";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getProducts()
        .then((data) => setProducts(data))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase().trim())
      )
    : products;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Search input header */}
        <div className="flex items-center px-4 border-b border-gray-100">
          <FiSearch className="size-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 px-3 text-sm text-slate-900 border-0 focus:outline-hidden bg-transparent"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-slate-900 transition-colors"
          >
            <FiX className="size-5" />
          </button>
        </div>

        {/* Search results list */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p className="text-xs text-center text-gray-400 py-6">Searching inventory...</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#7A1C24] transition-colors">
                    {p.name}
                  </h4>
                  {p.variants && p.variants.length > 0 && (
                    <p className="text-[11px] text-gray-400">
                      {p.variants.length} variant{p.variants.length > 1 ? "s" : ""} available
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-slate-800">
                  ${Number(p.base_price).toFixed(2)}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-xs text-center text-gray-400 py-6">No products found matching "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
}
