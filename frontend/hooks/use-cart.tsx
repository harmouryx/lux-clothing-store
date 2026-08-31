"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Product, ProductVariant, CartItem } from "@/lib/types";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "lux_store_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored && stored.trim() !== "" && stored !== "undefined" && stored !== "null") {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // Ignore storage error
      }
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore storage write error
      }
    }
  }, [items, isHydrated]);

  const addItem = useCallback((product: Product, variant?: ProductVariant, quantity = 1) => {
    setItems((currentItems) => {
      const itemId = variant ? `${product.id}-${variant.id}` : product.id;
      const existingIndex = currentItems.findIndex((i) => i.id === itemId);
      const unitPrice = Number(product.base_price) || 0;

      if (existingIndex > -1) {
        const updated = [...currentItems];
        updated[existingIndex].quantity += quantity;
        toast.success(`Updated "${product.name}" quantity (${updated[existingIndex].quantity})`);
        return updated;
      }

      toast.success(`Added "${product.name}" to cart`);
      return [
        ...currentItems,
        {
          id: itemId,
          product,
          variant,
          quantity,
          unitPrice,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((i) => i.id !== id));
    toast.info("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      isOpen,
      setIsOpen,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
