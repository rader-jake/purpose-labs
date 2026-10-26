/**
 * TikTok browser pixel helpers — client-side only
 * Works by calling the global `ttq` object injected by the pixel script in layout.tsx
 */

declare global {
  interface Window {
    ttq?: {
      track: (event: string, props?: Record<string, unknown>) => void;
      page: () => void;
      identify: (props: Record<string, unknown>) => void;
    };
  }
}

/** SHA-256 hash a string, returns lowercase hex. */
export async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Call ttq.identify with hashed email/phone. */
export async function ttqIdentify(email?: string, phone?: string) {
  if (typeof window === "undefined" || !window.ttq?.identify) return;
  try {
    const props: Record<string, unknown> = {};
    if (email) props.email = await sha256(email.trim().toLowerCase());
    if (phone) props.phone_number = await sha256(phone.replace(/\D/g, ""));
    if (Object.keys(props).length > 0) window.ttq.identify(props);
  } catch (e) {
    console.error("[TikTok Pixel] identify failed", e);
  }
}

const BEACON_BASE = "https://joshuar120.sg-host.com/wp-json/beacon-tt/v1";

async function beaconPost(
  path: string,
  body: Record<string, unknown>
): Promise<{ event_id?: string; props?: Record<string, unknown> } | null> {
  try {
    const res = await fetch(`${BEACON_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json() as Promise<{ event_id?: string; props?: Record<string, unknown> }>;
  } catch {
    return null;
  }
}

export function ttqTrack(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track(event, props);
    }
  } catch (e) {
    console.error("[TikTok Pixel]", e);
  }
}

export async function trackViewContent(props: {
  contentId: string;
  contentName: string;
  value?: number;
  currency?: string;
  productId?: number;
  pageUrl?: string;
}) {
  const beacon = await beaconPost("/events/view-content", {
    product_id: props.productId,
    page_url: props.pageUrl,
    ttclid: typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("ttclid") ?? undefined
      : undefined,
    ttp: typeof window !== "undefined"
      ? (document.cookie.match(/(?:^|;\s*)_ttp=([^;]*)/) ?? [])[1]
      : undefined,
  });

  ttqTrack("ViewContent", {
    content_id: props.contentId,
    content_name: props.contentName,
    value: props.value,
    currency: props.currency ?? "USD",
    ...(beacon?.props ?? {}),
    ...(beacon?.event_id ? { event_id: beacon.event_id } : {}),
  });
}

export async function trackAddToCart(props: {
  contentId: string;
  contentName: string;
  value?: number;
  quantity?: number;
  currency?: string;
  productId?: number;
}) {
  const beacon = await beaconPost("/events/add-to-cart", {
    product_id: props.productId ?? parseInt(props.contentId, 10),
    quantity: props.quantity ?? 1,
    page_url: typeof window !== "undefined" ? window.location.href : undefined,
    ttclid: typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("ttclid") ?? undefined
      : undefined,
    ttp: typeof window !== "undefined"
      ? (document.cookie.match(/(?:^|;\s*)_ttp=([^;]*)/) ?? [])[1]
      : undefined,
  });

  ttqTrack("AddToCart", {
    content_id: props.contentId,
    content_name: props.contentName,
    value: props.value,
    quantity: props.quantity ?? 1,
    currency: props.currency ?? "USD",
    ...(beacon?.props ?? {}),
    ...(beacon?.event_id ? { event_id: beacon.event_id } : {}),
  });
}

export async function trackInitiateCheckout(props?: {
  value?: number;
  currency?: string;
  contents?: { content_id: string; content_name: string; content_type: string; quantity: number; price: number }[];
}) {
  const beacon = await beaconPost("/events/initiate-checkout", {
    value: props?.value,
    currency: props?.currency ?? "USD",
  });

  ttqTrack("InitiateCheckout", {
    value: props?.value,
    currency: props?.currency ?? "USD",
    contents: props?.contents ?? [],
    ...(beacon?.props ?? {}),
    ...(beacon?.event_id ? { event_id: beacon.event_id } : {}),
  });
}

export function trackSearch(query: string) {
  ttqTrack("Search", { query });
}

export function trackAddPaymentInfo(props?: { value?: number; currency?: string }) {
  ttqTrack("AddPaymentInfo", {
    value: props?.value,
    currency: props?.currency ?? "USD",
  });
}

export function trackCompleteRegistration() {
  ttqTrack("CompleteRegistration");
}

export function trackPurchase(props: {
  value: number;
  currency?: string;
  orderId: string | number;
  contents: { content_id: string; content_name: string; quantity: number; price: number }[];
}) {
  ttqTrack("Purchase", {
    content_type: "product",
    value: props.value,
    currency: props.currency ?? "USD",
    order_id: props.orderId,
    contents: props.contents,
  });
}
