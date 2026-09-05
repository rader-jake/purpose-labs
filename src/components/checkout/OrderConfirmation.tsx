import Link from "next/link";
import { formatMoney } from "@/lib/cart/money";
import type { OrderConfirmationData } from "@/lib/order/types";
import { TikTokPurchaseEvent } from "./TikTokPurchaseEvent";
import { AfflilatlyConversionEvent } from "./AfflilatlyConversionEvent";

export function OrderConfirmation({ data }: { data: OrderConfirmationData }) {
  const { shippingAddress } = data;

  return (
    <main className="mx-auto max-w-2xl px-6 py-20" style={{ fontFamily: "var(--pl-font-body)" }}>
      <TikTokPurchaseEvent data={data} />
      <AfflilatlyConversionEvent data={data} />
      <div className="mb-10 text-center">
        <p
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--pl-slate)" }}
        >
          Thank you
        </p>
        <h1
          className="mb-2 text-4xl"
          style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
        >
          Order confirmed
        </h1>
        <p className="text-sm" style={{ color: "var(--pl-text-secondary)" }}>
          Order #{data.orderNumber}
        </p>
      </div>

      <div className="mb-8 rounded-lg border p-6" style={{ borderColor: "var(--pl-border)" }}>
        <h2
          className="mb-4 text-lg"
          style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
        >
          Items
        </h2>
        <ul className="flex flex-col gap-3">
          {data.items.map((item) => (
            <li key={item.key} className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--pl-slate)" }}>
                {item.name} × {item.quantity}
              </span>
              <span style={{ color: "var(--pl-navy)" }}>{formatMoney(item.totals.line_total)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm" style={{ borderColor: "var(--pl-border)" }}>
          <div className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
            <span>Subtotal</span>
            <span>{formatMoney(data.totals.total_items)}</span>
          </div>
          {data.fees.map((fee) => (
            <div key={fee.key} className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
              <span>{fee.name}</span>
              <span>{formatMoney(fee.totals.total)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
            <span>Shipping</span>
            <span>{formatMoney(data.totals.total_shipping)}</span>
          </div>
          {data.totals.tax_lines.map((tax) => (
            <div key={tax.name} className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
              <span>
                {tax.name} ({tax.rate})
              </span>
              <span>{formatMoney(tax.price)}</span>
            </div>
          ))}
          <div
            className="mt-2 flex items-center justify-between border-t pt-2 text-base font-medium"
            style={{ borderColor: "var(--pl-border)", color: "var(--pl-navy)" }}
          >
            <span>Total</span>
            <span>{formatMoney(data.totals.total_price)}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg border p-6" style={{ borderColor: "var(--pl-border)" }}>
        <h2
          className="mb-3 text-lg"
          style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
        >
          Shipping to
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--pl-text-secondary)" }}>
          {shippingAddress.first_name} {shippingAddress.last_name}
          <br />
          {shippingAddress.address_1}
          {shippingAddress.address_2 ? `, ${shippingAddress.address_2}` : ""}
          <br />
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postcode}
        </p>
      </div>

      <p className="mb-8 text-xs" style={{ color: "var(--pl-muted)" }}>
        {data.status === "mock-pending"
          ? `Paid via ${data.paymentMethodLabel}. This confirmation is from the payment stub, not a real order — no charge was made and nothing was submitted to WooCommerce as a completed order.`
          : `Paid via ${data.paymentMethodLabel}.`}
      </p>

      <div className="text-center">
        <Link
          href="/"
          className="inline-block rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ backgroundColor: "var(--pl-navy)", color: "var(--pl-ivory)" }}
        >
          Back to shop
        </Link>
      </div>
    </main>
  );
}
