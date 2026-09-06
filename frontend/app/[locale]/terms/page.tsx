import React from "react";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12 space-y-8">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: August 30, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-xs text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Storefront Usage & General Conditions
            </h2>
            <p>
              By accessing and placing orders on LUX e-commerce, you agree to comply with our commercial policies, pricing parameters, and catalog conditions. All items listed are subject to availability and stock verification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. User Accounts & Identity Security
            </h2>
            <p>
              Users are responsible for maintaining the confidentiality of their credentials and two-factor authentication tokens. LUX reserves the right to suspend or terminate accounts displaying suspicious transaction activity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Payments, Shipping & Fulfillment
            </h2>
            <p>
              Orders are processed upon payment confirmation. Prices include applicable sales tax based on jurisdiction. Shipping times and delivery estimates may vary according to carrier logistics.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Returns & Order Adjustments
            </h2>
            <p>
              Items may be returned within 14 business days of delivery in their original packaging. Custom variants or hygiene-sensitive products may be subject to non-refundable guidelines.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
