"use client";

import { useEffect, useRef } from "react";
import type { OrderConfirmationData } from "@/lib/order/types";

interface Props {
  data: OrderConfirmationData;
}

// Fires a TikTok Purchase event via both:
// 1. Browser pixel (ttq.track) — fast, for pixel attribution
// 2. Server-side Events API — reliable, bypasses ad blockers
export function TikTokPurchaseEvent({ data }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const value = data.totals.total_price / 100; // cents → dollars
    const orderId = data.orderNumber;
    const contents = data.items.map((item) => ({
      content_id: item.id.toString(),
      content_name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.totals.line_total) / 100,
    }));

    // 1. Browser pixel
    try {
      const ttq = (window as unknown as Record<string, unknown>).ttq as {
        track: (event: string, props: Record<string, unknown>) => void;
      } | undefined;
      if (ttq?.track) {
        ttq.track("CompletePayment", {
          content_type: "product",
          value,
          currency: "USD",
          order_id: orderId,
          contents,
        });
      }
    } catch (e) {
      console.warn("[TikTok Pixel] browser track failed", e);
    }

    // 2. Server-side Events API
    const email = data.billingAddress?.email;
    fetch("/api/tiktok-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "CompletePayment",
        event_id: `order_${orderId}`,
        properties: {
          value,
          currency: "USD",
          order_id: orderId,
          content_type: "product",
          url: window.location.href,
        },
        user: email ? { email } : {},
      }),
    }).catch((e) => console.warn("[TikTok Events API] server send failed", e));
  }, [data]);

  return null;
}
