import type { CartItem } from "./types";

/**
 * STOPGAP — duplicated business logic, not a source of truth.
 *
 * WooCommerce's Store API does not expose the free-shipping threshold or
 * the bulk-discount tier boundaries/rates (confirmed against a live cart
 * response — the `fees` array only ever contains the final computed
 * dollar amount, e.g. "Bulk Quantity Discount: -$42.00", never the 8%
 * rate or the 13+ unit threshold that produced it). These numbers
 * currently live only in PHP on the WordPress side.
 *
 * This constant WILL silently drift out of sync if the $200 threshold
 * ever changes on the WordPress side — nothing here would catch that.
 * The correct fix is a Store API schema extension (ExtendRestApi /
 * woocommerce_store_api_register_endpoint_data) exposing it as real
 * data. Until that's built, treat this as a manually-synced mirror.
 */
export const FREE_SHIPPING_THRESHOLD_CENTS = 20000; // $200.00

/**
 * STOPGAP — inference from real cart totals, not a real "is this free"
 * flag.
 *
 * The Store API has no custom flag (pl_free_bac, _bogo_free, etc.)
 * marking a line item as free/gifted — confirmed empirically: item_data
 * is empty and extensions only carries unrelated plugin data.
 *
 * This used to check item.prices.price === "0" directly, which matched
 * how recon solution's free pricing worked originally (the item's own price
 * zeroed out). WooCommerce silently switched mechanisms at some point —
 * confirmed against a live cart response: recon solution's prices.price and
 * regular_price now both stay at full price ("999"), and the $0 is
 * applied instead via a cart-level coupon (pl-auto-bacwater). The old
 * check went stale and stopped disabling quantity controls for it.
 *
 * Checking totals.line_total instead of prices.price is a strict
 * superset that covers both mechanisms: a directly-zeroed price also
 * zeroes line_total (so nothing regresses for that case), and a
 * coupon-zeroed line shows up here too, since line_total reflects
 * whatever discount actually applied — coupon or otherwise. Still not
 * authoritative: a legitimately $0 product would look identical to a
 * gifted one. Replace once the schema exposes a real flag.
 */
export function isFreeItem(item: Pick<CartItem, "totals" | "prices">): boolean {
  // Coupon-zeroed items: line_total=0 but line_subtotal reflects full price
  if (item.totals.line_total === "0" && item.totals.line_subtotal !== "0") return true;
  // Price-zeroed items (B2G1 free): price set to 0 directly on the item
  if (item.prices.price === "0" && item.prices.regular_price !== "0") return true;
  return false;
}
