import Link from "next/link";
import { getOrderByIdAndKey } from "@/lib/woocommerce";
import { mapOrderToConfirmationData } from "@/lib/order/types";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";

// This path (/checkout/order-received/{orderId}) mirrors WooCommerce's own
// default order-received URL convention (wc_get_endpoint_url("order-received",
// order_id, wc_get_checkout_url())) — the path every WooCommerce gateway
// redirects back to unless something overrides it. Whether Tagada's hosted
// checkout actually lands here, on the old WordPress site instead, or with a
// different query param name for the order key is unverified — that
// requires a real completed payment, which is the user's own manual test,
// not something reproducible here. Reading multiple plausible key param
// names below is a defensive hedge for that uncertainty, not a confirmed
// contract.
interface Props {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrderReceivedPage({ params, searchParams }: Props) {
  const { orderId: orderIdParam } = await params;
  const search = await searchParams;

  const orderId = Number(orderIdParam);
  const key = firstValue(search.key) ?? firstValue(search.order_key) ?? firstValue(search.orderKey);

  const order = key ? await getOrderByIdAndKey(orderId, key) : null;

  if (!order) {
    return (
      <main
        className="mx-auto max-w-2xl px-6 py-20 text-center"
        style={{ fontFamily: "var(--pl-font-body)" }}
      >
        <h1
          className="mb-4 text-3xl"
          style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
        >
          We couldn&rsquo;t confirm that order
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--pl-text-secondary)" }}>
          If you just completed a payment, check your email for a confirmation, or contact us and
          we&rsquo;ll look it up.
        </p>
        <Link
          href="/contact"
          className="inline-block rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ backgroundColor: "var(--pl-navy)", color: "var(--pl-ivory)" }}
        >
          Contact us
        </Link>
      </main>
    );
  }

  return <OrderConfirmation data={mapOrderToConfirmationData(order)} />;
}
