"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ES" | "EN";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ES: {
    // Nav & Common
    "nav.home": "Inicio",
    "nav.products": "Catálogo",
    "nav.orders": "Mis Órdenes",
    "nav.profile": "Mi Perfil",
    "nav.dashboard": "Panel Admin",
    "nav.cart": "Bolsa",
    "nav.search": "Buscar productos...",
    "nav.login": "Iniciar Sesión",
    "nav.logout": "Cerrar Sesión",
    "nav.store": "Tienda",

    // Hero
    "hero.title": "Colecciones Archive & Atemporales",
    "hero.subtitle": "INDUMENTARIA DE LUJO Y DROPS EXCLUSIVOS",
    "hero.cta": "Explorar Colección",

    // Catalog & Products
    "catalog.title": "Línea Seleccionada",
    "catalog.subtitle": "Prendas de lujo y archivo textil confeccionadas con estética atemporal",
    "catalog.all": "Todas las Piezas",
    "catalog.apparel": "Ropa & Streetwear",
    "catalog.archive": "Archive Drops",
    "catalog.sort.featured": "Destacados",
    "catalog.sort.price_asc": "Precio: Menor a Mayor",
    "catalog.sort.price_desc": "Precio: Mayor a Menor",
    "catalog.empty.title": "No hay productos disponibles por ahora",
    "catalog.empty.desc": "Nuestro catálogo se actualiza continuamente. Los nuevos ingresos aparecerán aquí automáticamente.",
    "catalog.reset": "Restablecer Filtros",
    "catalog.add_to_cart": "Añadir a la Bolsa",

    // Product Details
    "detail.back": "Volver al Catálogo",
    "detail.sold_out": "AGOTADO",
    "detail.in_stock": "En Stock",
    "detail.available_units": "unidades disponibles",
    "detail.select_variant": "Seleccionar Variante (Talla / Color):",
    "detail.quantity": "Cantidad:",
    "detail.tax_included": "Incluye impuestos del sistema",
    "detail.add_button": "Añadir al Carrito",
    "detail.not_found": "Producto No Encontrado",
    "detail.not_found_desc": "El producto solicitado no existe o no está disponible en este momento.",

    // Cart & Checkout
    "cart.title": "Tu Bolsa de Compras",
    "cart.empty": "Tu bolsa está vacía",
    "cart.subtotal": "Subtotal:",
    "cart.taxes": "Impuestos Estimados:",
    "cart.shipping": "Envío Express:",
    "cart.free_shipping": "GRATIS",
    "cart.total": "Total a Pagar:",
    "cart.checkout": "Proceder al Pago",
    "cart.continue": "Continuar Comprando",

    // Checkout Form
    "checkout.title": "Finalizar Compra",
    "checkout.shipping_step": "1. Información de Envío y Facturación",
    "checkout.first_name": "Nombre *",
    "checkout.last_name": "Apellido",
    "checkout.email": "Correo Electrónico *",
    "checkout.tax_id": "Cédula / RUC / Tax ID",
    "checkout.address": "Dirección de Entrega *",
    "checkout.city": "Ciudad *",
    "checkout.postal": "Código Postal",
    "checkout.country": "País",
    "checkout.payment_step": "2. Método de Pago",
    "checkout.card_number": "Número de Tarjeta *",
    "checkout.exp": "Expiración (MM/AA) *",
    "checkout.cvc": "Código CVC / CVV *",
    "checkout.bank_info_title": "Datos de Cuenta Bancaria Oficial",
    "checkout.bank_name": "Banco: Banco Pichincha",
    "checkout.account_type": "Tipo: Cuenta Corriente",
    "checkout.account_number": "No. de Cuenta: 2200192837",
    "checkout.beneficiary": "Beneficiario: LUX Store Inc.",
    "checkout.ruc": "RUC: 1792384912001",
    "checkout.reference_label": "Número de Comprobante / Referencia de Transferencia",
    "checkout.reference_placeholder": "Ej: TRANSF-982341",
    "checkout.paypal_info": "Se procesará tu autorización mediante la pasarela segura de PayPal.",
    "checkout.place_order": "Confirmar y Pagar",
    "checkout.processing": "Procesando Orden...",
    "checkout.summary": "Resumen del Pedido",

    // Thank You Modal
    "thankyou.title": "¡Gracias por tu Compra!",
    "thankyou.desc": "Tu orden ha sido registrada exitosamente en nuestro sistema con estado PENDIENTE.",
    "thankyou.order_id": "Número de Orden:",
    "thankyou.total": "Monto Total:",
    "thankyou.status": "Estado:",
    "thankyou.email_notice": "Hemos enviado el comprobante digital a tu correo.",
    "thankyou.btn_orders": "Ver Mis Órdenes",
    "thankyou.btn_home": "Volver a la Tienda",

    // Footer & FAQ
    "footer.desc": "Moda de lujo contemporánea, prendas de archivo y colecciones atemporales seleccionadas con precisión.",
    "footer.products": "PRODUCTOS",
    "footer.support": "SOPORTE",
    "footer.company": "COMPAÑÍA",
    "footer.faq": "Preguntas Frecuentes (FAQ)",
    "footer.terms": "Términos del Servicio",
    "footer.privacy": "Política de Privacidad",
    "footer.my_orders": "Mis Órdenes & 2FA",
    "footer.rights": "Todos los derechos reservados.",
  },
  EN: {
    // Nav & Common
    "nav.home": "Home",
    "nav.products": "Catalog",
    "nav.orders": "My Orders",
    "nav.profile": "My Profile",
    "nav.dashboard": "Admin Dashboard",
    "nav.cart": "Bag",
    "nav.search": "Search pieces...",
    "nav.login": "Sign In",
    "nav.logout": "Sign Out",
    "nav.store": "Storefront",

    // Hero
    "hero.title": "Archive & Timeless Collections",
    "hero.subtitle": "CURATED LUXURY APPAREL & EXCLUSIVE DROPS",
    "hero.cta": "Explore Collection",

    // Catalog & Products
    "catalog.title": "Curated Lineup",
    "catalog.subtitle": "Explore our luxury apparel and archive collection designed with timeless aesthetics",
    "catalog.all": "All Pieces",
    "catalog.apparel": "Apparel & Tees",
    "catalog.archive": "Archive Drops",
    "catalog.sort.featured": "Featured",
    "catalog.sort.price_asc": "Price: Low to High",
    "catalog.sort.price_desc": "Price: High to Low",
    "catalog.empty.title": "No products available yet",
    "catalog.empty.desc": "Our catalog is currently being updated. New releases will appear here automatically.",
    "catalog.reset": "Reset Filters",
    "catalog.add_to_cart": "Add to Bag",

    // Product Details
    "detail.back": "Back to Lineup",
    "detail.sold_out": "SOLD OUT",
    "detail.in_stock": "In Stock",
    "detail.available_units": "units left",
    "detail.select_variant": "Select Variant (Size / Color):",
    "detail.quantity": "Quantity:",
    "detail.tax_included": "Includes system taxes",
    "detail.add_button": "Add to Bag",
    "detail.not_found": "Product Not Found",
    "detail.not_found_desc": "The requested product does not exist or is currently unavailable.",

    // Cart & Checkout
    "cart.title": "Your Shopping Bag",
    "cart.empty": "Your shopping bag is empty",
    "cart.subtotal": "Subtotal:",
    "cart.taxes": "Estimated Taxes:",
    "cart.shipping": "Express Shipping:",
    "cart.free_shipping": "FREE",
    "cart.total": "Total Amount:",
    "cart.checkout": "Proceed to Checkout",
    "cart.continue": "Continue Shopping",

    // Checkout Form
    "checkout.title": "Complete Checkout",
    "checkout.shipping_step": "1. Shipping & Billing Information",
    "checkout.first_name": "First Name *",
    "checkout.last_name": "Last Name",
    "checkout.email": "Email Address *",
    "checkout.tax_id": "Tax ID / RUC / VAT",
    "checkout.address": "Street Address *",
    "checkout.city": "City *",
    "checkout.postal": "Postal Code",
    "checkout.country": "Country",
    "checkout.payment_step": "2. Payment Method",
    "checkout.card_number": "Card Number *",
    "checkout.exp": "Expiration (MM/YY) *",
    "checkout.cvc": "CVC / CVV *",
    "checkout.bank_info_title": "Official Corporate Bank Details",
    "checkout.bank_name": "Bank: Banco Pichincha",
    "checkout.account_type": "Type: Checking Account",
    "checkout.account_number": "Account #: 2200192837",
    "checkout.beneficiary": "Beneficiary: LUX Store Inc.",
    "checkout.ruc": "Tax ID / RUC: 1792384912001",
    "checkout.reference_label": "Deposit Reference / Wire Transfer Receipt #",
    "checkout.reference_placeholder": "e.g. TRANSF-982341",
    "checkout.paypal_info": "Payment authorization will be verified via secure PayPal gateway.",
    "checkout.place_order": "Confirm & Place Order",
    "checkout.processing": "Processing Order...",
    "checkout.summary": "Order Summary",

    // Thank You Modal
    "thankyou.title": "Thank You For Your Order!",
    "thankyou.desc": "Your order has been placed successfully in our system with status PENDING.",
    "thankyou.order_id": "Order Number:",
    "thankyou.total": "Total Paid:",
    "thankyou.status": "Status:",
    "thankyou.email_notice": "A digital invoice has been dispatched to your email.",
    "thankyou.btn_orders": "View My Orders",
    "thankyou.btn_home": "Back to Store",

    // Footer & FAQ
    "footer.desc": "Contemporary luxury fashion, curated archive garments, and timeless designer collections.",
    "footer.products": "PRODUCTS",
    "footer.support": "SUPPORT",
    "footer.company": "COMPANY",
    "footer.faq": "Frequently Asked Questions (FAQ)",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.my_orders": "My Orders & 2FA",
    "footer.rights": "All rights reserved.",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ES",
  setLang: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ES");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lux_language_pref") as Language | null;
      if (saved === "ES" || saved === "EN") {
        setLangState(saved);
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("lux_language_pref", newLang);
    } catch {
      // Ignore storage write error
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const text = translations[lang]?.[key];
    if (text) return text;
    const fallbackText = translations.EN?.[key];
    if (fallbackText) return fallbackText;
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
