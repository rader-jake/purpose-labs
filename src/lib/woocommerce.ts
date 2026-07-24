import "server-only";

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: number | null;
  short_description: string;
  images: { id: number; src: string; alt: string }[];
  // WooCommerce has no dedicated CAS field for these products — it's only
  // ever present as plain text ("CAS: <number>") inside short_description
  // HTML, confirmed by inspecting the live API response for all 20 products.
  casNumber: string | null;
}

interface WooApiProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: number | null;
  short_description: string;
  images: { id: number; src: string; alt: string }[];
}

// Every product that has a CAS number renders it the same way: its own
// trailing paragraph wrapping a styled <span>CAS: ...</span> badge. Some
// products (compound stacks, e.g. "CJC 1295 no dac + Ipamorelin") list two
// CAS numbers in that one span, so this captures the whole remainder rather
// than assuming a single numeric pattern.
const CAS_BADGE_PATTERN = /<p>\s*<span[^>]*>\s*CAS:?\s*([^<]+?)\s*<\/span>\s*<\/p>\s*/i;

function extractCasNumber(html: string): string | null {
  const match = html.match(CAS_BADGE_PATTERN);
  return match ? match[1].trim() : null;
}

// The CAS badge is redundant once we render our own from `casNumber` below,
// so strip it out of the prose we pass through to short_description.
function stripCasBadge(html: string): string {
  return html.replace(CAS_BADGE_PATTERN, "").trim();
}

function mapProduct(raw: WooApiProduct): WooProduct {
  const casNumber = extractCasNumber(raw.short_description || "");
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    permalink: raw.permalink,
    price: raw.price,
    regular_price: raw.regular_price,
    sale_price: raw.sale_price,
    stock_status: raw.stock_status,
    stock_quantity: raw.stock_quantity,
    short_description: casNumber
      ? stripCasBadge(raw.short_description)
      : raw.short_description,
    images: raw.images,
    casNumber,
  };
}

function getWooCommerceCredentials() {
  const url = process.env.WOOCOMMERCE_URL;
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!url || !consumerKey || !consumerSecret) {
    throw new Error(
      "Missing WooCommerce credentials. Check WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET in .env.local"
    );
  }

  return { url: url.replace(/\/+$/, ""), consumerKey, consumerSecret };
}

async function wooCommerceFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const { url, consumerKey, consumerSecret } = getWooCommerceCredentials();

  const endpoint = new URL(`${url}/wp-json/wc/v3${path}`);
  for (const [key, value] of Object.entries(params)) {
    endpoint.searchParams.set(key, value);
  }

  const basicAuth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(endpoint.toString(), {
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    // Products change infrequently; revalidate periodically rather than caching forever.
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WooCommerce API error (${response.status}): ${body}`);
  }

  return response.json();
}

export interface GetProductsOptions {
  /** WooCommerce's REST API caps this at 100. Defaults to 100 — the full
   * catalog fits under that, but this was previously hardcoded at 20,
   * which silently dropped the catalog's 22nd product from every listing. */
  perPage?: number;
  orderby?: "date" | "popularity" | "rating" | "title" | "menu_order";
  /** Product IDs to omit from the result (e.g. gifted or dev-only items
   * that would otherwise pollute a "popularity" sort). */
  exclude?: number[];
}

export async function getProducts(options: GetProductsOptions = {}): Promise<WooProduct[]> {
  const { perPage = 100, orderby, exclude } = options;
  const params: Record<string, string> = { per_page: String(perPage) };
  if (orderby) params.orderby = orderby;
  if (exclude && exclude.length > 0) params.exclude = exclude.join(",");

  const raw = await wooCommerceFetch<WooApiProduct[]>("/products", params);
  return raw.map(mapProduct);
}

// Bac water (id 94) is auto-added to every qualifying order rather than
// something a customer chooses to buy, and Test Item (id 1057) is a dev
// artifact — both would otherwise show up near the top of a real
// popularity/total_sales sort and misrepresent what's actually selling.
const BEST_SELLERS_EXCLUDE_IDS = [94, 1057];

export async function getBestSellers(limit = 8): Promise<WooProduct[]> {
  return getProducts({
    perPage: limit,
    orderby: "popularity",
    exclude: BEST_SELLERS_EXCLUDE_IDS,
  });
}

export async function getProduct(slug: string): Promise<WooProduct | null> {
  const raw = await wooCommerceFetch<WooApiProduct[]>("/products", { slug });
  return raw[0] ? mapProduct(raw[0]) : null;
}

// --- Variable product variations -------------------------------------
//
// NOT wired into getProduct()/getProducts() or any UI yet — that's the
// scoped variant-selector work (selector UI, dynamic price display,
// passing variation_id instead of the parent product id to Add to
// Cart). This is just the fetch + defensive filter, built now as a
// safety net so the data-hygiene issue below can't resurface later
// even before the real selector exists.
//
// Verified against the live GHK-CU product (id 98, the only variable
// product in the current 22-product catalog): its `variations` field
// lists 3 IDs, but one (830) is an orphaned variation with no attribute
// value assigned at all (`attributes: []`, blank `name`, a redundant
// price between the two real options, and a permalink with no
// `?attribute_...=` query param) — almost certainly a leftover from
// before the product's attributes were configured. A selector built by
// mapping the raw array directly would show it as a broken, unlabeled
// third option.

export interface WooProductVariation {
  id: number;
  price: string;
  regular_price: string;
  stock_status: string;
  image: { id: number; src: string; alt: string } | null;
  /** e.g. { name: "GHK-CU", option: "50mg" } — WooCommerce's own shape. */
  attributes: { name: string; option: string }[];
}

interface WooApiVariation {
  id: number;
  price: string;
  regular_price: string;
  stock_status: string;
  image: { id: number; src: string; alt: string } | null;
  attributes: { name: string; option: string }[];
}

function mapVariation(raw: WooApiVariation): WooProductVariation {
  return {
    id: raw.id,
    price: raw.price,
    regular_price: raw.regular_price,
    stock_status: raw.stock_status,
    image: raw.image,
    attributes: raw.attributes,
  };
}

export async function getProductVariations(productId: number): Promise<WooProductVariation[]> {
  const raw = await wooCommerceFetch<WooApiVariation[]>(`/products/${productId}/variations`);
  // Defensive filter, not a fix for the underlying data problem — see
  // the module comment above. Drop any variation with no attribute
  // value assigned; it can't be meaningfully selected or labeled.
  return raw.filter((v) => v.attributes.length > 0).map(mapVariation);
}
