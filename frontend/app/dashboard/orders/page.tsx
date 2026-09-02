"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Order } from "@/lib/types";
import { getOrders, markOrderAsPaid, markOrderAsShipped } from "@/lib/services/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadCsv } from "@/lib/utils/export-csv";
import {
  ShoppingBagIcon,
  EyeIcon,
  Loader2Icon,
  RefreshCwIcon,
  CheckCircle2Icon,
  TruckIcon,
  DownloadIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID" | "SHIPPED" | "CANCELLED">("ALL");

  const loadData = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load dashboard orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsPaid = async (id: number | string) => {
    try {
      await markOrderAsPaid(id);
      toast.success(`Order #${id} marked as PAID`);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update order status";
      toast.error(msg);
    }
  };

  const handleMarkAsShipped = async (id: number | string) => {
    try {
      await markOrderAsShipped(id);
      toast.success(`Order #${id} marked as SHIPPED`);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update order status";
      toast.error(msg);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            PAID
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            SHIPPED
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            CANCELLED
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            PENDING
          </span>
        );
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { ALL: orders.length, PENDING: 0, PAID: 0, SHIPPED: 0, CANCELLED: 0 };
    orders.forEach((o) => {
      const s = (o.status || "").toUpperCase();
      if (s === "PENDING") counts.PENDING++;
      else if (s === "PAID") counts.PAID++;
      else if (s === "SHIPPED") counts.SHIPPED++;
      else if (s === "CANCELLED") counts.CANCELLED++;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch =
        statusFilter === "ALL" || (order.status || "").toUpperCase() === statusFilter;

      if (!statusMatch) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const orderIdStr = `ord-${order.id}`.toLowerCase();
      const customerName = `${order.shipping_info?.firstName || ""} ${order.shipping_info?.lastName || ""} ${order.user?.name || ""}`.toLowerCase();
      const email = `${order.user?.email || (order.shipping_info as any)?.email || ""}`.toLowerCase();
      const city = `${(order.shipping_info as any)?.city || ""}`.toLowerCase();

      return (
        orderIdStr.includes(q) ||
        String(order.id).includes(q) ||
        customerName.includes(q) ||
        email.includes(q) ||
        city.includes(q)
      );
    });
  }, [orders, statusFilter, searchQuery]);

  const handleExportCsv = () => {
    if (orders.length === 0) {
      toast.error("No order data available to export");
      return;
    }
    const headers = ["Order ID", "Customer Name", "Customer Email", "Total Amount ($)", "Status", "Date"];
    const rows = filteredOrders.map((o: any) => [
      `ORD-${o.id}`,
      `${o.shipping_info?.firstName || o.user?.name || "Customer"} ${o.shipping_info?.lastName || o.user?.last_name || ""}`.trim(),
      o.user?.email || o.shipping_info?.email || "N/A",
      Number(o.total_amount || 0).toFixed(2),
      o.status || "pending",
      o.created_at ? new Date(o.created_at).toLocaleDateString() : "N/A",
    ]);
    downloadCsv("lux_orders_report.csv", headers, rows);
    toast.success("Orders report downloaded as CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Customer Orders</h2>
          <p className="text-sm text-muted-foreground">
            Track, verify, and fulfill orders processed through the storefront
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={loading || filteredOrders.length === 0}
            className="text-xs border-border"
          >
            <DownloadIcon className="size-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="text-xs border-border"
          >
            <RefreshCwIcon className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "PENDING", "PAID", "SHIPPED", "CANCELLED"] as const).map((tab) => {
            const count = statusCounts[tab];
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{tab === "ALL" ? "All Orders" : tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-border text-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by ID, client, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 pl-8.5 pr-8 text-xs bg-background border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border border-border bg-card shadow-xs overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Order ID</TableHead>
                  <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Customer</TableHead>
                  <TableHead className="w-32 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Total</TableHead>
                  <TableHead className="w-28 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="w-32 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Date</TableHead>
                  <TableHead className="w-44 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin mx-auto mb-2" />
                      Loading customer orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const s = (order.status || "").toLowerCase();
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3 font-mono font-bold text-xs text-foreground">
                          ORD-{order.id}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="font-medium text-xs text-foreground">
                              {order.shipping_info?.firstName
                                ? `${order.shipping_info.firstName} ${order.shipping_info.lastName || ""}`.trim()
                                : (order as any).user?.name || "Anonymous Client"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {(order as any).user?.email || (order.shipping_info as any)?.email || "Direct purchase"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right font-mono font-bold text-xs text-foreground">
                          ${Number(order.total_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-3">{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {s === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[11px] gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-medium cursor-pointer"
                                onClick={() => handleMarkAsPaid(order.id)}
                              >
                                <CheckCircle2Icon className="size-3" /> Mark Paid
                              </Button>
                            )}

                            {s === "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[11px] gap-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 font-medium cursor-pointer"
                                onClick={() => handleMarkAsShipped(order.id)}
                              >
                                <TruckIcon className="size-3" /> Mark Shipped
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => setSelectedOrder(order)}
                              title="View order detail"
                            >
                              <EyeIcon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <ShoppingBagIcon className="size-8 stroke-[1.2] mx-auto mb-2 text-muted-foreground/50" />
                      {searchQuery || statusFilter !== "ALL"
                        ? "No orders match your filter criteria."
                        : "No orders currently recorded in the system."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg bg-card text-foreground border-border rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Order #ORD-{selectedOrder?.id} — Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (() => {
            const status = (selectedOrder.status || "").toLowerCase();

            // Try to parse payment_reference as receipt JSON
            let receiptData: { type: string; filename: string; timestamp: string; receipt_data: string } | null = null;
            try {
              const ref = (selectedOrder as any).payment_reference;
              if (typeof ref === "string" && ref.startsWith("{")) {
                const parsed = JSON.parse(ref);
                if (parsed.type === "BANK_TRANSFER_RECEIPT") receiptData = parsed;
              }
            } catch {
              // Not a JSON receipt reference — plain string
            }

            return (
              <div className="space-y-4 text-xs pt-2">
                {/* Status */}
                <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground font-medium">Total Amount:</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    ${Number(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground font-medium">Payment Method:</span>
                  <span className="font-mono text-[11px] text-foreground">
                    {(selectedOrder as any).payment_method?.payment_method_name ||
                      (receiptData ? "Bank Transfer" : "Card / Other")}
                  </span>
                </div>

                {/* Bank Transfer Receipt */}
                {receiptData && (
                  <div className="border-b border-border/40 pb-3 space-y-2">
                    <p className="font-semibold text-foreground">Payment Receipt:</p>
                    <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">File:</span>
                        <span className="font-mono text-foreground truncate max-w-[160px]">{receiptData.filename}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="font-mono text-foreground">
                          {new Date(receiptData.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {receiptData.receipt_data?.startsWith("data:image") ? (
                        <div className="mt-2 rounded-lg overflow-hidden border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={receiptData.receipt_data}
                            alt="Payment receipt"
                            className="w-full max-h-48 object-contain bg-white"
                          />
                        </div>
                      ) : receiptData.receipt_data?.startsWith("data:application/pdf") ? (
                        <a
                          href={receiptData.receipt_data}
                          download={receiptData.filename}
                          className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg border border-border bg-background text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          Download PDF Receipt
                        </a>
                      ) : null}
                    </div>

                    {/* Pending review notice */}
                    {status === "pending" && (
                      <div className="px-3 py-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                        Verify the receipt above before marking this order as Paid.
                      </div>
                    )}
                  </div>
                )}

                {/* Shipping Info */}
                {selectedOrder.shipping_info && (
                  <div className="border-b border-border/40 pb-2.5 space-y-1">
                    <span className="text-muted-foreground font-semibold block">Shipping & Tax Info:</span>
                    <p className="text-foreground font-medium">
                      {(selectedOrder.shipping_info as any).firstName} {(selectedOrder.shipping_info as any).lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {(selectedOrder.shipping_info as any).streetAddress}, {(selectedOrder.shipping_info as any).city},{" "}
                      {(selectedOrder.shipping_info as any).country}
                    </p>
                    {(selectedOrder.shipping_info as any).taxId && (
                      <p className="text-[11px] font-mono text-foreground/80 pt-0.5">
                        Tax ID / RUC: {(selectedOrder.shipping_info as any).taxId}
                      </p>
                    )}
                  </div>
                )}

                {/* Order Items */}
                {selectedOrder.details && selectedOrder.details.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground font-semibold block">Order Items:</span>
                    <div className="space-y-1.5">
                      {selectedOrder.details.map((d: any) => (
                        <div key={d.id} className="flex justify-between items-center bg-muted/40 p-2.5 rounded-lg border border-border/60">
                          <div>
                            <p className="font-semibold text-foreground">
                              {d.product_info?.sku ? `SKU: ${d.product_info.sku}` : `Variant #${d.product_variant_id}`}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Qty: {d.quantity}</p>
                          </div>
                          <span className="font-mono font-bold text-foreground">${Number(d.unit_price * d.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons at bottom of dialog */}
                {status === "pending" && (
                  <div className="pt-3 border-t border-border/40 flex gap-2 justify-end">
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                      onClick={() => {
                        handleMarkAsPaid(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                    >
                      <CheckCircle2Icon className="size-3.5" />
                      Confirm Payment & Mark Paid
                    </Button>
                  </div>
                )}

                {status === "paid" && (
                  <div className="pt-3 border-t border-border/40 flex gap-2 justify-end">
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                      onClick={() => {
                        handleMarkAsShipped(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                    >
                      <TruckIcon className="size-3.5" />
                      Mark as Shipped
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
