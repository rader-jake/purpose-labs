// Shapes mirror what purposelabs.shop's Store API (wp-json/wc/store/v1)
// actually returns — verified against a live cart response, not assumed.
// Only fields the UI uses are included; the real payload has more.

export interface CartItemImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface CartItemPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_minor_unit: number;
  currency_symbol: string;
}

export interface CartItemTotals {
  line_subtotal: string;
  line_subtotal_tax: string;
  line_total: string;
  line_total_tax: string;
}

export interface CartItemQuantityLimits {
  minimum: number;
  maximum: number;
  multiple_of: number;
  editable: boolean;
}

export interface CartItem {
  key: string;
  id: number;
  quantity: number;
  quantity_limits: CartItemQuantityLimits;
  name: string;
  short_description: string;
  permalink: string;
  images: CartItemImage[];
  prices: CartItemPrices;
  totals: CartItemTotals;
}

export interface CartFee {
  key: string;
  name: string;
  totals: {
    total: string;
    total_tax: string;
  };
}

export interface CartTotals {
  total_items: string;
  total_items_tax: string;
  total_fees: string;
  total_fees_tax: string;
  total_discount: string;
  total_discount_tax: string;
  total_shipping: string;
  total_shipping_tax: string;
  total_price: string;
  total_tax: string;
  tax_lines: { name: string; price: string; rate: string }[];
  currency_minor_unit: number;
  currency_symbol: string;
}

export interface ShippingRate {
  rate_id: string;
  name: string;
  price: string;
  selected: boolean;
  method_id: string;
}

export interface ShippingPackage {
  package_id: number;
  name: string;
  shipping_rates: ShippingRate[];
}

export interface AddressInput {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface Cart {
  items: CartItem[];
  fees: CartFee[];
  totals: CartTotals;
  items_count: number;
  items_weight: number;
  needs_shipping: boolean;
  needs_payment: boolean;
  shipping_rates: ShippingPackage[];
  errors: { code?: string; message?: string }[];
}
