"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/cart/money";
import { FREE_SHIPPING_THRESHOLD_CENTS, isFreeItem } from "@/lib/cart/businessRules";
import type { CartCoupon, CartItem } from "@/lib/cart/types";

export function CartDrawer() {
  const { cart, isLoading, error, isDrawerOpen, closeDrawer } = useCart();

  return (
    <>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(20, 39, 78, 0.35)" }}
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col transition-transform duration-300 ease-out"
        style={{
          backgroundColor: "var(--pl-white)",
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
          boxShadow: isDrawerOpen ? "var(--pl-shadow-hover)" : "none",
        }}
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isDrawerOpen}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-5"
          style={{ borderColor: "var(--pl-border)" }}
        >
          <h2
            className="text-2xl"
            style={{
              color: "var(--pl-navy)",
              fontFamily: "var(--pl-font-display)",
              fontWeight: 500,
            }}
          >
            Your Cart
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200"
            style={{ color: "var(--pl-slate)" }}
          >
            <CloseIcon />
          </button>
        </div>

        {cart?.needs_shipping && (
          <FreeShippingProgress
            totalItemsCents={Number(cart.totals.total_items)}
            hasFreeShippingRate={cart.shipping_rates.some((pkg) =>
              pkg.shipping_rates.some((rate) => rate.method_id === "free_shipping")
            )}
          />
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <p className="text-sm" style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}>
              Loading cart…
            </p>
          )}

          {error && (
            <p className="text-sm" style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}>
              {error}
            </p>
          )}

          {!isLoading && cart && cart.items.length === 0 && (
            <p className="text-sm" style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}>
              Your cart is empty.
            </p>
          )}

          {cart && cart.items.length > 0 && (
            <ul className="flex flex-col gap-5">
              {cart.items.map((item) => (
                <CartLineItem key={item.key} item={item} />
              ))}
            </ul>
          )}

          {cart && cart.fees.length > 0 && (
            <div className="mt-6 flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--pl-border)" }}>
              {cart.fees.map((fee) => (
                <div
                  key={fee.key}
                  className="flex items-center justify-between text-sm"
                  style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}
                >
                  <span>{fee.name}</span>
                  <span>{formatMoney(fee.totals.total)}</span>
                </div>
              ))}
            </div>
          )}

          {cart && cart.items.length > 0 && <CouponSection coupons={cart.coupons} />}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t px-6 py-5" style={{ borderColor: "var(--pl-border)" }}>
            <div className="mb-4 flex items-baseline justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}
              >
                Subtotal
              </span>
              <span
                className="text-3xl"
                style={{
                  color: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-display)",
                  fontWeight: 500,
                }}
              >
                {formatMoney(cart.totals.total_items)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="flex w-full items-center justify-center rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200"
              style={{
                backgroundColor: "var(--pl-navy)",
                color: "var(--pl-ivory)",
                fontFamily: "var(--pl-font-body)",
              }}
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

function FreeShippingProgress({
  totalItemsCents,
  hasFreeShippingRate,
}: {
  totalItemsCents: number;
  hasFreeShippingRate: boolean;
}) {
  // Whether shipping is actually free comes straight from the API (a
  // free_shipping rate only appears once WooCommerce's own minimum-order
  // rule is satisfied) — that part is authoritative, not guessed.
  //
  // The "how much more to add" progress bar below is the part that
  // isn't: it divides by FREE_SHIPPING_THRESHOLD_CENTS, a hardcoded
  // mirror of the WordPress-side $200 setting (see businessRules.ts).
  // It also assumes the threshold is measured against the pre-fee item
  // subtotal (total_items) rather than the post-discount total — that
  // basis isn't confirmed against the WooCommerce shipping method's
  // actual configuration, only inferred.
  if (hasFreeShippingRate) {
    return (
      <div className="px-6 pt-4">
        <p
          className="text-xs font-medium"
          style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}
        >
          🎉 You&rsquo;ve unlocked free shipping
        </p>
      </div>
    );
  }

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - totalItemsCents);
  const progress = Math.min(100, (totalItemsCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  return (
    <div className="px-6 pt-4">
      <p
        className="mb-2 text-xs"
        style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}
      >
        Add {formatMoney(remaining)} more for free shipping
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--pl-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: "var(--pl-navy)" }}
        />
      </div>
    </div>
  );
}

function CouponSection({ coupons }: { coupons: CartCoupon[] }) {
  const { applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsPending(true);
    try {
      await applyCoupon(trimmed);
      setCode("");
    } catch {
      // useCart sets its shared `error`, which CartDrawer already renders
      // above — same pattern as CartLineItem's handlers below.
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove(couponCode: string) {
    setIsPending(true);
    try {
      await removeCoupon(couponCode);
    } catch {
      // See handleApply above.
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-4" style={{ borderColor: "var(--pl-border)" }}>
      {coupons.map((coupon) => (
        <div
          key={coupon.code}
          className="flex items-center justify-between text-sm"
          style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}
        >
          <span>
            Coupon{" "}
            <strong style={{ color: "var(--pl-navy)" }}>{coupon.code.toUpperCase()}</strong>
          </span>
          <div className="flex items-center gap-3">
            <span>-{formatMoney(coupon.totals.total_discount)}</span>
            <button
              onClick={() => handleRemove(coupon.code)}
              disabled={isPending}
              className="text-xs underline-offset-2 transition-opacity duration-200 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <form onSubmit={handleApply} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          disabled={isPending}
          className="flex-1 rounded border px-3 py-2 text-sm"
          style={{ borderColor: "var(--pl-border)", color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}
        />
        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ borderColor: "var(--pl-border)", color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}
        >
          {isPending ? "Applying…" : "Apply"}
        </button>
      </form>
    </div>
  );
}

function CartLineItem({ item }: { item: CartItem }) {
  const { updateItem, removeItem } = useCart();
  const [isPending, setIsPending] = useState(false);
  const free = isFreeItem(item);
  const image = item.images[0];

  async function handleQuantityChange(nextQuantity: number) {
    const clamped = Math.max(item.quantity_limits.minimum, Math.min(item.quantity_limits.maximum, nextQuantity));
    if (clamped === item.quantity) return;
    setIsPending(true);
    try {
      await updateItem(item.key, clamped);
    } catch {
      // useCart sets its shared `error`, which CartDrawer already
      // renders above — visible here because the drawer is open by
      // definition while this runs, unlike the ProductCard/ProductBuyBox
      // add-to-cart paths where that assumption didn't hold.
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove() {
    setIsPending(true);
    try {
      await removeItem(item.key);
    } catch {
      // See handleQuantityChange above.
    } finally {
      setIsPending(false);
    }
  }

  // Allow increasing quantity even on free items (extra units are charged full price via coupon limit)
  const decreaseDisabled = free || !item.quantity_limits.editable || isPending;
  const increaseDisabled = !item.quantity_limits.editable || isPending;
  const controlsDisabled = decreaseDisabled;

  return (
    <li className="flex gap-4">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: "var(--pl-ivory-soft)" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt={image.alt || item.name} className="h-16 w-16 object-contain" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm font-medium leading-tight"
            style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}
          >
            {item.name}
          </p>
          {free && (
            <span
              className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
              style={{ backgroundColor: "var(--pl-navy)", color: "var(--pl-ivory)" }}
            >
              Free
            </span>
          )}
        </div>

        <p
          className="text-xs"
          style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}
        >
          {formatMoney(item.totals.line_total)}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <div
            className="flex items-center rounded-full border"
            style={{ borderColor: "var(--pl-border)" }}
          >
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={controlsDisabled}
              aria-label="Decrease quantity"
              className="flex h-7 w-7 items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--pl-navy)" }}
            >
              −
            </button>
            <span
              className="w-6 text-center text-xs"
              style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={increaseDisabled}
              aria-label="Increase quantity"
              className="flex h-7 w-7 items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--pl-navy)" }}
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={free || isPending}
            className="text-xs underline-offset-2 transition-opacity duration-200 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
