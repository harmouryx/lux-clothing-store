"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlobeIcon, HelpCircleIcon, ChevronRightIcon } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [lang, setLang] = useState<"ES" | "EN">("ES");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("lux_language_pref") as "ES" | "EN" | null;
      if (savedLang === "ES" || savedLang === "EN") {
        setLang(savedLang);
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const handleLanguageChange = (newLang: "ES" | "EN") => {
    setLang(newLang);
    try {
      localStorage.setItem("lux_language_pref", newLang);
      toast.success(newLang === "ES" ? "Idioma cambiado a Español" : "Language switched to English");
    } catch {
      // Ignore storage write error
    }
  };

  const faqItems = lang === "ES" ? [
    {
      q: "¿Cuánto tiempo tarda el envío de las prendas?",
      a: "Los envíos nacionales en Ecuador tardan de 1 a 3 días hábiles. Los envíos internacionales se gestionan en 4 a 7 días hábiles vía Courier express.",
    },
    {
      q: "¿Cómo garantizan la autenticidad y calidad de las colecciones?",
      a: "Todas nuestras prendas y piezas de archivo son diseñadas y confeccionadas bajo estrictos estándares textiles premium con algodones pesados y acabados de alta costura.",
    },
    {
      q: "¿Cómo puedo rastrear mi orden?",
      a: "Una vez completada la compra, puedes acceder a la sección 'My Orders' dentro de tu perfil para consultar el estado en tiempo real (PENDING, PAID, SHIPPED).",
    },
    {
      q: "¿Qué métodos de pago son aceptados?",
      a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), PayPal y transferencias bancarias directas.",
    },
    {
      q: "¿Cómo configuro la seguridad 2FA en mi cuenta?",
      a: "Ingresa a 'My Profile' > 'Two-Factor Authentication' para escanear el código QR con Google Authenticator o Authy y asegurar tus compras.",
    },
  ] : [
    {
      q: "How long does order shipping take?",
      a: "Domestic shipments take 1 to 3 business days. International express deliveries take between 4 to 7 business days.",
    },
    {
      q: "How do you ensure authenticity and quality?",
      a: "All our apparel pieces and archive drops are crafted under premium textile standards with heavy cotton fabrics and luxury tailoring.",
    },
    {
      q: "How can I track my order status?",
      a: "After purchasing, visit 'My Orders' inside your profile to view live status updates (PENDING, PAID, SHIPPED).",
    },
    {
      q: "What payment methods are supported?",
      a: "We support Credit/Debit Cards, PayPal, and direct bank wire transfers.",
    },
    {
      q: "How do I setup 2FA security on my account?",
      a: "Navigate to 'My Profile' > 'Two-Factor Authentication' to scan your QR code with Google Authenticator or Authy.",
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-8 text-slate-800">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 items-start">
          {/* Logo column with PNG logo */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block transition-opacity hover:opacity-85">
              <Image
                src="/lux_assets/lux_logo_1.png"
                alt="LUX Logo"
                width={80}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              {lang === "ES"
                ? "Moda de lujo contemporánea, prendas de archivo y colecciones atemporales seleccionadas con precisión."
                : "Contemporary luxury fashion, curated archive garments, and timeless designer collections."}
            </p>

            {/* Language Switcher */}
            <div className="pt-2 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-slate-800 shadow-2xs">
                <GlobeIcon className="size-3.5 text-gray-500" />
                <button
                  type="button"
                  onClick={() => handleLanguageChange("ES")}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    lang === "ES"
                      ? "bg-slate-900 text-white font-bold"
                      : "text-gray-500 hover:text-slate-900"
                  }`}
                >
                  ES
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("EN")}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    lang === "EN"
                      ? "bg-slate-900 text-white font-bold"
                      : "text-gray-500 hover:text-slate-900"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Products column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              {lang === "ES" ? "PRODUCTOS" : "PRODUCTS"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  {lang === "ES" ? "Ropa & Streetwear" : "Clothes & Streetwear"}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  {lang === "ES" ? "Colección Archive" : "Archive Collection"}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  {lang === "ES" ? "Ver Todo el Catálogo" : "Shop All Catalog"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              {lang === "ES" ? "SOPORTE" : "SUPPORT"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <button
                  type="button"
                  onClick={() => setIsFaqOpen(true)}
                  className="hover:text-black transition-colors cursor-pointer text-left flex items-center gap-1 font-medium text-slate-900"
                >
                  <HelpCircleIcon className="size-3.5 text-gray-500" />
                  {lang === "ES" ? "Preguntas Frecuentes (FAQ)" : "FAQ & Help Center"}
                </button>
              </li>
              <li>
                <Link href="/profile" className="hover:text-black transition-colors">
                  {lang === "ES" ? "Mis Órdenes & 2FA" : "My Orders & 2FA"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-black transition-colors">
                  {lang === "ES" ? "Términos del Servicio" : "Terms of Service"}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors">
                  {lang === "ES" ? "Política de Privacidad" : "Privacy Policy"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              {lang === "ES" ? "COMPAÑÍA" : "COMPANY"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <span className="text-gray-700 font-medium">LUX Store Inc.</span>
              </li>
              <li>
                <span className="text-gray-500">Quito, Ecuador</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom legal line */}
        <div className="mt-16 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 LUX Store. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-black transition-colors">
              {lang === "ES" ? "Términos" : "Terms"}
            </Link>
            <Link href="/privacy" className="hover:text-black transition-colors">
              {lang === "ES" ? "Privacidad" : "Privacy"}
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Dialog Modal */}
      <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6 bg-white border border-slate-200">
          <DialogHeader className="space-y-1">
            <div className="size-9 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center mb-1">
              <HelpCircleIcon className="size-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {lang === "ES" ? "Preguntas Frecuentes (FAQ)" : "Frequently Asked Questions (FAQ)"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {lang === "ES"
                ? "Respuestas a las dudas más comunes sobre envíos, pagos y compras."
                : "Helpful answers to common questions about shipping, payments, and orders."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
            {faqItems.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                <div className="flex items-start gap-2">
                  <ChevronRightIcon className="size-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <h4 className="text-xs font-bold text-slate-900">{item.q}</h4>
                </div>
                <p className="text-xs text-slate-600 pl-5 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsFaqOpen(false)}
              className="bg-slate-900 hover:bg-black text-white text-xs font-semibold"
            >
              {lang === "ES" ? "Entendido" : "Got it"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}