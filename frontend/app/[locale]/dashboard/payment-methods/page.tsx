"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
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
  CreditCardIcon,
  CheckCircle2Icon,
  DownloadIcon,
  Edit3Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentMethod {
  id: number;
  payment_method_name: string;
  code: string;
  is_active: boolean;
  created_at?: string;
}

export default function DashboardPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await apiClient.get<PaymentMethod[] | { data: PaymentMethod[] }>("/api/payment-methods");
      const list: PaymentMethod[] = Array.isArray(res.data)
        ? res.data
        : (res.data as { data?: PaymentMethod[] })?.data || [];
      setMethods(list);
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = () => {
    if (methods.length === 0) {
      toast.error("No payment method data available to export");
      return;
    }
    const headers = ["ID", "Method Name", "Code", "Status"];
    const rows = methods.map((m) => [m.id, m.payment_method_name, m.code, m.is_active ? "ACTIVE" : "INACTIVE"]);
    downloadCsv("lux_payment_methods_report.csv", headers, rows);
    toast.success("Payment methods report downloaded as CSV");
  };

  const handleOpenEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setName(m.payment_method_name);
    setCode(m.code);
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in method name and code");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await apiClient.put(`/api/payment-methods/${editingId}`, {
          payment_method_name: name.trim(),
          code: code.trim(),
        });
        toast.success(`Payment method "${name}" updated successfully`);
      } else {
        await apiClient.post("/api/payment-methods", {
          payment_method_name: name.trim(),
          code: code.trim(),
          is_active: true,
        });
        toast.success("Payment method created successfully");
      }

      setName("");
      setCode("");
      setEditingId(null);
      setIsCreating(false);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save payment method");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await apiClient.patch(`/api/payment-methods/${id}/set-default`);
      toast.success("Updated active payment method");
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update payment method");
    }
  };

  const handleDelete = async (id: number, methodName: string) => {
    if (!confirm(`Are you sure you want to delete payment method "${methodName}"?`)) return;

    try {
      await apiClient.delete(`/api/payment-methods/${id}`);
      toast.success(`Payment method "${methodName}" deleted`);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete payment method");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Methods</h2>
          <p className="text-sm text-muted-foreground">
            Configure checkout payment providers and default transaction options
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading || methods.length === 0}>
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
                setCode("");
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
                <PlusIcon className="size-4 mr-1.5" /> Add Payment Method
              </>
            )}
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="border border-border/80 bg-card shadow-xs animate-in fade-in-50 duration-200">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold">
              {editingId ? `Edit Payment Method #${editingId}` : "New Payment Method"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Configure payment provider code (e.g. STRIPE, PAYPAL, CREDIT_CARD)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Method Name *</label>
                  <Input
                    placeholder="e.g. Credit / Debit Card"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Code Identifier *</label>
                  <Input
                    placeholder="e.g. CREDIT_CARD"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
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
                  {editingId ? "Update Method" : "Save Payment Method"}
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
                  <TableHead className="w-16 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">ID</TableHead>
                  <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Method Name</TableHead>
                  <TableHead className="w-36 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Code Identifier</TableHead>
                  <TableHead className="w-32 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="w-36 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin mx-auto mb-2" />
                      Loading payment methods...
                    </TableCell>
                  </TableRow>
                ) : methods.length > 0 ? (
                  methods.map((method) => (
                    <TableRow key={method.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3 font-mono text-xs font-semibold">#{method.id}</TableCell>
                      <TableCell className="px-4 py-3 font-medium text-foreground text-xs">{method.payment_method_name}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">{method.code}</TableCell>
                      <TableCell className="px-4 py-3">
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="cursor-pointer"
                          title="Click to toggle active status"
                        >
                          <Badge variant={method.is_active ? "secondary" : "outline"} className="font-mono text-[10px]">
                            {method.is_active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(method)}
                          title="Edit payment method"
                        >
                          <Edit3Icon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(method.id, method.payment_method_name)}
                          title="Delete payment method"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <CreditCardIcon className="size-8 stroke-[1.2] mx-auto mb-2 text-muted-foreground/50" />
                      No payment methods configured in the database.
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
