import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-8 text-slate-800">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 items-start">
          {/* Logo column with PNG logo */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block transition-opacity hover:opacity-85">
              <Image
                src="/lux_assets/lux_logo_1.png"
                alt="LUX Logo"
                width={80}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Products column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              PRODUCTS
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  Clothes
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  Merchandising
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  Shop all
                </Link>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              SUPPORT
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-black transition-colors">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-black transition-colors">
                  My Orders & 2FA
                </Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              COMPANY
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <span className="text-gray-500">LUX Store</span>
              </li>
              <li>
                <span className="text-gray-500">Quito, Ecuador</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom legal line */}
        <div className="mt-16 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 LUX</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms of service
            </Link>
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}