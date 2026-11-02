import { NextRequest, NextResponse } from "next/server";

const OMNISEND_KEY = process.env.OMNISEND_API_KEY;
const API_BASE = "https://api.omnisend.com/api";
const API_VERSION = "2026-03-15";
const FALLBACK_IMAGE = "https://www.purposelabs.shop/pl-logo.png";
const FALLBACK_PRODUCT_URL = "https://www.purposelabs.shop/products";

// Prices arrive from the checkout page in dollars, which is what the events API expects.
interface CartProduct {
  productID: string | number;
  variantID?: string | number;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  productUrl?: string;
}

interface OmnisendResult {
  ok: boolean;
  status: number;
}

// A rejected request is logged with Omnisend's own error body instead of disappearing.
async function sendEvent(
  eventName: string,
  contact: Record<string, string>,
  properties: Record<string, unknown>
): Promise<OmnisendResult> {
  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: {
        Authorization: `Omnisend-API-Key ${OMNISEND_KEY}`,
        "Omnisend-Version": API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventName, origin: "api", eventVersion: "", contact, properties }),
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error(`[omnisend] event "${eventName}" failed:`, res.status, JSON.stringify(data));
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error(`[omnisend] event "${eventName}" request error:`, err);
    return { ok: false, status: 0 };
  }
}

function toLineItems(products: CartProduct[]) {
  return products.map((p) => ({
    productID: String(p.productID),
    productVariantID: String(p.variantID ?? p.productID),
    productTitle: p.title,
    productDescription: p.title,
    productPrice: p.price,
    productQuantity: Number(p.quantity),
    productImageURL: p.imageUrl && p.imageUrl.startsWith("http") ? p.imageUrl : FALLBACK_IMAGE,
    productURL: p.productUrl ?? FALLBACK_PRODUCT_URL,
  }));
}

// Cart and checkout abandonment run entirely on these two events. The event's
// `contact` creates or updates the contact, so no separate contacts call is
// made — that API requires a subscription status, and sending one could
// overwrite an existing subscriber's.
export async function POST(req: NextRequest) {
  try {
    if (!OMNISEND_KEY) {
      console.error("[omnisend] OMNISEND_API_KEY is not set in this environment");
      return NextResponse.json({ error: "Omnisend is not configured" }, { status: 500 });
    }

    const { email, cartID, cartSum, currency, products, cartUrl, firstName, lastName } = await req.json();
    if (!email || !cartID) {
      return NextResponse.json({ error: "Missing email or cartID" }, { status: 400 });
    }

    const total = Number(cartSum) || 0;
    const cur = currency || "USD";
    const checkoutUrl: string = cartUrl || "https://www.purposelabs.shop/checkout";
    const lineItems = toLineItems(Array.isArray(products) ? products : []);

    const contact: Record<string, string> = { email };
    if (firstName) contact.firstName = firstName;
    if (lastName) contact.lastName = lastName;

    // Awaited on purpose: a serverless function can be frozen as soon as the
    // response is sent, which silently drops anything still in flight.
    const added =
      lineItems.length > 0
        ? await sendEvent("added product to cart", contact, {
            abandonedCheckoutURL: checkoutUrl,
            cartID,
            currency: cur,
            value: total,
            addedItem: lineItems[0],
            lineItems,
          })
        : null;
    const started = await sendEvent("started checkout", contact, {
      abandonedCheckoutURL: checkoutUrl,
      cartID,
      currency: cur,
      value: total,
      lineItems,
    });

    return NextResponse.json(
      { addedProductToCart: added?.status ?? "skipped", startedCheckout: started.status },
      { status: started.ok ? 200 : 502 }
    );
  } catch (err) {
    console.error("[omnisend/cart POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
