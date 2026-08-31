"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { Product, ProductVariant } from "@/lib/types";
import { getProductById } from "@/lib/services/products";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(productId);
        if (data) {
          setProduct(data);
          if (data?.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        } else {
          // Fallback mock
          setProduct({
            id: productId,
            name: "Product One",
            base_price: 47.99,
            tax_applied_id: 1,
          });
        }
      } catch (error) {
        console.error("Failed to load product detail:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 text-center">
          <Loader2Icon className="size-6 animate-spin text-gray-400 mx-auto" />
        </main>
        <Footer />
      </div>
    );
  }

  const price = Number(product.base_price) || 47.99;
  const isSoldOut = selectedVariant?.stock ? selectedVariant.stock.quantity <= 0 : false;
  const displayImage = selectedVariant?.image_url || product.image_url;

  // Extract characteristics/description bullets
  const characteristics = selectedVariant?.attributes?.description
    ? selectedVariant.attributes.description.split("\n").filter(Boolean)
    : ["First characteristic", "Second characteristic", "Third characteristic"];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Product Image Box Container */}
          <div className="relative aspect-square w-full rounded-2xl bg-[#F4F4F4] flex items-center justify-center p-8 border border-gray-100">
            {/* Discount Badge */}
            <div className="absolute top-5 right-5">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xs text-[#E14D4D] bg-white border border-[#E14D4D]/20 shadow-2xs">
                -20%
              </span>
            </div>

            {/* Display uploaded image if present, otherwise render signature product bottle & box */}
            {displayImage ? (
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-contain p-8 rounded-2xl"
              />
            ) : (
              <div className="flex items-center justify-center gap-4 select-none">
                {/* Bottle */}
                <div className="w-28 h-52 bg-white rounded-t-2xl rounded-b-xl shadow-xs border border-gray-200/80 flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-10 h-5 bg-gray-100 rounded-t-sm mb-3" />
                  <span className="text-[11px] font-bold text-gray-800 uppercase tracking-tight">
                    Skin–Clinic
                  </span>
                  <span className="text-[8px] text-gray-500 leading-tight mt-1">
                    Hair Hydrator
                  </span>
                  <span className="text-[7px] text-gray-400 mt-6 font-mono">
                    120ml / 4.0 fl oz
                  </span>
                </div>

                {/* Box */}
                <div className="w-24 h-56 rounded-md shadow-xs bg-[#3E4528] text-white flex flex-col justify-between p-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-tight leading-tight">
                    Skin–Clinic
                  </span>
                  <span className="text-[7px] opacity-70 font-mono">
                    140 ml / 2.03 fl.oz
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="space-y-6 max-w-md">
            {/* Header: Name + Badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h1>
              {isSoldOut && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-200 text-slate-700">
                  SOLD OUT
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              A modal dialog that interrupts the user with important content and expects a response.
            </p>

            {/* Characteristics Bullet Points */}
            <ul className="space-y-2 text-xs text-slate-700 pl-4 list-disc marker:text-slate-400">
              {characteristics.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            {/* Variant Selector (Size / Color) if available */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-semibold text-slate-800">
                  Select Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const label = v.attributes.size || v.attributes.color || v.sku;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-slate-700 border-gray-300 hover:border-black"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Row: Add to cart button & Price */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => {
                  addItem(product, selectedVariant, 1);
                  toast.success(`Added ${product.name} to cart`);
                }}
                disabled={isSoldOut}
                className="h-11 px-8 rounded-lg bg-[#1B2233] hover:bg-[#111622] disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                Add to cart
              </button>

              <span className="text-sm font-bold font-mono text-slate-900">
                ${price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
