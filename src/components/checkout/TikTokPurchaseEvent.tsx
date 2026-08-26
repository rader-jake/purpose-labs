"use client";

import { useEffect, useRef } from "react";
import type { OrderConfirmationData } from "@/lib/order/types";

interface Props {
  data: OrderConfirmationData;
}

// Fires the browser half of the purchase event. The checkout route sends the
// matching event_id server-side so TikTok can deduplicate the two signals.
export function TikTokPurchaseEvent({ data }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const value = parseFloat(data.totals.total_price) / 100;
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

  }, [data]);

  return null;
}
