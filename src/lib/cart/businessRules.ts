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
 * STOPGAP — price-based inference, not a real "is this free" flag.
 *
 * The Store API has no custom flag (pl_free_bac, _bogo_free, etc.)
 * marking a line item as free/gifted — confirmed empirically: item_data
 * is empty and extensions only carries unrelated plugin data. This
 * infers "free" from price being zero while regular_price isn't, which
 * is a reasonable proxy for bac water and BOGO-style gifts but is not
 * authoritative — a legitimately $0 product would be indistinguishable
 * from a gifted one. Replace once the schema exposes a real flag.
 */
export function isFreeItem(item: Pick<CartItem, "prices">): boolean {
  return item.prices.price === "0" && item.prices.regular_price !== "0";
}
