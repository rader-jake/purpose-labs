import { NextRequest, NextResponse } from "next/server";

const OMNISEND_KEY = process.env.OMNISEND_API_KEY!;
const OMNISEND_BASE = "https://api.omnisend.com/v3";

async function upsertContact(email: string, firstName?: string, lastName?: string) {
  const now = new Date().toISOString();

  // Try PATCH first (update existing) — avoids duplicate/conflict errors
  const patchRes = await fetch(`${OMNISEND_BASE}/contacts`, {
    method: "POST",
    headers: { "X-API-KEY": OMNISEND_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      status: "nonSubscribed",
      statusDate: now,
      sendWelcomeEmail: false,
    }),
  });

  if (!patchRes.ok) {
    const err = await patchRes.json().catch(() => ({}));
    console.warn("[omnisend] contact upsert failed:", patchRes.status, err);
  }
  return patchRes.ok;
}

async function fireCheckoutEvent(email: string, cartID: string, cartSum: number, cartUrl: string, products: unknown[]) {
  // Fire "added product to cart" event — initiates cart abandonment flow
  if ((products as any[]).length > 0) {
    const first = products[0] as any;
    await fetch("https://api.omnisend.com/api/events", {
      method: "POST",
      headers: {
        "X-API-KEY": OMNISEND_KEY,
        "Omnisend-Version": "2026-03-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: "added product to cart",
        origin: "api",
        eventVersion: "",
        contact: { email },
        properties: {
          abandonedCheckoutURL: cartUrl,
          cartID,
          value: cartSum,
          currency: "USD",
          addedItem: {
            productID: String(first.productID),
            productTitle: first.title,
            productPrice: first.price / 100,
            productImageURL: first.imageUrl ?? "https://www.purposelabs.shop/pl-logo.png",
            productURL: first.productUrl ?? "https://www.purposelabs.shop/products",
          },
          lineItems: (products as any[]).map((p) => ({
            productID: String(p.productID),
            productTitle: p.title,
            productPrice: p.price / 100,
            productImageURL: p.imageUrl ?? "https://www.purposelabs.shop/pl-logo.png",
            productURL: p.productUrl ?? "https://www.purposelabs.shop/products",
          })),
        },
      }),
    }).catch((e) => console.warn("[omnisend] added product to cart event failed:", e));
  }

  // Fire "started checkout" event — triggers checkout abandonment automation
  await fetch("https://api.omnisend.com/api/events", {
    method: "POST",
    headers: {
      "X-API-KEY": OMNISEND_KEY,
      "Omnisend-Version": "2026-03-15",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName: "started checkout",
      origin: "api",
      eventVersion: "",
      contact: { email },
      properties: {
        abandonedCheckoutURL: cartUrl,
        cartID,
        currency: "USD",
        cartSum,
      },
    }),
  }).catch((e) => console.warn("[omnisend] started checkout event failed:", e));
}

async function sendCart(cartID: string, email: string, cartSum: number, currency: string, cartUrl: string, products: unknown[]) {
  // Try POST first; if cart already exists, PATCH it
  const payload = {
    cartID,
    email,
    currency: currency ?? "USD",
    cartSum: Math.round((cartSum ?? 0) * 100),
    cartRecoveryUrl: cartUrl ?? "https://www.purposelabs.shop/checkout",
    products: (products ?? []).map((p: any) => ({
      cartProductID: `${cartID}_${p.productID}`,
      productID: String(p.productID),
      variantID: String(p.variantID ?? p.productID),
      title: p.title,
      quantity: Number(p.quantity),
      price: Math.round(p.price * 100),
      imageUrl: p.imageUrl && p.imageUrl.startsWith("http") ? p.imageUrl : "https://www.purposelabs.shop/pl-logo.png",
      productUrl: p.productUrl ?? "https://www.purposelabs.shop/products",
    })),
  };

  let res = await fetch(`${OMNISEND_BASE}/carts`, {
    method: "POST",
    headers: { "X-API-KEY": OMNISEND_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // If cart already exists (409 conflict), patch it instead
  if (res.status === 409) {
    res = await fetch(`${OMNISEND_BASE}/carts/${cartID}`, {
      method: "PATCH",
      headers: { "X-API-KEY": OMNISEND_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) console.error("[omnisend] cart sync failed:", res.status, data);
  return { ok: res.ok, data };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, cartID, cartSum, currency, products, cartUrl, firstName, lastName } = body;

    if (!email || !cartID) {
      return NextResponse.json({ error: "Missing email or cartID" }, { status: 400 });
    }

    // 1. Upsert contact (required before cart event can trigger automation)
    await upsertContact(email, firstName, lastName);

    // 2. Sync cart data to Omnisend
    const { ok, data } = await sendCart(cartID, email, cartSum, currency, cartUrl, products ?? []);

    // 3. Fire "added product to cart" + "started checkout" events via REST API
    // These are what actually trigger the abandoned checkout automation
    void fireCheckoutEvent(email, cartID, cartSum, cartUrl ?? "https://www.purposelabs.shop/checkout", products ?? []);

    return NextResponse.json(data, { status: ok ? 200 : 400 });
  } catch (err) {
    console.error("[omnisend/cart POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Called when order completes — clears the cart so abandoned cart email doesn't fire
export async function DELETE(req: NextRequest) {
  try {
    const { cartID } = await req.json();
    if (!cartID) return NextResponse.json({ error: "Missing cartID" }, { status: 400 });

    const res = await fetch(`${OMNISEND_BASE}/carts/${cartID}`, {
      method: "DELETE",
      headers: { "X-API-KEY": OMNISEND_KEY },
    });

    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 400 });
  } catch (err) {
    console.error("[omnisend/cart DELETE]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
