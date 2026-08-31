"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Product, Tax, ProductVariant } from "@/lib/types";
import { getProducts, createProduct, deleteProduct, updateProduct, VariantInput } from "@/lib/services/products";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Edit3Icon,
  SaveIcon,
  BoxIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { toast } from "sonner";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function resolveList<T>(data: T[] | { data?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return (data as { data?: T[] })?.data || [];
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [taxId, setTaxId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [variants, setVariants] = useState<VariantInput[]>([
    { sku: "SKU-PROD-01", attributes: { size: "Standard", color: "", description: "" }, image_url: "", quantity: 10 },
  ]);

  // Edit product dialog
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editTaxId, setEditTaxId] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Stock edit state: variantId -> pending qty
  const [stockEdits, setStockEdits] = useState<Record<number, string>>({});
  const [stockSaving, setStockSaving] = useState<Record<number, boolean>>({});

  // Expanded product rows (show variant details inline)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // ──────────────────────────────────────────────────────────────────────────
  // Data loading
  // ──────────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [productsData, taxesRes] = await Promise.all([
        getProducts(),
        apiClient.get<Tax[] | { data: Tax[] }>("/api/taxes").catch(() => ({ data: [] as Tax[] })),
      ]);
      setProducts(productsData);
      const taxList = resolveList(taxesRes.data);
      setTaxes(taxList);
      if (taxList.length > 0 && !taxId) {
        setTaxId(String(taxList[0].id));
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

  // ──────────────────────────────────────────────────────────────────────────
  // Image upload for variant
  // ──────────────────────────────────────────────────────────────────────────

  const handleVariantImageFile = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Image file size must be under 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleVariantChange(idx, "image_url", event.target?.result as string);
        toast.success(`Image attached to Variant #${idx + 1}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Variant form helpers
  // ──────────────────────────────────────────────────────────────────────────

  const addVariantRow = () => {
    const nextIdx = variants.length + 1;
    setVariants((prev) => [
      ...prev,
      { sku: `SKU-PROD-0${nextIdx}`, attributes: { size: "", color: "", description: "" }, image_url: "", quantity: 5 },
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
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v;
        if (field === "sku" || field === "image_url" || field === "quantity") {
          return { ...v, [field]: value };
        }
        return { ...v, attributes: { ...v.attributes, [field]: value } };
      })
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Create product
  // ──────────────────────────────────────────────────────────────────────────

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

    setSubmitting(true);
    try {
      await createProduct({
        name: name.trim(),
        base_price: parseFloat(basePrice),
        tax_applied_id: parseInt(taxId, 10),
        image_url: variants[0]?.image_url || undefined,
        product_variants: variants,
      });
      toast.success(`Product "${name}" created successfully`);
      setName("");
      setBasePrice("");
      setVariants([{ sku: "SKU-PROD-01", attributes: { size: "Standard", color: "", description: "" }, image_url: "", quantity: 10 }]);
      setIsCreating(false);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Delete product
  // ──────────────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Delete "${productName}"? This will remove all its variants and stock records.`)) return;
    try {
      await deleteProduct(id);
      toast.success(`Product "${productName}" deleted`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Edit product (name / price / tax)
  // ──────────────────────────────────────────────────────────────────────────

  const openEditProduct = (p: Product) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditPrice(String(Number(p.base_price).toFixed(2)));
    setEditTaxId(String(p.tax_applied_id));
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setEditSubmitting(true);
    try {
      await updateProduct(editProduct.id, {
        name: editName.trim(),
        base_price: parseFloat(editPrice),
        tax_applied_id: parseInt(editTaxId, 10),
      });
      toast.success(`Product "${editName}" updated`);
      setEditProduct(null);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Stock inline edit
  // ──────────────────────────────────────────────────────────────────────────

  const handleStockSave = async (variantId: number) => {
    const qty = parseInt(stockEdits[variantId] ?? "", 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Enter a valid stock quantity (0 or higher)");
      return;
    }
    setStockSaving((prev) => ({ ...prev, [variantId]: true }));
    try {
      await apiClient.patch(`/api/product-variants/${variantId}/stock`, { quantity: qty });
      toast.success(`Stock updated to ${qty} units`);
      setStockEdits((prev) => { const n = { ...prev }; delete n[variantId]; return n; });
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update stock");
    } finally {
      setStockSaving((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Delete variant
  // ──────────────────────────────────────────────────────────────────────────

  const handleDeleteVariant = async (variantId: number, sku: string, productId: string) => {
    if (!confirm(`Delete variant "${sku}"? This also removes its stock record.`)) return;
    try {
      await apiClient.delete(`/api/product-variants/${variantId}`);
      toast.success(`Variant "${sku}" deleted`);
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : { ...p, variants: (p.variants || []).filter((v: ProductVariant) => v.id !== variantId) }
        )
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete variant");
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Export
  // ──────────────────────────────────────────────────────────────────────────

  const handleExportCsv = () => {
    if (products.length === 0) { toast.error("No product data available to export"); return; }
    const headers = ["ID", "Product Name", "Base Price ($)", "Tax Applied", "Variants Count", "Total Stock"];
    const rows = products.map((p) => [
      p.id,
      p.name,
      Number(p.base_price).toFixed(2),
      p.tax?.name || String(p.tax_applied_id),
      p.variants?.length || 0,
      (p.variants || []).reduce((acc: number, v: ProductVariant) => acc + (v.stock?.quantity ?? 0), 0),
    ]);
    downloadCsv("lux_products_catalog_report.csv", headers, rows);
    toast.success("Products catalog exported as CSV");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Toggle row expansion
  // ──────────────────────────────────────────────────────────────────────────

  const toggleRow = (id: string) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Products Catalog</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, edit, manage variants, update stock and tax assignments
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading || products.length === 0} className="text-xs">
            <DownloadIcon className="size-3.5 mr-1.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="text-xs">
            <RefreshCwIcon className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-medium shadow-xs text-xs"
          >
            {isCreating ? (
              <><XIcon className="size-4 mr-1.5" /> Close Form</>
            ) : (
              <><PlusIcon className="size-4 mr-1.5" /> Add Product</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Create Form ── */}
      {isCreating && (
        <Card className="border border-border bg-card p-6 rounded-2xl shadow-xs animate-in fade-in-50 duration-200">
          <CardHeader className="p-0 pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold text-foreground">New Product & Variant Setup</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Fill in base parameters. Each variant includes its own image (Variant #1 image is the primary cover).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Product Name *</label>
                  <Input placeholder="e.g. Skin-Clinic Hair Hydrator" value={name} onChange={(e) => setName(e.target.value)} className="bg-background text-foreground text-xs" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Base Price ($ USD) *</label>
                  <Input type="number" step="0.01" min="0" placeholder="47.99" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="bg-background text-foreground text-xs font-mono" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Applicable Tax *</label>
                  <Select value={taxId} onValueChange={setTaxId}>
                    <SelectTrigger className="w-full bg-background text-foreground text-xs">
                      <SelectValue placeholder="Select Tax Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxes.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                          {t.name} ({Number(t.tax_percentage)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Product Variants ({variants.length})
                    </h4>
                    <p className="text-[11px] text-muted-foreground">Variant #1 image is the primary catalog cover.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addVariantRow} className="border-border text-foreground hover:bg-muted text-xs">
                    <PlusIcon className="size-3 mr-1" /> Add Variant
                  </Button>
                </div>

                <div className="space-y-3">
                  {variants.map((varItem, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-muted/20 grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          SKU * {idx === 0 && <span className="text-primary font-bold">(Cover)</span>}
                        </label>
                        <Input placeholder="SKU-001" value={varItem.sku} onChange={(e) => handleVariantChange(idx, "sku", e.target.value)} className="h-9 text-xs font-mono bg-background text-foreground" required />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Size / Vol</label>
                        <Input placeholder="e.g. M" value={varItem.attributes.size || ""} onChange={(e) => handleVariantChange(idx, "size", e.target.value)} className="h-9 text-xs bg-background text-foreground" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Color</label>
                        <Input placeholder="e.g. Black" value={varItem.attributes.color || ""} onChange={(e) => handleVariantChange(idx, "color", e.target.value)} className="h-9 text-xs bg-background text-foreground" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Stock Qty *</label>
                        <Input type="number" min="0" value={varItem.quantity} onChange={(e) => handleVariantChange(idx, "quantity", parseInt(e.target.value, 10) || 0)} className="h-9 text-xs font-mono bg-background text-foreground" required />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground">Desktop Image</label>
                        {varItem.image_url ? (
                          <div className="flex items-center gap-2 h-9">
                            <div className="relative size-8 rounded border border-border overflow-hidden shrink-0">
                              <img src={varItem.image_url} alt="Variant" className="size-full object-cover" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleVariantChange(idx, "image_url", "")} className="text-[10px] text-destructive hover:bg-destructive/10 h-7 px-2">
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer h-9 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-medium flex items-center justify-between text-foreground transition-colors">
                            <span className="truncate">Upload Image...</span>
                            <UploadIcon className="size-3.5 text-muted-foreground shrink-0 ml-1" />
                            <input type="file" accept="image/*" onChange={(e) => handleVariantImageFile(idx, e)} className="hidden" />
                          </label>
                        )}
                      </div>
                      <div className="col-span-1 flex items-end justify-center pb-0.5">
                        <Button type="button" variant="ghost" size="icon" className="size-9 text-destructive hover:bg-destructive/10" onClick={() => removeVariantRow(idx)}>
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)} className="text-xs">Cancel</Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-medium text-xs shadow-xs">
                  {submitting && <Loader2Icon className="size-4 animate-spin mr-1.5" />}
                  Save Product & Variants
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Products Table ── */}
      <Card className="border border-border bg-card shadow-xs overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 px-3 py-3" />
                  <TableHead className="w-14 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Image</TableHead>
                  <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Product Name</TableHead>
                  <TableHead className="w-28 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Base Price</TableHead>
                  <TableHead className="w-40 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Tax Applied</TableHead>
                  <TableHead className="w-28 px-4 py-3 text-center font-semibold text-xs text-muted-foreground">Variants</TableHead>
                  <TableHead className="w-24 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin mx-auto mb-2 text-slate-700" />
                      Loading product inventory...
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => {
                    const isExpanded = expandedRows.has(product.id);
                    const totalStock = (product.variants || []).reduce(
                      (acc: number, v: ProductVariant) => acc + (v.stock?.quantity ?? 0),
                      0
                    );
                    return (
                      <React.Fragment key={product.id}>
                        <TableRow className="hover:bg-muted/30 transition-colors">
                          {/* Expand toggle */}
                          <TableCell className="px-3 py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              onClick={() => toggleRow(product.id)}
                              title={isExpanded ? "Collapse variants" : "Expand variants"}
                            >
                              {isExpanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                            </Button>
                          </TableCell>

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

                          <TableCell className="px-4 py-3 font-semibold text-foreground text-xs">{product.name}</TableCell>

                          <TableCell className="px-4 py-3 text-right font-mono font-bold text-xs">
                            ${Number(product.base_price).toFixed(2)}
                          </TableCell>

                          <TableCell className="px-4 py-3">
                            {product.tax ? (
                              <Badge variant="secondary" className="font-mono text-[10px]">
                                {product.tax.name} ({Number(product.tax.tax_percentage)}%)
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Tax ID: {product.tax_applied_id}</span>
                            )}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-center">
                            <span className="text-xs font-mono font-semibold">
                              {product.variants?.length || 0} var · {totalStock} left
                            </span>
                          </TableCell>

                          <TableCell className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={() => openEditProduct(product)} title="Edit product">
                                <Edit3Icon className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(product.id, product.name)} title="Delete product">
                                <Trash2Icon className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded: variants with inline stock edit */}
                        {isExpanded && (
                          <TableRow className="bg-muted/10 hover:bg-muted/20">
                            <TableCell colSpan={7} className="px-6 py-4">
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <BoxIcon className="size-3" /> Variant Details & Stock Management
                                </p>
                                {(product.variants || []).length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No variants found.</p>
                                ) : (
                                  <div className="grid grid-cols-1 gap-2">
                                    {(product.variants || []).map((v: ProductVariant) => {
                                      const currentQty = v.stock?.quantity ?? 0;
                                      const pendingEdit = stockEdits[v.id];
                                      const isSaving = stockSaving[v.id] ?? false;

                                      return (
                                        <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card">
                                          {/* Image thumbnail */}
                                          {v.image_url ? (
                                            <div className="relative size-8 rounded border border-border overflow-hidden shrink-0">
                                              <img src={v.image_url} alt={v.sku} className="size-full object-cover" />
                                            </div>
                                          ) : (
                                            <div className="size-8 rounded border border-border bg-muted flex items-center justify-center shrink-0">
                                              <ImageIcon className="size-3 text-muted-foreground" />
                                            </div>
                                          )}

                                          {/* SKU */}
                                          <span className="font-mono text-xs font-bold text-foreground w-32 shrink-0">{v.sku}</span>

                                          {/* Attributes */}
                                          <div className="flex gap-1 flex-wrap flex-1">
                                            {v.attributes?.size && (
                                              <Badge variant="outline" className="text-[9px] font-mono">Size: {String(v.attributes.size)}</Badge>
                                            )}
                                            {v.attributes?.color && (
                                              <Badge variant="outline" className="text-[9px] font-mono">Color: {String(v.attributes.color)}</Badge>
                                            )}
                                            {v.attributes?.description && (
                                              <Badge variant="outline" className="text-[9px] max-w-xs truncate">{String(v.attributes.description)}</Badge>
                                            )}
                                          </div>

                                          {/* Stock inline edit */}
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-muted-foreground font-medium">Stock:</span>
                                            <Input
                                              type="number"
                                              min="0"
                                              className="h-7 w-20 text-xs font-mono text-center bg-background"
                                              value={pendingEdit !== undefined ? pendingEdit : String(currentQty)}
                                              onChange={(e) =>
                                                setStockEdits((prev) => ({ ...prev, [v.id]: e.target.value }))
                                              }
                                            />
                                            {pendingEdit !== undefined && pendingEdit !== String(currentQty) && (
                                              <Button
                                                size="sm"
                                                className="h-7 px-2 text-[10px] bg-slate-900 hover:bg-black text-white"
                                                onClick={() => handleStockSave(v.id)}
                                                disabled={isSaving}
                                              >
                                                {isSaving ? <Loader2Icon className="size-3 animate-spin" /> : <SaveIcon className="size-3" />}
                                              </Button>
                                            )}
                                          </div>

                                          {/* Delete variant */}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() => handleDeleteVariant(v.id, v.sku, product.id)}
                                            title="Delete variant"
                                          >
                                            <Trash2Icon className="size-3.5" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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

      {/* ── Edit Product Dialog ── */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Product</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update name, base price, and tax assignment. Variants are managed in the table below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Product Name *</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="text-xs" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Base Price ($ USD) *</label>
                <Input type="number" step="0.01" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="text-xs font-mono" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tax Rate *</label>
                <Select value={editTaxId} onValueChange={setEditTaxId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select tax" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                        {t.name} ({Number(t.tax_percentage)}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditProduct(null)} className="text-xs">Cancel</Button>
              <Button type="submit" size="sm" disabled={editSubmitting} className="bg-slate-900 hover:bg-black text-white text-xs">
                {editSubmitting && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
