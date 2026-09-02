"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { OrderConfirmationData } from "@/lib/order/types";

interface Props {
  data: OrderConfirmationData;
}

const BEACON_BASE = "https://joshuar120.sg-host.com/wp-json/beacon-tt/v1";

// Fires the browser half of the purchase event. The Beacon plugin handles
// server-side CAPI and returns the shared event_id for deduplication.
export function TikTokPurchaseEvent({ data }: Props) {
  const fired = useRef(false);
  const searchParams = useSearchParams();

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

    const fallbackFire = () => {
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
    };

    const orderKey = searchParams.get("key") ?? searchParams.get("order_key");

    const fireWithBeacon = async () => {
      try {
        const url = orderKey
          ? `${BEACON_BASE}/orders/${orderId}/pixel-payload?key=${encodeURIComponent(orderKey)}`
          : `${BEACON_BASE}/orders/${orderId}/pixel-payload`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Beacon ${res.status}`);

        const payload = (await res.json()) as {
          ready?: boolean;
          event_id?: string;
          props?: Record<string, unknown>;
        };

        if (payload.ready === true) {
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
              ...(payload.props ?? {}),
              ...(payload.event_id ? { event_id: payload.event_id } : {}),
            });
          }
          return;
        }
      } catch (e) {
        console.warn("[TikTok Pixel] Beacon fetch failed, falling back", e);
      }
      fallbackFire();
    };

    void fireWithBeacon();
  }, [data, searchParams]);

  return null;
}
