import { NextRequest, NextResponse } from "next/server";

const OMNISEND_KEY = process.env.OMNISEND_API_KEY;
const V3_BASE = "https://api.omnisend.com/v3";
const API_BASE = "https://api.omnisend.com/api";
const API_VERSION = "2026-03-15";
const FALLBACK_IMAGE = "https://www.purposelabs.shop/pl-logo.png";
const FALLBACK_PRODUCT_URL = "https://www.purposelabs.shop/products";

// Prices arrive from the checkout page in dollars; the v3 carts API wants cents.
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
  data: unknown;
}

// Every call goes through here so a rejected request is logged with
// Omnisend's own error body instead of disappearing.
async function omnisendFetch(label: string, url: string, init: RequestInit): Promise<OmnisendResult> {
  try {
    const res = await fetch(url, { ...init, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) console.error(`[omnisend] ${label} failed:`, res.status, JSON.stringify(data));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`[omnisend] ${label} request error:`, err);
    return { ok: false, status: 0, data: {} };
  }
}

// Current versioned API (/api/*): Authorization header + Omnisend-Version.
function apiHeaders() {
  return {
    Authorization: `Omnisend-API-Key ${OMNISEND_KEY}`,
    "Omnisend-Version": API_VERSION,
    "Content-Type": "application/json",
  };
}

// v3 carts API: X-API-KEY.
function v3Headers() {
  return { "X-API-KEY": OMNISEND_KEY as string, "Content-Type": "application/json" };
}

const imageOrFallback = (url?: string) => (url && url.startsWith("http") ? url : FALLBACK_IMAGE);

function toLineItems(products: CartProduct[]) {
  return products.map((p) => ({
    productID: String(p.productID),
    productVariantID: String(p.variantID ?? p.productID),
    productTitle: p.title,
    productDescription: p.title,
    productPrice: p.price,
    productQuantity: Number(p.quantity),
    productImageURL: imageOrFallback(p.imageUrl),
    productURL: p.productUrl ?? FALLBACK_PRODUCT_URL,
  }));
}

// Creates the contact if new, otherwise updates it. Deliberately sends no
// channel status: an existing subscriber must never be reset to
// "nonSubscribed", and names are only sent when we actually have them so an
// empty string can't blank an existing name.
function upsertContact(email: string, firstName?: string, lastName?: string) {
  return omnisendFetch("contact upsert", `${API_BASE}/contacts`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      identifiers: [{ type: "email", id: email }],
    }),
  });
}

async function sendCart(cartID: string, email: string, cartSum: number, currency: string, cartUrl: string, products: CartProduct[]) {
  const payload = {
    cartID,
    email,
    currency,
    cartSum: Math.round(cartSum * 100),
    cartRecoveryUrl: cartUrl,
    products: products.map((p) => ({
      cartProductID: `${cartID}_${p.productID}`,
      productID: String(p.productID),
      variantID: String(p.variantID ?? p.productID),
      title: p.title,
      quantity: Number(p.quantity),
      price: Math.round(p.price * 100),
      imageUrl: imageOrFallback(p.imageUrl),
      productUrl: p.productUrl ?? FALLBACK_PRODUCT_URL,
    })),
  };

  let res = await omnisendFetch("cart create", `${V3_BASE}/carts`, {
    method: "POST",
    headers: v3Headers(),
    body: JSON.stringify(payload),
  });

  // Cart already exists (e.g. a retry) — update it instead.
  if (res.status === 409) {
    res = await omnisendFetch("cart update", `${V3_BASE}/carts/${encodeURIComponent(cartID)}`, {
      method: "PATCH",
      headers: v3Headers(),
      body: JSON.stringify(payload),
    });
  }
  return res;
}

function sendEvent(eventName: string, contact: Record<string, string>, properties: Record<string, unknown>) {
  return omnisendFetch(`event "${eventName}"`, `${API_BASE}/events`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ eventName, origin: "api", eventVersion: "", contact, properties }),
  });
}

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

    const items: CartProduct[] = Array.isArray(products) ? products : [];
    const total = Number(cartSum) || 0;
    const cur = currency || "USD";
    const checkoutUrl: string = cartUrl || "https://www.purposelabs.shop/checkout";

    // Contact and cart are independent, so run them together.
    const [contact, cart] = await Promise.all([
      upsertContact(email, firstName, lastName),
      sendCart(cartID, email, total, cur, checkoutUrl, items),
    ]);

    // These events are what start the abandonment automations. They are
    // awaited on purpose: a serverless function can be frozen as soon as the
    // response is sent, which silently drops anything still in flight.
    const eventContact: Record<string, string> = { email };
    if (firstName) eventContact.firstName = firstName;
    if (lastName) eventContact.lastName = lastName;
    const lineItems = toLineItems(items);

    const added =
      lineItems.length > 0
        ? await sendEvent("added product to cart", eventContact, {
            abandonedCheckoutURL: checkoutUrl,
            cartID,
            currency: cur,
            value: total,
            addedItem: lineItems[0],
            lineItems,
          })
        : null;
    const started = await sendEvent("started checkout", eventContact, {
      abandonedCheckoutURL: checkoutUrl,
      cartID,
      currency: cur,
      value: total,
      lineItems,
    });

    return NextResponse.json(
      {
        contact: contact.status,
        cart: cart.status,
        addedProductToCart: added?.status ?? "skipped",
        startedCheckout: started.status,
      },
      { status: started.ok ? 200 : 502 }
    );
  } catch (err) {
    console.error("[omnisend/cart POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Called when an order completes so the saved cart isn't treated as abandoned.
export async function DELETE(req: NextRequest) {
  try {
    if (!OMNISEND_KEY) {
      console.error("[omnisend] OMNISEND_API_KEY is not set in this environment");
      return NextResponse.json({ error: "Omnisend is not configured" }, { status: 500 });
    }
    const { cartID } = await req.json();
    if (!cartID) return NextResponse.json({ error: "Missing cartID" }, { status: 400 });

    const res = await omnisendFetch("cart delete", `${V3_BASE}/carts/${encodeURIComponent(cartID)}`, {
      method: "DELETE",
      headers: { "X-API-KEY": OMNISEND_KEY },
    });
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 400 });
  } catch (err) {
    console.error("[omnisend/cart DELETE]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
