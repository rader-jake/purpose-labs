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

    // 2. Sync cart — triggers abandoned cart automation if contact exists
    const { ok, data } = await sendCart(cartID, email, cartSum, currency, cartUrl, products ?? []);

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
