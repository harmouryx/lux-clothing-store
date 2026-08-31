"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Order } from "@/lib/types";
import { getOrders, markOrderAsPaid, markOrderAsShipped } from "@/lib/services/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        return <Badge variant="secondary" className="font-mono text-[10px]">PAID</Badge>;
      case "shipped":
        return <Badge variant="outline" className="font-mono text-[10px] border-emerald-500 text-emerald-600">SHIPPED</Badge>;
      case "pending":
      default:
        return <Badge variant="outline" className="font-mono text-[10px] border-amber-500/50 text-amber-600">PENDING</Badge>;
    }
  };

  const handleExportCsv = () => {
    if (orders.length === 0) {
      toast.error("No order data available to export");
      return;
    }
    const headers = ["Order ID", "Customer Name", "Customer Email", "Total Amount ($)", "Status", "Date"];
    const rows = orders.map((o: any) => [
      `ORD-${o.id}`,
      `${o.user?.name || "Customer"} ${o.user?.last_name || ""}`.trim(),
      o.user?.email || "N/A",
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
          <h2 className="text-2xl font-bold tracking-tight">Customer Orders</h2>
          <p className="text-sm text-muted-foreground">
            Track, verify, and fulfill orders processed through the storefront
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading || orders.length === 0}>
            <DownloadIcon className="size-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCwIcon className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/40 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-28 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Order ID</TableHead>
                  <TableHead className="w-48 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Customer</TableHead>
                  <TableHead className="w-32 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Total Amount</TableHead>
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
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : orders.length > 0 ? (
                  orders.map((order) => {
                    const s = (order.status || "").toLowerCase();
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3 font-mono text-xs font-semibold">
                          ORD-{order.id}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="font-medium text-xs">
                            {(order as any).user?.name || "Customer"} {(order as any).user?.last_name || ""}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                            {(order as any).user?.email || "No email"}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right font-mono font-semibold text-xs">
                          ${Number(order.total_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-3">{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right space-x-1">
                          {s === "pending" && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-[11px] gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleMarkAsPaid(order.id)}
                            >
                              <CheckCircle2Icon className="size-3" /> Mark Paid
                            </Button>
                          )}

                          {s === "paid" && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-[11px] gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                              onClick={() => handleMarkAsShipped(order.id)}
                            >
                              <TruckIcon className="size-3" /> Mark Shipped
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setSelectedOrder(order)}
                            title="View order detail"
                          >
                            <EyeIcon className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <ShoppingBagIcon className="size-8 stroke-[1.2] mx-auto mb-2 text-muted-foreground/50" />
                      No orders currently recorded in the system.
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
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Order #ORD-{selectedOrder?.id} Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-xs pt-2">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Status:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${Number(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>

              {selectedOrder.shipping_info && (
                <div className="border-b border-gray-100 pb-2 space-y-1">
                  <span className="text-gray-500 font-semibold block">Shipping & Tax Info:</span>
                  <p className="text-slate-800 font-medium">
                    {(selectedOrder.shipping_info as any).firstName} {(selectedOrder.shipping_info as any).lastName}
                  </p>
                  <p className="text-slate-600">
                    {(selectedOrder.shipping_info as any).streetAddress}, {(selectedOrder.shipping_info as any).city},{" "}
                    {(selectedOrder.shipping_info as any).country}
                  </p>
                  {(selectedOrder.shipping_info as any).taxId && (
                    <p className="text-[11px] font-mono text-slate-700 pt-0.5">
                      Tax ID / RUC / VAT: {(selectedOrder.shipping_info as any).taxId}
                    </p>
                  )}
                </div>
              )}

              {selectedOrder.details && selectedOrder.details.length > 0 && (
                <div className="space-y-2">
                  <span className="text-gray-500 font-semibold block">Order Items:</span>
                  <div className="space-y-1.5">
                    {selectedOrder.details.map((d: any) => (
                      <div key={d.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {d.product_info?.product_id ? `Variant #${d.product_variant_id}` : `Item #${d.id}`}
                          </p>
                          <p className="text-[10px] text-gray-500">Qty: {d.quantity}</p>
                        </div>
                        <span className="font-mono font-bold text-slate-900">${Number(d.unit_price * d.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
