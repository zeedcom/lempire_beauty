"use client";

import { useEffect, useState } from "react";

const CART_KEY = "cart";

export const readCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading cart:", error);
    return [];
  }
};

export const writeCart = (list) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("cart-updated"));
    return true;
  } catch (error) {
    console.error("Error saving cart:", error);
    return false;
  }
};

/*
 * Reactive cart hook — stays in sync across tabs (storage event)
 * and within the same tab (custom cart-updated event).
 */
export function useCart() {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readCart());
    setHydrated(true);

    const sync = (e) => {
      if (!e || e.key === CART_KEY || e.type === "cart-updated") {
        setCart(readCart());
      }
    };

    window.addEventListener("storage", sync);
    window.addEventListener("cart-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cart-updated", sync);
    };
  }, []);

  return { cart, hydrated };
}