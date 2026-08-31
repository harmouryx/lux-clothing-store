"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { apiClient, fetchCsrfToken } from "@/lib/api";
import { toast } from "sonner";
import {
  CreditCardIcon,
  ShoppingBagIcon,
  Loader2Icon,
  CheckCircle2Icon,
} from "lucide-react";

interface PaymentMethodOption {
  id: number;
  payment_method_name: string;
  code: string;
  is_active: boolean;
}

export default function CheckOutForm() {
  const { items, subtotal, clearCart } = useCart();

  const [shipping, setShipping] = useState({
    name: "",
    lastName: "",
    email: "",
    taxId: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  });

  const [payment, setPayment] = useState({
    cardNumber: "",
    exp: "",
    cvc: "",
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const shippingCost = subtotal > 150 ? 0 : 15;
  const estimatedTax = subtotal * 0.08;
  const totalAmount = subtotal + shippingCost + estimatedTax;

  useEffect(() => {
    async function loadPaymentMethods() {
      try {
        const res = await apiClient.get<PaymentMethodOption[]>("/api/payment-methods");
        const list: PaymentMethodOption[] = Array.isArray(res.data) ? res.data : (res.data as { data?: PaymentMethodOption[] })?.data || [];
        setPaymentMethods(list);
        if (list.length > 0) {
          const defaultMethod = list.find((m: PaymentMethodOption) => m.is_active) || list[0];
          setSelectedPaymentMethodId(defaultMethod.id);
        }
      } catch {
        // Fallback default ID 1
      }
    }
    loadPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipping.name || !shipping.email || !shipping.address || !shipping.city) {
      toast.error("Please complete all required shipping fields");
      return;
    }

    if (!payment.cardNumber || !payment.exp || !payment.cvc) {
      toast.error("Please enter complete payment details");
      return;
    }

    setLoading(true);
    try {
      await fetchCsrfToken();

      // Transform cart items to payload format expected by backend OrdersController
      const orderItems = items.map((item) => {
        let variantId = item.variant?.id;
        if (!variantId && item.product.variants && item.product.variants.length > 0) {
          variantId = item.product.variants[0].id;
        }
        return {
          product_variant_id: variantId || 1,
          quantity: item.quantity,
        };
      });

      const payload = {
        payment_method_id: selectedPaymentMethodId,
        payment_reference: `CARD-${payment.cardNumber.slice(-4) || "8888"}`,
        shipping_info: {
          firstName: shipping.name.trim(),
          lastName: shipping.lastName.trim() || "N/A",
          country: shipping.country,
          streetAddress: shipping.address.trim(),
          city: shipping.city.trim(),
          taxId: shipping.taxId.trim() || undefined,
        },
        items: orderItems,
      };

      const res = await apiClient.post("/api/orders", payload);

      if (res.data?.success || res.status === 201) {
        setOrderComplete(true);
        clearCart();
        toast.success("Order placed successfully! Thank you for shopping with LUX.");
      } else {
        toast.error(res.data?.message || "Order submission failed.");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.items?.[0] ||
        "Order processing error. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="w-full max-w-lg mx-auto text-center p-8 rounded-3xl border border-gray-200 bg-white space-y-4">
        <div className="size-14 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2Icon className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Thank You For Your Order!</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Your order has been placed successfully. A receipt has been sent to{" "}
          <span className="font-semibold text-black">{shipping.email}</span>.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link
            href="/profile"
            className="inline-block px-6 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-slate-800 hover:bg-gray-50 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto text-center p-12 rounded-3xl border border-gray-200 bg-white space-y-4">
        <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-500">
          <ShoppingBagIcon className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500">
          You don&apos;t have any items in your bag yet.
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-block px-8 py-3 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Shipping & Payment */}
      <div className="space-y-6 lg:col-span-7">
        {/* Shipping Container */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-4">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider">
            1. Shipping Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">First Name *</label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="Jane"
                value={shipping.name}
                onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Last Name</label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="Doe"
                value={shipping.lastName}
                onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Email *</label>
              <input
                type="email"
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="jane@example.com"
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Tax ID / RUC / VAT (Optional)</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="Tax ID e.g. 1792003849001"
                value={shipping.taxId}
                onChange={(e) => setShipping({ ...shipping, taxId: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Street Address *</label>
            <input
              className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              placeholder="123 Luxury Ave, Suite 400"
              value={shipping.address}
              onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">City *</label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="New York"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Postal Code</label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="10001"
                value={shipping.postalCode}
                onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Country</label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                value={shipping.country}
                onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Payment Container */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-4">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center justify-between">
            <span>2. Payment Information</span>
            <CreditCardIcon className="size-4 text-gray-500" />
          </h3>

          {paymentMethods.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Select Payment Method</label>
              <select
                value={selectedPaymentMethodId}
                onChange={(e) => setSelectedPaymentMethodId(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.payment_method_name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Card Number *</label>
            <input
              className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 font-mono border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              placeholder="4532 •••• •••• 8888"
              maxLength={19}
              value={payment.cardNumber}
              onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Expires (MM/YY) *</label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 font-mono border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="12/28"
                maxLength={5}
                value={payment.exp}
                onChange={(e) => setPayment({ ...payment, exp: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">CVC / CVV *</label>
              <input
                type="password"
                className="w-full h-10 px-3 rounded-lg bg-[#ECECEC] text-xs text-slate-900 font-mono border-0 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="123"
                maxLength={4}
                value={payment.cvc}
                onChange={(e) => setPayment({ ...payment, cvc: e.target.value })}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-4 sticky top-24">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider">
            Order Summary ({items.length})
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{item.product.name}</p>
                  <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-mono font-semibold">
                {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-mono font-semibold">${estimatedTax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="font-mono">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              {loading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                `Complete Order — $${totalAmount.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}