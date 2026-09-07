"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, PackageIcon, ShoppingBagIcon, DollarSignIcon } from "lucide-react";

interface SectionCardsProps {
  totalRevenue?: number;
  totalOrders?: number;
  totalProducts?: number;
  pendingOrders?: number;
}

export function SectionCards({
  totalRevenue = 0,
  totalOrders = 0,
  totalProducts = 0,
  pendingOrders = 0,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardDescription>Total Gross Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            ${totalRevenue.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-emerald-400 text-emerald-600">
              <DollarSignIcon className="size-3" /> Live Sales
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground flex items-center gap-1">
            Calculated from paid orders <TrendingUpIcon className="size-3.5 text-emerald-600" />
          </div>
          <span>Real-time transaction volume</span>
        </CardFooter>
      </Card>

      {/* Total Orders */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardDescription>Total Orders Processed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {totalOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <ShoppingBagIcon className="size-3" /> Orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">
            {pendingOrders} order{pendingOrders === 1 ? "" : "s"} pending fulfillment
          </div>
          <span>Tracked across storefront</span>
        </CardFooter>
      </Card>

      {/* Product Catalog */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardDescription>Active Catalog Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {totalProducts}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <PackageIcon className="size-3" /> Products
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Active in catalog</div>
          <span>Available for customer purchase</span>
        </CardFooter>
      </Card>

      {/* Fulfillment Status */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardDescription>Pending Actions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {pendingOrders}
          </CardTitle>
          <CardAction>
            <Badge
              variant={pendingOrders > 0 ? "secondary" : "outline"}
              className="gap-1"
            >
              Action Needed
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Requires review or payment</div>
          <span>Updated dynamically</span>
        </CardFooter>
      </Card>
    </div>
  );
}
