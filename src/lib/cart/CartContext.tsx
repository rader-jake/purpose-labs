"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { AddressInput, Cart } from "./types";

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (id: number, quantity: number) => Promise<void>;
  updateItem: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  updateCustomerAddress: (addresses: {
    shipping_address: AddressInput;
    billing_address: AddressInput;
  }) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * WooCommerce coupon errors (and only coupon errors, so far) come back
 * HTML-entity-encoded, e.g. `Coupon &quot;x&quot; does not exist.` —
 * every other cart error message so far has been plain text. Decoding
 * via a detached textarea is the standard safe way to unescape entities
 * without risking the input being parsed as live markup.
 */
function decodeHtmlEntities(text: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

async function parseCartResponse(response: Response): Promise<Cart> {
  const data = await response.json();
  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "Cart request failed";
    throw new Error(decodeHtmlEntities(message));
  }
  return data as Cart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart")
      .then(parseCartResponse)
      .then((data) => {
        if (!cancelled) setCart(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load cart");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = useCallback(async (id: number, quantity: number) => {
    setError(null);
    try {
      const response = await fetch("/api/cart/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });
      const data = await parseCartResponse(response);
      setCart(data);
      setIsDrawerOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (key: string, quantity: number) => {
    setError(null);
    try {
      const response = await fetch("/api/cart/update-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, quantity }),
      });
      const data = await parseCartResponse(response);
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (key: string) => {
    setError(null);
    try {
      const response = await fetch("/api/cart/remove-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await parseCartResponse(response);
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
      throw err;
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    setError(null);
    try {
      const response = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await parseCartResponse(response);
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply coupon");
      throw err;
    }
  }, []);

  const removeCoupon = useCallback(async (code: string) => {
    setError(null);
    try {
      const response = await fetch("/api/cart/remove-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await parseCartResponse(response);
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove coupon");
      throw err;
    }
  }, []);

  const updateCustomerAddress = useCallback(
    async (addresses: { shipping_address: AddressInput; billing_address: AddressInput }) => {
      setError(null);
      try {
        const response = await fetch("/api/cart/update-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addresses),
        });
        const data = await parseCartResponse(response);
        setCart(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update address");
        throw err;
      }
    },
    []
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      error,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      updateItem,
      removeItem,
      updateCustomerAddress,
      applyCoupon,
      removeCoupon,
    }),
    [
      cart,
      isLoading,
      error,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      updateItem,
      removeItem,
      updateCustomerAddress,
      applyCoupon,
      removeCoupon,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
