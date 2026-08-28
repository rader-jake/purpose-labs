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
  /** "simple" | "variable" | etc. — variable products (currently just
   * GHK-CU) need the variant selector; everything else adds the parent
   * product id straight to cart. */
  type: string;
  short_description: string;
  images: { id: number; src: string; alt: string }[];
  // WooCommerce has no dedicated CAS field for these products — it's only
  // ever present as plain text ("CAS: <number>") inside short_description
  // HTML, confirmed by inspecting the live API response for all 20 products.
  casNumber: string | null;
  /** WooCommerce's own related-products algorithm (shared category/tags).
   * Verified against the live catalog: reliably populated (5 IDs on every
   * real product checked), empty only for the dev-only "Test Item". Can
   * include non-merchandisable IDs like recon solution — see
   * NON_MERCHANDISABLE_PRODUCT_IDS below. */
  related_ids: number[];
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
  type: string;
  short_description: string;
  images: { id: number; src: string; alt: string }[];
  related_ids: number[];
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

// Local hero image overrides — used when WooCommerce has no image or a
// poor-quality placeholder. Slug → public-folder path.
const LOCAL_IMAGE_OVERRIDES: Record<string, string> = {
  "reconstitution-solution": "/hero-reconstitution.jpg",
};

function mapProduct(raw: WooApiProduct): WooProduct {
  const casNumber = extractCasNumber(raw.short_description || "");
  const localImg = LOCAL_IMAGE_OVERRIDES[raw.slug];
  const images = localImg
    ? [{ id: 0, src: localImg, alt: raw.name }]
    : raw.images;
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
    type: raw.type,
    short_description: casNumber
      ? stripCasBadge(raw.short_description)
      : raw.short_description,
    images,
    casNumber,
    related_ids: raw.related_ids,
  };
}

function getWooCommerceCredentials() {
  const url = process.env.WOOCOMMERCE_URL ?? "https://joshuar120.sg-host.com";
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY ?? "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

  return { url: url.replace(/\/+$/, ""), consumerKey, consumerSecret };
}

async function wooCommerceFetch<T>(
  path: string,
  params: Record<string, string> = {},
  options: { cache?: "revalidate" | "no-store" } = {}
): Promise<T> {
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
    // Products change infrequently; revalidate periodically rather than
    // caching forever. Order lookups (post-payment confirmation) opt into
    // "no-store" instead — a stale "pending" status right after a
    // customer completes payment would be actively misleading.
    ...(options.cache === "no-store"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60 } }),
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
  /** Fetch only these specific product IDs (WooCommerce's `include` param) —
   * used for batch-fetching related products by ID in one request. */
  include?: number[];
  /** Full-text search query */
  search?: string;
  per_page?: number;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<WooProduct[]> {
  const { perPage = 100, orderby, exclude, include, search, per_page } = options;
  const params: Record<string, string> = { per_page: String(per_page ?? perPage) };
  if (orderby) params.orderby = orderby;
  if (exclude && exclude.length > 0) params.exclude = exclude.join(",");
  if (include && include.length > 0) params.include = include.join(",");
  if (search) params.search = search;

  const raw = await wooCommerceFetch<WooApiProduct[]>("/products", params);
  return raw.map(mapProduct);
}

// Recon solution (id 94) is auto-added to every qualifying order rather than
// something a customer chooses to buy, and Test Item (id 1057) is a dev
// artifact — both would otherwise show up as a "best seller" or a "you may
// also like" suggestion despite not being real merchandise a customer
// would choose. Confirmed recon solution genuinely turns up in other products'
// related_ids (e.g. Tesamorelin's), not just a hypothetical risk.
export const NON_MERCHANDISABLE_PRODUCT_IDS = [94, 1057];

export async function getBestSellers(limit = 8): Promise<WooProduct[]> {
  return getProducts({
    perPage: limit,
    orderby: "popularity",
    exclude: NON_MERCHANDISABLE_PRODUCT_IDS,
  });
}

export async function getRelatedProducts(relatedIds: number[]): Promise<WooProduct[]> {
  if (relatedIds.length === 0) return [];
  // NOTE: WooCommerce silently ignores `exclude` when `include` is also
  // set (verified directly — a request with both still returned bac
  // water), so the non-merchandisable filter has to happen client-side
  // here instead of at the query level like getBestSellers does.
  const products = await getProducts({ include: relatedIds });
  return products.filter((p) => !NON_MERCHANDISABLE_PRODUCT_IDS.includes(p.id));
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

// --- Orders (post-payment return flow) --------------------------------
//
// Real shape verified against a live test order (#1962, created directly
// via POST /wc/store/v1/checkout with payment_method: "tagada" — see
// storeApi.ts's submitCheckout). Confirmed WooCommerce's own order record
// is correct even where Tagada's hosted checkout page later displays it
// wrong (recon solution: $0 here, $9.99 there) — that's a Tagada-gateway-side
// bug, tracked separately, not something this mapping should paper over.

export interface WooOrderAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone: string;
}

export interface WooOrderLineItem {
  id: number;
  name: string;
  quantity: number;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
}

export interface WooOrderFeeLine {
  id: number;
  name: string;
  total: string;
  total_tax: string;
}

export interface WooOrderTaxLine {
  id: number;
  label: string;
  rate_percent: number;
  tax_total: string;
}

interface WooApiOrder {
  id: number;
  number: string;
  status: string;
  order_key: string;
  payment_method: string;
  payment_method_title: string;
  currency: string;
  billing: WooOrderAddress;
  shipping: WooOrderAddress;
  line_items: WooOrderLineItem[];
  fee_lines: WooOrderFeeLine[];
  tax_lines: WooOrderTaxLine[];
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  total: string;
  total_tax: string;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  orderKey: string;
  paymentMethodTitle: string;
  billing: WooOrderAddress;
  shipping: WooOrderAddress;
  lineItems: WooOrderLineItem[];
  feeLines: WooOrderFeeLine[];
  taxLines: WooOrderTaxLine[];
  discountTotal: string;
  discountTax: string;
  shippingTotal: string;
  shippingTax: string;
  total: string;
  totalTax: string;
}

function mapOrder(raw: WooApiOrder): WooOrder {
  return {
    id: raw.id,
    number: raw.number,
    status: raw.status,
    orderKey: raw.order_key,
    paymentMethodTitle: raw.payment_method_title,
    billing: raw.billing,
    shipping: raw.shipping,
    lineItems: raw.line_items,
    feeLines: raw.fee_lines,
    taxLines: raw.tax_lines,
    discountTotal: raw.discount_total,
    discountTax: raw.discount_tax,
    shippingTotal: raw.shipping_total,
    shippingTax: raw.shipping_tax,
    total: raw.total,
    totalTax: raw.total_tax,
  };
}

/**
 * Looks up an order for the post-payment return/confirmation page. Verifies
 * the caller-supplied `key` against the order's real order_key before
 * returning anything — our admin API credentials can fetch ANY order by
 * ID regardless of who's asking, so without this check, a visitor could
 * view another customer's order just by guessing/incrementing the ID in
 * the URL.
 */
export async function getOrderByIdAndKey(orderId: number, key: string): Promise<WooOrder | null> {
  if (!Number.isFinite(orderId) || orderId <= 0 || !key) return null;
  let raw: WooApiOrder;
  try {
    raw = await wooCommerceFetch<WooApiOrder>(`/orders/${orderId}`, {}, { cache: "no-store" });
  } catch {
    return null;
  }
  if (raw.order_key !== key) return null;
  return mapOrder(raw);
}
