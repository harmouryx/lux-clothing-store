"use client";

import React, { useEffect, useState } from "react";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { getOrders } from "@/lib/services/orders";
import { getProducts } from "@/lib/services/products";
import { Order, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2Icon, ShoppingBagIcon, PackageIcon } from "lucide-react";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [ordersData, productsData] = await Promise.all([
          getOrders().catch(() => []),
          getProducts().catch(() => []),
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute live business metrics
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "shipped")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const pendingOrders = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards with Live Numbers */}
      <SectionCards
        totalRevenue={totalRevenue}
        totalOrders={orders.length}
        totalProducts={products.length}
        pendingOrders={pendingOrders}
      />

      {/* Interactive Sales Chart */}
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <ChartAreaInteractive />
      </div>

      {/* 2-Column Section: Recent Orders & Catalog Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <Card className="border bg-card shadow-xs overflow-hidden">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBagIcon className="size-4 text-slate-700" /> Recent Orders ({orders.length})
              </span>
              <a href="/dashboard/orders" className="text-xs text-slate-600 hover:underline">
                View all
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full border-collapse">
                <TableHeader className="bg-muted/40 border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-32 px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Order ID</TableHead>
                    <TableHead className="w-32 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Total</TableHead>
                    <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                        <Loader2Icon className="size-4 animate-spin mx-auto mb-1" /> Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3 font-mono text-xs font-semibold">ORD-{order.id}</TableCell>
                        <TableCell className="px-4 py-3 text-right font-mono font-bold text-xs">${Number(order.total_amount || 0).toFixed(2)}</TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant={order.status === "paid" ? "secondary" : "outline"}
                            className="text-[10px] font-mono uppercase"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                        No recent activity recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Live Catalog & Stock Highlights */}
        <Card className="border bg-card shadow-xs overflow-hidden">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PackageIcon className="size-4 text-slate-700" /> Top Catalog Items ({products.length})
              </span>
              <a href="/dashboard/products" className="text-xs text-slate-600 hover:underline">
                Manage products
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full border-collapse">
                <TableHeader className="bg-muted/40 border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Product Name</TableHead>
                    <TableHead className="w-28 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Base Price</TableHead>
                    <TableHead className="w-24 px-4 py-3 text-right font-semibold text-xs text-muted-foreground">Variants</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                        <Loader2Icon className="size-4 animate-spin mx-auto mb-1" /> Loading products...
                      </TableCell>
                    </TableRow>
                  ) : products.length > 0 ? (
                    products.slice(0, 5).map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3 font-medium text-xs">{product.name}</TableCell>
                        <TableCell className="px-4 py-3 text-right font-mono font-bold text-xs">
                          ${Number(product.base_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                          {product.variants?.length || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                        No products registered.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
