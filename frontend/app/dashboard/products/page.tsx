"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Product, Tax } from "@/lib/types";
import { getProducts, createProduct, deleteProduct, VariantInput } from "@/lib/services/products";
import { apiClient } from "@/lib/api";
import { downloadCsv } from "@/lib/utils/export-csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusIcon,
  Trash2Icon,
  Loader2Icon,
  PackageIcon,
  RefreshCwIcon,
  UploadIcon,
  ImageIcon,
  XIcon,
  DownloadIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [taxId, setTaxId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Variants Form State: Each variant has its own desktop image
  const [variants, setVariants] = useState<VariantInput[]>([
    {
      sku: "SKU-PROD-01",
      attributes: { size: "Standard", color: "", description: "" },
      image_url: "",
      quantity: 10,
    },
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, taxesRes] = await Promise.all([
        getProducts(),
        apiClient.get<Tax[]>("/api/taxes").catch(() => ({ data: [] })),
      ]);
      setProducts(productsData);
      setTaxes(Array.isArray(taxesRes.data) ? taxesRes.data : (taxesRes.data as any)?.data || []);
      if (taxesRes.data && taxesRes.data.length > 0 && !taxId) {
        setTaxId(String(taxesRes.data[0].id));
      }
    } catch (error) {
      console.error("Failed to load dashboard products data:", error);
    } finally {
      setLoading(false);
    }
  }, [taxId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Desktop File Upload Handler for Variant Image
  const handleVariantImageFile = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Image file size must be under 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        handleVariantChange(idx, "image_url", base64);
        toast.success(`Image attached to Variant #${idx + 1}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariantRow = () => {
    const nextIdx = variants.length + 1;
    setVariants((prev) => [
      ...prev,
      {
        sku: `SKU-PROD-0${nextIdx}`,
        attributes: { size: "", color: "", description: "" },
        image_url: "",
        quantity: 5,
      },
    ]);
  };

  const removeVariantRow = (idx: number) => {
    if (variants.length <= 1) {
      toast.error("At least one product variant is required");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (
    idx: number,
    field: "sku" | "size" | "color" | "description" | "image_url" | "quantity",
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v;
        if (field === "sku" || field === "image_url" || field === "quantity") {
          return { ...v, [field]: value };
        }
        return {
          ...v,
          attributes: {
            ...v.attributes,
            [field]: value,
          },
        };
      })
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !basePrice || !taxId) {
      toast.error("Please fill in all required product fields");
      return;
    }

    if (variants.some((v) => !v.sku.trim())) {
      toast.error("All variants must have a valid SKU");
      return;
    }

    // Assign the first variant's image as the primary cover image of the product
    const primaryCoverImage = variants[0]?.image_url || undefined;

    setSubmitting(true);
    try {
      await createProduct({
        name: name.trim(),
        base_price: parseFloat(basePrice),
        tax_applied_id: parseInt(taxId, 10),
        image_url: primaryCoverImage,
        product_variants: variants,
      });

      toast.success(`Product "${name}" created successfully`);
      setName("");
      setBasePrice("");
      setVariants([
        {
          sku: "SKU-PROD-01",
          attributes: { size: "Standard", color: "", description: "" },
          image_url: "",
          quantity: 10,
        },
      ]);
      setIsCreating(false);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to create product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      await deleteProduct(id);
      toast.success(`Product "${productName}" deleted`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to delete product";
      toast.error(msg);
    }
  };

  const handleExportCsv = () => {
    if (products.length === 0) {
      toast.error("No product data available to export");
      return;
    }
    const headers = ["ID", "Product Name", "Base Price ($)", "Tax Applied ID", "Variants Count"];
    const rows = products.map((p) => [
      p.id,
      p.name,
      Number(p.base_price).toFixed(2),
      p.tax_applied_id || "N/A",
      p.variants?.length || 0,
    ]);
    downloadCsv("lux_products_catalog_report.csv", headers, rows);
    toast.success("Products catalog report downloaded as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Products Catalog</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage catalog items, variant stock, desktop images, and tax assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={loading || products.length === 0}
            className="border-border text-foreground hover:bg-muted text-xs"
          >
            <DownloadIcon className="size-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-border text-foreground hover:bg-muted text-xs"
          >
            <RefreshCwIcon className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-medium shadow-xs text-xs"
          >
            {isCreating ? (
              <>
                <XIcon className="size-4 mr-1.5" /> Close Form
              </>
            ) : (
              <>
                <PlusIcon className="size-4 mr-1.5" /> Add Product
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Inline Product Creation Card */}
      {isCreating && (
        <Card className="border border-border bg-card p-6 rounded-2xl shadow-xs animate-in fade-in-50 duration-200">
          <CardHeader className="p-0 pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold text-foreground">New Product & Variant Setup</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Fill in base parameters. Each variant includes its own desktop image (Variant #1 image serves as cover)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Product Name *</label>
                  <Input
                    placeholder="e.g. Skin-Clinic Hair Hydrator"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background text-foreground text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Base Price ($ USD) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="47.99"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="bg-background text-foreground text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Applicable Tax *</label>
                  <Select value={taxId} onValueChange={setTaxId}>
                    <SelectTrigger className="w-full bg-background text-foreground text-xs">
                      <SelectValue placeholder="Select Tax Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxes.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name} ({Number(t.tax_percentage)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Variants Section */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Product Variants ({variants.length})
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Upload an image for each variant. The first variant image will be the primary catalog cover.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={addVariantRow}
                    className="border-border text-foreground hover:bg-muted text-xs"
                  >
                    <PlusIcon className="size-3 mr-1" /> Add Variant
                  </Button>
                </div>

                <div className="space-y-3">
                  {variants.map((varItem, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-border bg-muted/20 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                    >
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          SKU Code * {idx === 0 && <span className="text-primary font-bold">(Cover)</span>}
                        </label>
                        <Input
                          placeholder="SKU-001"
                          value={varItem.sku}
                          onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                          className="h-9 text-xs font-mono bg-background text-foreground"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Size / Vol</label>
                        <Input
                          placeholder="e.g. 120ml"
                          value={varItem.attributes.size || ""}
                          onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                          className="h-9 text-xs bg-background text-foreground"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Color</label>
                        <Input
                          placeholder="e.g. Black"
                          value={varItem.attributes.color || ""}
                          onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                          className="h-9 text-xs bg-background text-foreground"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Stock Qty *</label>
                        <Input
                          type="number"
                          min="0"
                          value={varItem.quantity}
                          onChange={(e) => handleVariantChange(idx, "quantity", parseInt(e.target.value, 10) || 0)}
                          className="h-9 text-xs font-mono bg-background text-foreground"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Desktop Image</label>
                        {varItem.image_url ? (
                          <div className="flex items-center gap-2">
                            <div className="relative size-8 rounded border border-border overflow-hidden shrink-0">
                              <img src={varItem.image_url} alt="Variant" className="size-full object-cover" />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => handleVariantChange(idx, "image_url", "")}
                              className="text-[10px] text-destructive hover:bg-destructive/10"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer h-9 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-medium flex items-center justify-between text-foreground transition-colors">
                            <span className="truncate">Upload Image...</span>
                            <UploadIcon className="size-3.5 text-muted-foreground shrink-0 ml-1" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVariantImageFile(idx, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeVariantRow(idx)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="border-border text-foreground hover:bg-muted text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-medium text-xs shadow-xs"
                >
                  {submitting && <Loader2Icon className="size-4 animate-spin mr-1.5" />}
                  Save Product & Variants
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table Card */}
      <Card className="border border-border bg-card shadow-xs overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Image</TableHead>
                  <TableHead className="w-48 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Product Name</TableHead>
                  <TableHead className="w-28 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Base Price</TableHead>
                  <TableHead className="w-36 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Tax Applied</TableHead>
                  <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Variants & Stock</TableHead>
                  <TableHead className="w-20 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin mx-auto mb-2 text-slate-700" />
                      Loading product inventory...
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3">
                        {product.image_url ? (
                          <div className="relative size-9 rounded-lg overflow-hidden border border-border bg-background">
                            <img src={product.image_url} alt={product.name} className="size-full object-cover" />
                          </div>
                        ) : (
                          <div className="size-9 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="size-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-foreground text-xs">
                        {product.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right font-mono font-semibold text-xs">
                        ${Number(product.base_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {product.tax ? (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {product.tax.name} ({Number(product.tax.tax_percentage)}%)
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">ID: {product.tax_applied_id}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {product.variants && product.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.variants.map((v) => (
                              <Badge key={v.id} variant="outline" className="font-mono text-[10px]">
                                {v.sku}: {v.stock?.quantity ?? 0} left
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No variants</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(product.id, product.name)}
                          title="Delete product"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <PackageIcon className="size-8 stroke-[1.2] mx-auto mb-2 text-muted-foreground/50" />
                      No products registered in the database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
