import { NextRequest, NextResponse } from "next/server";

const OMNISEND_KEY = process.env.OMNISEND_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, cartID, cartSum, currency, products, cartUrl } = body;

    if (!email || !cartID) {
      return NextResponse.json({ error: "Missing email or cartID" }, { status: 400 });
    }

    // Upsert contact first (required for abandoned cart to fire)
    await fetch("https://api.omnisend.com/v3/contacts", {
      method: "POST",
      headers: {
        "X-API-KEY": OMNISEND_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        status: "nonSubscribed",
        statusDate: new Date().toISOString(),
        sendWelcomeEmail: false,
      }),
    });

    // Send cart to Omnisend
    const res = await fetch("https://api.omnisend.com/v3/carts", {
      method: "POST",
      headers: {
        "X-API-KEY": OMNISEND_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartID,
        email,
        currency: currency ?? "USD",
        cartSum: cartSum ?? 0,
        cartRecoveryUrl: cartUrl ?? "https://purposelabs.shop/checkout",
        products: (products ?? []).map((p: {
          productID: string;
          variantID?: string;
          title: string;
          quantity: number;
          price: number;
          imageUrl?: string;
          productUrl?: string;
        }) => ({
          productID: p.productID,
          variantID: p.variantID ?? p.productID,
          title: p.title,
          quantity: p.quantity,
          price: p.price,
          imageUrl: p.imageUrl ?? "",
          productUrl: p.productUrl ?? "https://purposelabs.shop/products",
        })),
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (err) {
    console.error("[omnisend/cart]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE — clear cart when order completes
export async function DELETE(req: NextRequest) {
  try {
    const { cartID } = await req.json();
    if (!cartID) return NextResponse.json({ error: "Missing cartID" }, { status: 400 });

    const res = await fetch(`https://api.omnisend.com/v3/carts/${cartID}`, {
      method: "DELETE",
      headers: { "X-API-KEY": OMNISEND_KEY },
    });

    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 400 });
  } catch (err) {
    console.error("[omnisend/cart DELETE]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
