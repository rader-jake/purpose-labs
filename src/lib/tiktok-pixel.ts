/**
 * TikTok browser pixel helpers — client-side only
 * Works by calling the global `ttq` object injected by the pixel script in layout.tsx
 */

declare global {
  interface Window {
    ttq?: {
      track: (event: string, props?: Record<string, unknown>) => void;
      page: () => void;
    };
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

export function trackAddToCart(props: {
  contentId: string;
  contentName: string;
  value?: number;
  quantity?: number;
  currency?: string;
}) {
  ttqTrack("AddToCart", {
    content_id: props.contentId,
    content_name: props.contentName,
    value: props.value,
    quantity: props.quantity ?? 1,
    currency: props.currency ?? "USD",
  });
}

export async function trackInitiateCheckout(props?: { value?: number; currency?: string }) {
  const beacon = await beaconPost("/events/initiate-checkout", {
    value: props?.value,
    currency: props?.currency ?? "USD",
  });

  ttqTrack("InitiateCheckout", {
    value: props?.value,
    currency: props?.currency ?? "USD",
    ...(beacon?.props ?? {}),
    ...(beacon?.event_id ? { event_id: beacon.event_id } : {}),
  });
}
