"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";
import { Product, ProductVariant } from "@/lib/types";
import { getProductById } from "@/lib/services/products";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "sonner";
import {
  Loader2Icon,
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
  ShoppingBagIcon,
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const { t, lang } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

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
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 text-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground mx-auto" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-xl mx-auto w-full px-6 py-24 text-center space-y-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <ShoppingBagIcon className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t("detail.not_found", "Product Not Found")}</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t("detail.not_found_desc", "The requested product does not exist or is currently unavailable.")}
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <ArrowLeftIcon className="size-4" />
              {t("detail.back", "Back to Lineup")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const price = Number(product.base_price) || 0;
  const availableStock = selectedVariant?.stock?.quantity !== undefined ? selectedVariant.stock.quantity : 10;
  const isSoldOut = availableStock <= 0;
  const displayImage = selectedVariant?.image_url || product.image_url;

  // Extract characteristics/description bullets
  const characteristics = selectedVariant?.attributes?.description
    ? selectedVariant.attributes.description.split("\n").filter(Boolean)
    : [];

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(availableStock, prev + 1));
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem(product, selectedVariant, quantity);
    toast.success(
      lang === "ES"
        ? `Se agregaron ${quantity} unidad(es) de ${product.name} a tu bolsa`
        : `Added ${quantity} item(s) of ${product.name} to your bag`
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 sm:px-8 py-10">
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-3.5" />
            {t("detail.back", "Back to Lineup")}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left Column: Product Visual Showcase */}
          <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-3xl bg-muted/30 border border-border flex items-center justify-center p-8 overflow-hidden">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-center select-none p-6">
                <div className="size-32 rounded-2xl bg-card border border-border shadow-xs flex flex-col items-center justify-center p-4">
                  <span className="font-mono text-xl font-extrabold tracking-widest text-foreground">
                    LUX
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1 font-mono">
                    Archive Piece
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Official Collection Item</p>
                </div>
              </div>
            )}

            {isSoldOut && (
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                  {t("detail.sold_out", "SOLD OUT")}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Details, Selection & Actions */}
          <div className="space-y-6 max-w-lg">
            {/* Title & Price */}
            <div className="space-y-2 border-b border-border/60 pb-5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-primary/10 text-primary">
                  LUX ARCHIVE
                </span>
                {product.tax && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                    {Number(product.tax.tax_percentage)}% IVA
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-bold font-mono text-foreground">
                  ${price.toFixed(2)} USD
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("detail.tax_included", "Includes system taxes")}
                </span>
              </div>
            </div>

            {/* Stock Status Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  isSoldOut ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span className="text-xs font-semibold text-foreground">
                {isSoldOut
                  ? t("detail.sold_out", "SOLD OUT")
                  : `${t("detail.in_stock", "In Stock")} (${availableStock} ${t("detail.available_units", "units left")})`}
              </span>
            </div>

            {/* Variant Selector (Size / Color) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  {t("detail.select_variant", "Select Variant (Size / Color):")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const label = v.attributes.size || v.attributes.color || v.sku;
                    const stockQty = v.stock?.quantity ?? 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-card text-foreground border-border hover:border-foreground/60"
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                          ({stockQty})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                {t("detail.quantity", "Quantity:")}
              </label>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-border rounded-xl bg-card p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1 || isSoldOut}
                    className="size-8 rounded-lg flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                  >
                    <MinusIcon className="size-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    disabled={quantity >= availableStock || isSoldOut}
                    className="size-8 rounded-lg flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                  >
                    <PlusIcon className="size-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Max: {availableStock}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <FiShoppingBag className="size-4" />
                <span>
                  {isSoldOut
                    ? t("detail.sold_out", "SOLD OUT")
                    : `${t("detail.add_button", "Add to Bag")} • $${(price * quantity).toFixed(2)}`}
                </span>
              </button>
            </div>

            {/* Characteristics & Highlights */}
            {characteristics.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border/60">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {lang === "ES" ? "Características de la Prenda" : "Piece Characteristics"}
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground pl-4 list-disc marker:text-primary">
                  {characteristics.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assurance Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TruckIcon className="size-4 text-foreground shrink-0" />
                <span>{lang === "ES" ? "Envío Express Seguro" : "Express Secure Courier"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheckIcon className="size-4 text-foreground shrink-0" />
                <span>{lang === "ES" ? "Calidad Textil Garantizada" : "Verified Luxury Textile"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
