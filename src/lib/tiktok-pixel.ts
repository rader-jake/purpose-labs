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

export function ttqTrack(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track(event, props);
    }
  } catch (e) {
    console.error("[TikTok Pixel]", e);
  }
}

export function trackViewContent(props: {
  contentId: string;
  contentName: string;
  value?: number;
  currency?: string;
}) {
  ttqTrack("ViewContent", {
    content_id: props.contentId,
    content_name: props.contentName,
    value: props.value,
    currency: props.currency ?? "USD",
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

export function trackInitiateCheckout(props?: { value?: number; currency?: string }) {
  ttqTrack("InitiateCheckout", {
    value: props?.value,
    currency: props?.currency ?? "USD",
  });
}
