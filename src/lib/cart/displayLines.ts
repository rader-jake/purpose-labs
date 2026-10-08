import { isFreeItem } from "./businessRules";
import type { Cart, CartItem } from "./types";

// The cart drawer and the checkout summary both render rows from here, so a
// product can never show one price in the cart and another at checkout.
//
// A row's price is the Store API's `line_total` — what the customer actually
// pays for that line after every coupon. (`line_subtotal` is the pre-discount
// price and is only ever shown as a struck-through/"before" figure, never as
// the price.)

export const BAC_WATER_ID = 94;
const BAC_WATER_PROMO_COUPON = "pl-auto-bacwater";

export interface DisplayLine {
  /** Unique React key (a split bac water line yields two rows per cart item). */
  key: string;
  /** Store API cart item key. */
  itemKey: string;
  name: string;
  quantity: number;
  totalCents: number;
  isFree: boolean;
}

export function itemDisplayTotal(item: Pick<CartItem, "totals">): number {
  return Number(item.totals.line_total);
}

/** With the free-water coupon active, bac water renders as a FREE row plus a paid row for extras. */
export function isSplitBacWater(cart: Pick<Cart, "coupons">, item: Pick<CartItem, "id">): boolean {
  return item.id === BAC_WATER_ID && cart.coupons.some((c) => c.code === BAC_WATER_PROMO_COUPON);
}

export function getDisplayLines(cart: Pick<Cart, "items" | "coupons">): DisplayLine[] {
  return cart.items.flatMap<DisplayLine>((item) => {
    if (isSplitBacWater(cart, item)) {
      const paidQuantity = item.quantity - 1;
      const rows: DisplayLine[] = [
        { key: `${item.key}:free`, itemKey: item.key, name: item.name, quantity: 1, totalCents: 0, isFree: true },
      ];
      if (paidQuantity > 0) {
        rows.push({
          key: `${item.key}:paid`,
          itemKey: item.key,
          name: item.name,
          quantity: paidQuantity,
          totalCents: itemDisplayTotal(item),
          isFree: false,
        });
      }
      return rows;
    }
    return [
      {
        key: item.key,
        itemKey: item.key,
        name: item.name,
        quantity: item.quantity,
        totalCents: itemDisplayTotal(item),
        isFree: isFreeItem(item),
      },
    ];
  });
}
