"use client";

import { useEffect } from "react";
import type { OrderConfirmationData } from "@/lib/order/types";

/**
 * Fires the Affiliatly order conversion pixel on the thank-you page.
 * Affiliatly's v3 script exposes window.affiliatly.trackConversion() which
 * must be called with the order total and order ID so the affiliate who
 * referred this customer receives their commission.
 */
export function AfflilatlyConversionEvent({ data }: { data: OrderConfirmationData }) {
  useEffect(() => {
    const totalCents = Number(data.totals.total_price);
    const totalDollars = (totalCents / 100).toFixed(2);
    const orderId = String(data.orderNumber);

    function fireConversion() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.affiliatly && typeof w.affiliatly.trackConversion === "function") {
        w.affiliatly.trackConversion({ order_id: orderId, amount: totalDollars });
      } else {
        // Script not yet loaded — retry once after a short delay
        setTimeout(() => {
          if (w.affiliatly && typeof w.affiliatly.trackConversion === "function") {
            w.affiliatly.trackConversion({ order_id: orderId, amount: totalDollars });
          }
        }, 2000);
      }
    }

    fireConversion();
  // Only fire once per mount — data is stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
