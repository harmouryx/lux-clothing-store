"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Tax } from "@/lib/types";
import { downloadCsv } from "@/lib/utils/export-csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusIcon,
  Trash2Icon,
  Loader2Icon,
  RefreshCwIcon,
  ReceiptIcon,
  DownloadIcon,
  Edit3Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardTaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<Tax[]>("/api/taxes");
      setTaxes(Array.isArray(res.data) ? res.data : (res.data as any)?.data || []);
    } catch (error) {
      console.error("Failed to load taxes data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = () => {
    if (taxes.length === 0) {
      toast.error("No tax rate data available to export");
      return;
    }
    const headers = ["Tax ID", "Tax Name", "Percentage Rate (%)"];
    const rows = taxes.map((t) => [t.id, t.name, Number(t.tax_percentage).toFixed(2)]);
    downloadCsv("lux_taxes_report.csv", headers, rows);
    toast.success("Taxes report downloaded as CSV");
  };

  const handleOpenEdit = (tax: Tax) => {
    setEditingId(tax.id);
    setName(tax.name);
    setPercentage(String(tax.tax_percentage));
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !percentage) {
      toast.error("Please fill in tax name and percentage");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await apiClient.put(`/api/taxes/${editingId}`, {
          name: name.trim(),
          tax_percentage: parseFloat(percentage),
        });
        toast.success(`Tax rate "${name}" updated successfully`);
      } else {
        await apiClient.post("/api/taxes", {
          name: name.trim(),
          tax_percentage: parseFloat(percentage),
        });
        toast.success("Tax rate created successfully");
      }

      setName("");
      setPercentage("");
      setEditingId(null);
      setIsCreating(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save tax rate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, taxName: string) => {
    if (!confirm(`Are you sure you want to delete tax rate "${taxName}"?`)) return;

    try {
      await apiClient.delete(`/api/taxes/${id}`);
      toast.success(`Tax rate "${taxName}" deleted`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete tax rate");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Taxes Management</h2>
          <p className="text-sm text-muted-foreground">
            Configure sales tax categories and percentage rates applied to storefront items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading || taxes.length === 0}>
            <DownloadIcon className="size-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCwIcon className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (isCreating) {
                setIsCreating(false);
                setEditingId(null);
                setName("");
                setPercentage("");
              } else {
                setIsCreating(true);
              }
            }}
            className="bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-medium"
          >
            {isCreating ? (
              <>
                <XIcon className="size-4 mr-1.5" /> Close Form
              </>
            ) : (
              <>
                <PlusIcon className="size-4 mr-1.5" /> Add Tax Rate
              </>
            )}
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="border border-border/80 bg-card shadow-xs animate-in fade-in-50 duration-200">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold">
              {editingId ? `Edit Tax Rate #${editingId}` : "New Tax Rate"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Define a tax percentage applied at checkout (e.g. Standard VAT 15%)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Tax Name *</label>
                  <Input
                    placeholder="e.g. Standard VAT"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Percentage Rate (%) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="12.00"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs">
                  {submitting && <Loader2Icon className="size-4 animate-spin mr-1.5" />}
                  {editingId ? "Update Tax Rate" : "Save Tax Rate"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/40 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">ID</TableHead>
                  <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Tax Rate Name</TableHead>
                  <TableHead className="w-32 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Percentage</TableHead>
                  <TableHead className="w-28 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin mx-auto mb-2" />
                      Loading tax rates...
                    </TableCell>
                  </TableRow>
                ) : taxes.length > 0 ? (
                  taxes.map((tax) => (
                    <TableRow key={tax.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3 font-mono text-xs font-semibold">#{tax.id}</TableCell>
                      <TableCell className="px-4 py-3 font-medium text-foreground text-xs">{tax.name}</TableCell>
                      <TableCell className="px-4 py-3 text-right font-mono font-bold text-xs">
                        {Number(tax.tax_percentage).toFixed(2)}%
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(tax)}
                          title="Edit tax rate"
                        >
                          <Edit3Icon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(tax.id, tax.name)}
                          title="Delete tax rate"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <ReceiptIcon className="size-8 stroke-[1.2] mx-auto mb-2 text-muted-foreground/50" />
                      No tax rates recorded in the database.
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
