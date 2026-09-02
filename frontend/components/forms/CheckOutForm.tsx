"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";
import { apiClient, fetchCsrfToken } from "@/lib/api";
import { toast } from "sonner";
import {
  CreditCardIcon,
  ShoppingBagIcon,
  Loader2Icon,
  CheckCircle2Icon,
  Building2Icon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentMethodOption {
  id: number;
  payment_method_name: string;
  code: string;
  is_active: boolean;
}

export default function CheckOutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { t, lang } = useLanguage();

  const [shipping, setShipping] = useState({
    name: "",
    lastName: "",
    email: "",
    taxId: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Ecuador",
  });

  const [payment, setPayment] = useState({
    cardholderName: "",
    cardNumber: "",
    exp: "",
    cvc: "",
    bankReference: "",
    paypalEmail: "",
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bankReceiptBase64, setBankReceiptBase64] = useState<string>("");
  const [bankReceiptName, setBankReceiptName] = useState<string>("");

  const shippingCost = subtotal > 150 ? 0 : 15;
  const estimatedTax = subtotal * 0.15;
  const totalAmount = subtotal + shippingCost + estimatedTax;

  useEffect(() => {
    async function loadPaymentMethods() {
      try {
        const res = await apiClient.get<PaymentMethodOption[]>("/api/payment-methods");
        const list: PaymentMethodOption[] = Array.isArray(res.data)
          ? res.data
          : (res.data as { data?: PaymentMethodOption[] })?.data || [];
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

  const activeMethod = paymentMethods.find((m) => m.id === selectedPaymentMethodId);
  const isBankTransfer =
    activeMethod?.code === "BANK_TRANSFER" ||
    activeMethod?.code === "TRANSFER" ||
    (activeMethod?.payment_method_name || "").toLowerCase().includes("transfer");
  const isPayPal =
    activeMethod?.code === "PAYPAL" ||
    (activeMethod?.payment_method_name || "").toLowerCase().includes("paypal");

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpDate = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    return raw;
  };

  const handleBankReceiptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(lang === "ES" ? "El comprobante no puede superar 5MB." : "Receipt file must be under 5MB.");
      return;
    }
    setBankReceiptName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBankReceiptBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipping.name.trim() || !shipping.email.trim() || !shipping.address.trim() || !shipping.city.trim()) {
      toast.error(lang === "ES" ? "Por favor completa los campos de envío requeridos." : "Please fill in all required shipping fields.");
      return;
    }

    if (isBankTransfer && !bankReceiptBase64) {
      toast.error(
        lang === "ES"
          ? "Debes adjuntar el comprobante de transferencia para proceder."
          : "You must upload the payment transfer receipt to proceed."
      );
      return;
    }

    if (!isBankTransfer && !isPayPal) {
      const rawCard = payment.cardNumber.replace(/\s/g, "");
      if (rawCard.length < 13 || !payment.exp || payment.cvc.length < 3) {
        toast.error(lang === "ES" ? "Por favor ingresa datos válidos de tarjeta de crédito/débito." : "Please enter valid credit/debit card details.");
        return;
      }
    }

    if (items.length === 0) {
      toast.error(lang === "ES" ? "Tu bolsa de compras está vacía." : "Your shopping bag is empty.");
      return;
    }

    setLoading(true);
    try {
      await fetchCsrfToken();

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

      // Build payment_reference: for bank transfers include the receipt as base64
      let reference = "ORD-REF";
      if (isBankTransfer) {
        // Store receipt as JSON-encoded reference so admin can view it
        reference = JSON.stringify({
          type: "BANK_TRANSFER_RECEIPT",
          filename: bankReceiptName,
          timestamp: new Date().toISOString(),
          receipt_data: bankReceiptBase64,
        });
      } else if (isPayPal) {
        reference = `PAYPAL-${Date.now().toString().slice(-6)}`;
      } else {
        const rawCard = payment.cardNumber.replace(/\s/g, "");
        reference = `CARD-${rawCard.slice(-4) || "8888"}`;
      }

      const payload = {
        payment_method_id: selectedPaymentMethodId,
        payment_reference: reference,
        shipping_info: {
          firstName: shipping.name.trim(),
          lastName: shipping.lastName.trim() || "N/A",
          country: shipping.country,
          streetAddress: shipping.address.trim(),
          city: shipping.city.trim(),
          postalCode: shipping.postalCode.trim() || undefined,
          email: shipping.email.trim(),
          taxId: shipping.taxId.trim() || undefined,
        },
        items: orderItems,
      };

      const res = await apiClient.post("/api/orders", payload);

      if (res.data?.success || res.status === 201) {
        const orderData = res.data?.data || res.data?.order || { id: Date.now(), total_amount: totalAmount };
        setCreatedOrder(orderData);
        setIsSuccessModalOpen(true);
        clearCart();
        // No toast — the success modal takes over
      } else {
        toast.error(res.data?.message || (lang === "ES" ? "No se pudo procesar la orden." : "Order submission failed."));
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.items?.[0] ||
        (lang === "ES" ? "Error al procesar la orden. Verifica los datos ingresados." : "Order processing error. Please verify your information.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form Fields */}
        <div className="space-y-6 lg:col-span-7">
          {/* Shipping & Billing Container */}
          <div className="rounded-3xl border border-border bg-card p-7 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>{t("checkout.shipping_step", "1. Shipping & Billing Information")}</span>
              <Building2Icon className="size-4 text-muted-foreground" />
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("checkout.first_name", "First Name *")}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs"
                  placeholder="Paula"
                  value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("checkout.last_name", "Last Name")}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs"
                  placeholder="Buendia"
                  value={shipping.lastName}
                  onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("checkout.email", "Email Address *")}</label>
                <input
                  type="email"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs"
                  placeholder="paula.buendia@example.com"
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("checkout.tax_id", "Tax ID / RUC / Cédula")}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-mono focus:ring-1 focus:ring-primary shadow-2xs"
                  placeholder="1792384912001"
                  value={shipping.taxId}
                  onChange={(e) => setShipping({ ...shipping, taxId: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("checkout.address", "Delivery Address *")}</label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs"
                placeholder="Av. Amazonas y Naciones Unidas, Edificio Titanium"
                value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("checkout.city", "City *")}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs"
                  placeholder="Quito"
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("checkout.postal", "Postal Code")}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-mono focus:ring-1 focus:ring-primary shadow-2xs"
                  placeholder="170150"
                  value={shipping.postalCode}
                  onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("checkout.country", "Country")}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs"
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Container */}
          <div className="rounded-3xl border border-border bg-card p-7 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>{t("checkout.payment_step", "2. Payment Method")}</span>
              <CreditCardIcon className="size-4 text-muted-foreground" />
            </h3>

            {paymentMethods.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ES" ? "Seleccionar Método de Pago" : "Select Payment Method"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {paymentMethods.map((m) => {
                    const isSelected = selectedPaymentMethodId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethodId(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary shadow-2xs"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                        }`}
                      >
                        <span className="text-xs font-bold text-foreground block truncate">
                          {m.payment_method_name}
                        </span>
                        <span className="text-[10px] font-mono opacity-70 mt-1">
                          {m.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DYNAMIC VIEW: Bank Transfer + Receipt Upload */}
            {isBankTransfer ? (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Building2Icon className="size-4 text-primary" />
                  <span>{t("checkout.bank_info_title", "Official Corporate Bank Details")}</span>
                </div>

                {/* Bank account data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-background p-4 rounded-xl border border-border">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cuenta</p>
                    <p className="font-mono text-foreground"><span className="text-muted-foreground">Banco:</span> Banco Pichincha</p>
                    <p className="font-mono text-foreground"><span className="text-muted-foreground">Tipo:</span> Cuenta Corriente</p>
                    <p className="font-mono font-bold text-foreground"><span className="text-muted-foreground font-normal">No.:</span> 2200192837</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Beneficiario</p>
                    <p className="font-mono text-foreground">LUX Store Inc.</p>
                    <p className="font-mono text-foreground"><span className="text-muted-foreground">RUC:</span> 1792384912001</p>
                    <p className="font-bold font-mono text-foreground text-sm mt-1">
                      ${totalAmount.toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">monto exacto</span>
                    </p>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    {lang === "ES" ? "Adjuntar Comprobante de Pago *" : "Upload Payment Receipt *"}
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ES"
                      ? "Realiza la transferencia por el monto exacto y adjunta el comprobante (captura o PDF)."
                      : "Transfer the exact amount and attach your payment confirmation screenshot or PDF."}
                  </p>

                  {!bankReceiptBase64 ? (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border bg-background hover:bg-muted/30 transition-colors text-center">
                      <CheckCircle2Icon className="size-6 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">
                        {lang === "ES" ? "Haz clic para subir comprobante" : "Click to upload receipt"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">PNG, JPG, WEBP, PDF — máx. 5MB</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        className="hidden"
                        onChange={handleBankReceiptFile}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20">
                      <div className="size-12 rounded-lg border border-emerald-200 bg-white dark:bg-card overflow-hidden flex items-center justify-center shrink-0">
                        {bankReceiptBase64.startsWith("data:image") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bankReceiptBase64} alt="receipt" className="size-full object-cover" />
                        ) : (
                          <CheckCircle2Icon className="size-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">{bankReceiptName}</p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500">
                          {lang === "ES" ? "Comprobante adjunto correctamente" : "Receipt attached successfully"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setBankReceiptBase64(""); setBankReceiptName(""); }}
                        className="text-[11px] text-destructive hover:underline font-medium cursor-pointer shrink-0"
                      >
                        {lang === "ES" ? "Cambiar" : "Change"}
                      </button>
                    </div>
                  )}

                  <div className="px-3 py-2.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 text-[11px] text-amber-800 dark:text-amber-300">
                    {lang === "ES"
                      ? "La orden quedará en estado PENDIENTE hasta que el equipo de LUX verifique tu comprobante y confirme el pago."
                      : "Your order will stay PENDING until the LUX team verifies your receipt and confirms payment."}
                  </div>
                </div>
              </div>
            ) : isPayPal ? (
              /* DYNAMIC VIEW: PayPal */
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-950 dark:text-blue-200">
                  <ShieldCheckIcon className="size-4 text-blue-600" />
                  <span>PayPal Express Checkout</span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  {t("checkout.paypal_info", "Payment authorization will be verified via secure PayPal gateway.")}
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">PayPal Account Email</label>
                  <input
                    type="email"
                    className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs"
                    placeholder={shipping.email || "buyer@paypal.com"}
                    value={payment.paypalEmail}
                    onChange={(e) => setPayment({ ...payment, paypalEmail: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              /* DYNAMIC VIEW: Credit / Debit Card */
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("checkout.card_number", "Card Number *")}</label>
                  <input
                    className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-mono focus:ring-1 focus:ring-primary shadow-2xs"
                    placeholder="4532 •••• •••• 8888"
                    maxLength={19}
                    value={payment.cardNumber}
                    onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                    required={!isBankTransfer && !isPayPal}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">{t("checkout.exp", "Expires (MM/YY) *")}</label>
                    <input
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-mono focus:ring-1 focus:ring-primary shadow-2xs"
                      placeholder="12/28"
                      maxLength={5}
                      value={payment.exp}
                      onChange={(e) => setPayment({ ...payment, exp: formatExpDate(e.target.value) })}
                      required={!isBankTransfer && !isPayPal}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">{t("checkout.cvc", "CVC / CVV *")}</label>
                    <input
                      type="password"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground font-mono focus:ring-1 focus:ring-primary shadow-2xs"
                      placeholder="123"
                      maxLength={4}
                      value={payment.cvc}
                      onChange={(e) => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, "") })}
                      required={!isBankTransfer && !isPayPal}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-border bg-card p-7 space-y-4 sticky top-24 shadow-xs">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t("checkout.summary", "Order Summary")} ({items.length})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-border/40">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs pt-2 first:pt-0">
                  <div>
                    <p className="font-semibold text-foreground">{item.product.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.variant?.attributes?.size ? `Size: ${item.variant.attributes.size}` : ""} Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.subtotal", "Subtotal:")}</span>
                <span className="font-mono font-medium text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.shipping", "Express Shipping:")}</span>
                <span className="font-mono font-medium text-foreground">
                  {shippingCost === 0 ? t("cart.free_shipping", "FREE") : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.taxes", "Estimated Taxes (15% IVA):")}</span>
                <span className="font-mono font-medium text-foreground">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-sm font-bold text-foreground">
                <span>{t("cart.total", "Total Amount:")}</span>
                <span className="font-mono text-base">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full h-12 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-2" />
                  <span>{t("checkout.processing", "Processing Order...")}</span>
                </>
              ) : (
                <span>
                  {t("checkout.place_order", "Confirm & Place Order")} (${totalAmount.toFixed(2)})
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Thank You / Order Placed Native Shadcn UI Dialog */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl p-6 text-center shadow-2xl backdrop-blur-xl">
          <DialogHeader className="space-y-2">
            <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-1 shadow-xs">
              <CheckCircle2Icon className="size-6" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight">
              {isBankTransfer
                ? (lang === "ES" ? "¡Comprobante Registrado con Éxito!" : "Payment Receipt Received!")
                : t("thankyou.title", "Thank You For Your Order!")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {isBankTransfer
                ? (lang === "ES"
                    ? "Tu comprobante de transferencia bancaria fue adjuntado correctamente. Mientras nuestro equipo valida el depósito, ¡puedes continuar explorando el catálogo y añadir más piezas exclusivas!"
                    : "Your bank transfer receipt has been attached. While our team confirms the deposit, feel free to keep exploring our catalog for more pieces!")
                : (lang === "ES"
                    ? "Tu pago ha sido simulado y autorizado exitosamente. Hemos registrado tu pedido en el sistema."
                    : "Your payment has been successfully authorized. Your order is registered in our system.")}
            </DialogDescription>
          </DialogHeader>

          {createdOrder && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs space-y-2 text-left my-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">{t("thankyou.order_id", "Order Number:")}</span>
                <span className="font-mono font-bold text-foreground">ORD-{createdOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">
                  {lang === "ES" ? "Método de Pago:" : "Payment Method:"}
                </span>
                <span className="font-semibold text-foreground">
                  {activeMethod?.payment_method_name || (isBankTransfer ? "Transferencia Bancaria" : isPayPal ? "PayPal" : "Tarjeta de Crédito")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">{t("thankyou.total", "Total Amount:")}</span>
                <span className="font-mono font-bold text-foreground">${Number(createdOrder.total_amount || totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">{t("thankyou.status", "Status:")}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                  PENDING
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              asChild
              size="sm"
              className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              <Link href="/products">
                {lang === "ES" ? "Explorar Catálogo / Seguir Comprando" : "Continue Shopping in Catalog"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold border-border"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              <Link href="/profile">
                {t("thankyou.btn_orders", "View My Orders")}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}