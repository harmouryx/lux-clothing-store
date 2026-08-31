import React from "react";
import Header from "@/components/luxcomp/header";
import Footer from "@/components/luxcomp/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12 space-y-8">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: August 30, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-xs text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Information Collection & Usage
            </h2>
            <p>
              LUX collects personal information necessary to process your transactions, manage your account, and fulfill order shipments. This includes name, email, shipping address, and payment method identifiers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Data Protection & Security
            </h2>
            <p>
              We implement industry-standard encryption protocols (Sanctum authentication tokens, TOTP two-factor security) to protect your personal information against unauthorized access or disclosure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Cookies & Session Storage
            </h2>
            <p>
              Our storefront utilizes essential session cookies (XSRF-TOKEN) and local storage parameters to ensure secure API requests, cart persistence, and seamless authentication state handling.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. User Rights & Data Subject Access
            </h2>
            <p>
              You have the right to inspect, update, or request the erasure of your personal records at any time through your Profile dashboard or by contacting support.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
