"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/services/products";
import { useLanguage } from "@/hooks/use-language";
import { SearchIcon, XIcon, PackageIcon, ArrowRightIcon } from "lucide-react";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const { t } = useLanguage();
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

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase().trim())
      )
    : products;

  const handleSelectProduct = (productId: number | string) => {
    onClose();
    router.push(`/products/${productId}`);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm px-4 animate-in fade-in-50 duration-150"
    >
      <div className="w-full max-w-xl bg-card rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-150">
        {/* Search input header */}
        <div className="flex items-center px-4 border-b border-border bg-background">
          <SearchIcon className="size-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder={t("search.placeholder", "Search luxury catalog by name...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 px-3 text-sm text-foreground border-0 focus:outline-hidden bg-transparent placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Search results list */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-1 bg-card">
          {loading ? (
            <div className="py-10 text-center space-y-2">
              <PackageIcon className="size-6 animate-pulse text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">{t("search.loading", "Searching catalog inventory...")}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p) => {
              const imageSrc = p.image_url || p.variants?.[0]?.image_url;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group text-left cursor-pointer border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {imageSrc ? (
                      <div className="size-10 rounded-lg overflow-hidden border border-border bg-muted/30 shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageSrc} alt={p.name} className="size-full object-cover" />
                      </div>
                    ) : (
                      <div className="size-10 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <PackageIcon className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {p.variants && p.variants.length > 0
                          ? `${p.variants.length} ${p.variants.length > 1 ? t("search.variants", "variants") : t("search.variant", "variant")}`
                          : t("search.exclusive_piece", "Exclusive piece")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-foreground">
                      ${Number(p.base_price).toFixed(2)}
                    </span>
                    <ArrowRightIcon className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center space-y-1">
              <p className="text-xs font-medium text-foreground">{t("search.no_pieces", "No pieces found")}</p>
              <p className="text-[11px] text-muted-foreground">{t("search.try_different", "Try searching with a different term or keyword")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

