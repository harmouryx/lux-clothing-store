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
import { Loader2Icon, ArrowLeftIcon } from "lucide-react";
import { FiShoppingBag } from "react-icons/fi";

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
          setProduct(null);
        }
      } catch (error) {
        console.error("Failed to load product detail:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
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

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 max-w-xl mx-auto w-full px-6 py-24 text-center space-y-4">
          <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <FiShoppingBag className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            The requested product does not exist or is currently unavailable in our catalog.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <ArrowLeftIcon className="size-4" />
              Back to Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const price = Number(product.base_price) || 0;
  const isSoldOut = selectedVariant?.stock ? selectedVariant.stock.quantity <= 0 : false;
  const displayImage = selectedVariant?.image_url || product.image_url;

  // Extract characteristics/description bullets
  const characteristics = selectedVariant?.attributes?.description
    ? selectedVariant.attributes.description.split("\n").filter(Boolean)
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-black transition-colors"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to Lineup
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Product Image Box Container */}
          <div className="relative aspect-square w-full rounded-2xl bg-[#F6F6F6] flex items-center justify-center p-8 border border-slate-100">
            {/* Display uploaded image if present, otherwise render clean placeholder */}
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
                    Pure Formula
                  </span>
                  <span className="text-[7px] text-gray-400 mt-6 font-mono">
                    120ml / 4.0 fl oz
                  </span>
                </div>

                {/* Box */}
                <div className="w-24 h-56 rounded-md shadow-xs bg-[#273B38] text-white flex flex-col justify-between p-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-tight leading-tight">
                    Skin–Clinic
                  </span>
                  <span className="text-[7px] opacity-70 font-mono">
                    Official Product
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
              Premium quality item crafted with active formulations and luxury finishing.
            </p>

            {/* Characteristics Bullet Points */}
            {characteristics.length > 0 && (
              <ul className="space-y-2 text-xs text-slate-700 pl-4 list-disc marker:text-slate-400">
                {characteristics.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}

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
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
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
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  addItem(product, selectedVariant, 1);
                  toast.success(`Added ${product.name} to cart`);
                }}
                disabled={isSoldOut}
                className="h-11 px-8 rounded-lg bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                Add to cart
              </button>

              <span className="text-lg font-bold font-mono text-slate-900">
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
