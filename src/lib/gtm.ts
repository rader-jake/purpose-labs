// src/lib/gtm.ts
// GA4 ecommerce dataLayer push helpers for GTM

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(event: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce object before each push (GA4 best practice)
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(event);
}

export interface GtmItem {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  index?: number;
}

export function gtmViewItem(item: GtmItem) {
  push({
    event: "view_item",
    ecommerce: {
      currency: "USD",
      value: item.price ?? 0,
      items: [{ ...item, quantity: item.quantity ?? 1 }],
    },
  });
}

export function gtmAddToCart(item: GtmItem & { quantity: number }) {
  push({
    event: "add_to_cart",
    ecommerce: {
      currency: "USD",
      value: (item.price ?? 0) * item.quantity,
      items: [item],
    },
  });
}

export function gtmBeginCheckout(items: GtmItem[], value: number) {
  push({
    event: "begin_checkout",
    ecommerce: {
      currency: "USD",
      value,
      items,
    },
  });
}

export function gtmPurchase(params: {
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  items: GtmItem[];
}) {
  push({
    event: "purchase",
    ecommerce: {
      currency: "USD",
      transaction_id: params.transaction_id,
      value: params.value,
      tax: params.tax ?? 0,
      shipping: params.shipping ?? 0,
      items: params.items,
    },
  });
}
