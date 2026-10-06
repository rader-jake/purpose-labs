"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/cart/money";
import { FREE_SHIPPING_THRESHOLD_CENTS, isFreeItem } from "@/lib/cart/businessRules";
import type { CartCoupon, CartItem } from "@/lib/cart/types";
import { decodeHtmlEntities } from "@/lib/utils";
import { BOGO_PRODUCT_IDS, BOGO_PRODUCTS, getBogoGroup, type BogoProduct } from "@/lib/cart/bogoProducts";
import BogoPickerModal from "@/components/BogoPickerModal";

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

          {cart && cart.items.length > 0 && <BogoBanner cart={cart} />}

          {cart && cart.items.length > 0 && (
            <ul className="flex flex-col gap-5">
              {cart.items.map((item) => {
                const hasBacWaterPromo = cart.coupons.some(
                  (c) => c.code === "pl-auto-bacwater"
                );
                if (item.id === 94 && hasBacWaterPromo) {
                  return (
                    <BacWaterLineItems key={item.key} item={item} />
                  );
                }
                return <CartLineItem key={item.key} item={item} />;
              })}
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
                {formatMoney(
                  String(
                    Math.max(
                      0,
                      Number(cart.totals.total_items) -
                        cart.coupons.reduce((sum, c) => sum + Number(c.totals.total_discount), 0)
                    )
                  )
                )}
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

function BogoBanner({ cart }: { cart: import("@/lib/cart/types").Cart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { refreshCart } = useCart();

  // Count total paid and free BOGO items across all tiers
  const totalPaid = cart.items
    .filter((item) => BOGO_PRODUCT_IDS.has(item.id) && !isFreeItem(item))
    .reduce((sum, item) => sum + item.quantity, 0);

  // Only count items claimed via our BOGO coupon flow (pl-bogo-*) as claimed picks
  const bogoCouponCount = cart.coupons.filter((c) => c.code.startsWith("pl-bogo-")).length;

  if (totalPaid === 0 || bogoCouponCount >= totalPaid) return null;

  const freeRemaining = totalPaid - bogoCouponCount;

  // Find highest-tier paid item to determine eligible products
  const highestPaidTier = ([3, 2, 1] as const).find((t) =>
    cart.items.some((item) => {
      const g = getBogoGroup(item.id);
      return g === t && !isFreeItem(item);
    })
  );
  if (!highestPaidTier) return null;

  // Eligible = same tier and below (equal or lesser value)
  const eligibleProducts = BOGO_PRODUCTS.filter((p) => p.group <= highestPaidTier);
  if (eligibleProducts.length === 0) return null;

  const handleSelect = async (product: BogoProduct) => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart/bogo-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) throw new Error("Failed to add free vial");
      await refreshCart();
      setModalOpen(false);
    } catch {
      // silently fail
    } finally {
      setIsAdding(false);
    }
  };

  // Show up to 3 thumbnail previews
  const previewProducts = eligibleProducts.slice(0, 3);
  const extraCount = eligibleProducts.length - previewProducts.length;

  return (
    <>
      <div
        style={{
          background: "#F8F6F1",
          border: "1px solid #E8E2D9",
          borderRadius: 14,
          padding: "16px 18px",
          margin: "0 0 16px 0",
        }}
      >
        {/* Row 1: label + count pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#1B2A4A", display: "inline-block", flexShrink: 0,
            }} />
            <span style={{
              fontWeight: 700, fontSize: 13, color: "#1B2A4A",
              letterSpacing: "0.04em", textTransform: "uppercase",
              fontFamily: "var(--pl-font-body)",
            }}>
              Complimentary Vial Unlocked
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#1B2A4A",
            border: "1px solid #C8BFB0", borderRadius: 20,
            padding: "3px 9px", whiteSpace: "nowrap",
          }}>
            {freeRemaining} available
          </span>
        </div>

        {/* Row 2: thumbnails */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          {previewProducts.map((p) => (
            <div key={`${p.id}-${p.name}`} style={{
              width: 38, height: 38, borderRadius: 8,
              background: "#fff", border: "1px solid #E8E2D9",
              overflow: "hidden", flexShrink: 0,
            }}>
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
            </div>
          ))}
          {extraCount > 0 && (
            <span style={{ fontSize: 11, color: "#9B8F7A", marginLeft: 4 }}>+{extraCount} more</span>
          )}
        </div>

        {/* Row 3: CTA button */}
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: "#1B2A4A",
            border: "none",
            borderRadius: 10,
            color: "#F8F6F1",
            padding: "11px 16px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "var(--pl-font-body)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Select Your Free Vial
        </button>
      </div>

      {modalOpen && (
        <BogoPickerModal
          products={eligibleProducts}
          onSelect={handleSelect}
          onClose={() => setModalOpen(false)}
          isAdding={isAdding}
        />
      )}
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
      {coupons
        .filter((coupon) => coupon.code !== "pl-auto-bacwater" && !coupon.code.startsWith("pl-bogo-")) // hidden — shown as FREE badge on line items
        .map((coupon) => (
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

/**
 * Splits bac water into two visual rows when the pl-auto-bacwater coupon is active:
 * - Row 1: FREE (qty 1)
 * - Row 2: $9.99 per additional unit (qty - 1), only shown if qty > 1
 */
function BacWaterLineItems({ item }: { item: CartItem }) {
  const { removeItem, updateItem } = useCart();
  const [isPending, setIsPending] = useState(false);
  const image = item.images[0];
  const paidQty = item.quantity - 1;

  async function handleRemoveFree() {
    // Removing the free one: reduce qty by 1 (or remove if qty === 1)
    if (item.quantity <= 1) {
      setIsPending(true);
      try { await removeItem(item.key); } finally { setIsPending(false); }
    } else {
      setIsPending(true);
      try { await updateItem(item.key, item.quantity - 1); } finally { setIsPending(false); }
    }
  }

  async function handlePaidQtyChange(next: number) {
    const newTotal = Math.max(1, next + 1); // keep at least 1 (the free one)
    setIsPending(true);
    try { await updateItem(item.key, newTotal); } finally { setIsPending(false); }
  }

  async function handleRemovePaid() {
    // Remove paid units — leave qty 1 (the free one)
    setIsPending(true);
    try { await updateItem(item.key, 1); } finally { setIsPending(false); }
  }

  const ItemImage = () => image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image.src} alt={image.alt || item.name} className="h-16 w-16 object-contain" />
  ) : null;

  return (
    <>
      {/* Row 1: FREE unit */}
      <li className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded" style={{ backgroundColor: "var(--pl-ivory-soft)" }}>
          <ItemImage />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}>
              {decodeHtmlEntities(item.name)}
            </p>
            <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ backgroundColor: "var(--pl-navy)", color: "var(--pl-ivory)" }}>
              Free
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}>$0.00</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center rounded-full border" style={{ borderColor: "var(--pl-border)" }}>
              <button disabled className="flex h-7 w-7 items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-40" style={{ color: "var(--pl-navy)" }}>−</button>
              <span className="w-6 text-center text-xs" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}>1</span>
              <button onClick={() => handlePaidQtyChange(paidQty + 1)} disabled={isPending} aria-label="Add another" className="flex h-7 w-7 items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-40" style={{ color: "var(--pl-navy)" }}>+</button>
            </div>
            <button onClick={handleRemoveFree} disabled={isPending} className="text-xs underline-offset-2 transition-opacity duration-200 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40" style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}>
              Remove
            </button>
          </div>
        </div>
      </li>

      {/* Row 2: Paid units (only shown if qty > 1) */}
      {paidQty > 0 && (
        <li className="flex gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded" style={{ backgroundColor: "var(--pl-ivory-soft)" }}>
            <ItemImage />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-sm font-medium leading-tight" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}>
              {decodeHtmlEntities(item.name)}
            </p>
            <p className="text-xs" style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}>
              {formatMoney(String(Number(item.prices.price) * paidQty))}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center rounded-full border" style={{ borderColor: "var(--pl-border)" }}>
                <button onClick={() => handlePaidQtyChange(paidQty - 1)} disabled={isPending} aria-label="Decrease quantity" className="flex h-7 w-7 items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-40" style={{ color: "var(--pl-navy)" }}>−</button>
                <span className="w-6 text-center text-xs" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}>{paidQty}</span>
                <button onClick={() => handlePaidQtyChange(paidQty + 1)} disabled={isPending} aria-label="Increase quantity" className="flex h-7 w-7 items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-40" style={{ color: "var(--pl-navy)" }}>+</button>
              </div>
              <button onClick={handleRemovePaid} disabled={isPending} className="text-xs underline-offset-2 transition-opacity duration-200 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40" style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}>
                Remove
              </button>
            </div>
          </div>
        </li>
      )}
    </>
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

  const decreaseDisabled = free || !item.quantity_limits.editable || isPending;
  // Free items (BOGO): lock both + and - to prevent quantity manipulation
  const increaseDisabled = free || !item.quantity_limits.editable || isPending;
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
            {decodeHtmlEntities(item.name)}
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
