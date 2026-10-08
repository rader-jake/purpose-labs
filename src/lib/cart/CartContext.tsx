"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { getCouponForAffiliate } from "@/lib/affiliateMap";
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
  refreshCart: () => Promise<void>;
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

function saveCartToken(response: Response) {
  try {
    const token = response.headers.get("x-cart-token");
    if (token && typeof localStorage !== "undefined") {
      localStorage.setItem("wc/cartToken", token);
    }
  } catch {}
}

async function parseCartResponse(response: Response): Promise<Cart> {
  saveCartToken(response);
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
  const affiliateCouponAttempted = useRef(false);
  const research25Attempted = useRef(false);
  const rpepGhkAttempted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart")
      .then(parseCartResponse)
      .then((data) => {
        if (!cancelled) {
          setCart(data);
          // Auto-apply affiliate coupon once on initial cart load
          if (!affiliateCouponAttempted.current) {
            affiliateCouponAttempted.current = true;
            try {
              const affId = localStorage.getItem("pl_aff_id");
              const couponCode = getCouponForAffiliate(affId);
              if (couponCode) {
                const alreadyApplied = data.coupons?.some(
                  (c: { code: string }) => c.code.toLowerCase() === couponCode.toLowerCase()
                );
                if (!alreadyApplied) {
                  fetch("/api/cart/apply-coupon", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: couponCode }),
                  })
                    .then(parseCartResponse)
                    .then((updated) => { if (!cancelled) setCart(updated); })
                    .catch(() => {/* silent — don't surface affiliate coupon errors to user */});
                }
              }
            } catch {/* localStorage unavailable */}
          }
          // Auto-apply RESEARCH25 if no affiliate coupon is active
          if (!research25Attempted.current) {
            research25Attempted.current = true;
            try {
              const affId = localStorage.getItem("pl_aff_id");
              const affiliateCoupon = getCouponForAffiliate(affId);
              const hasAffiliateCoupon = affiliateCoupon
                ? data.coupons?.some(
                    (c: { code: string }) => c.code.toLowerCase() === affiliateCoupon.toLowerCase()
                  )
                : false;
              const hasResearch25 = data.coupons?.some(
                (c: { code: string }) => c.code.toLowerCase() === "research25"
              );
              // Don't auto-apply RESEARCH25 if ANY manual discount code is present
              const hasAnyDiscountCode = data.coupons?.some(
                (c: { code: string }) => {
                  const code = c.code.toLowerCase();
                  return code !== "research25" && code !== "pl-auto-bacwater" && !code.startsWith("pl-bogo-");
                }
              );
              const hasItems = data.items && data.items.length > 0;
              if (!hasResearch25 && !hasAffiliateCoupon && !hasAnyDiscountCode && hasItems) {
                fetch("/api/cart/apply-coupon", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code: "RESEARCH25" }),
                })
                  .then(parseCartResponse)
                  .then((updated) => { if (!cancelled) setCart(updated); })
                  .catch(() => {/* silent */});
              }
            } catch {/* localStorage unavailable */}
          }
          // RPEP / FREEGHK: auto-add free GHK-Cu 50mg (ID 831) when either coupon is applied
          if (!rpepGhkAttempted.current) {
            const hasRpep = data.coupons?.some(
              (c: { code: string }) => c.code.toLowerCase() === "rpep" || c.code.toLowerCase() === "freeghk"
            );
            const hasGhkFree = data.items?.some(
              (item: { id: number; prices?: { price: string } }) =>
                item.id === 831 && parseFloat(item.prices?.price ?? "1") === 0
            );
            if (hasRpep && !hasGhkFree) {
              rpepGhkAttempted.current = true;
              fetch("/api/cart/bogo-free", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: 831 }),
              })
                .then(parseCartResponse)
                .then((updated) => { if (!cancelled) setCart(updated); })
                .catch(() => {/* silent */});
            }
          }
        }
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
      // Re-fetch cart to pick up any server-side modifications (e.g. free items
      // added by the Buy 2 Get 1 Free promotion hook after the add response).
      fetch("/api/cart")
        .then(parseCartResponse)
        .then(setCart)
        .catch(() => {/* silent — cart already set from add response */});
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

      // RPEP / FREEGHK: auto-add free GHK-Cu 50mg when either coupon is manually applied
      if (code.toLowerCase() === "rpep" || code.toLowerCase() === "freeghk") {
        const hasGhkFree = data.items?.some(
          (item: { id: number; prices?: { price: string } }) =>
            item.id === 831 && parseFloat(item.prices?.price ?? "1") === 0
        );
        if (!hasGhkFree) {
          fetch("/api/cart/bogo-free", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: 831 }),
          })
            .then(parseCartResponse)
            .then((updated) => setCart(updated))
            .catch(() => {/* silent */});
        }
      }
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

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await parseCartResponse(res);
      setCart(data);
    } catch {
      // silent
    }
  }, []);

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
      refreshCart,
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
      refreshCart,
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
