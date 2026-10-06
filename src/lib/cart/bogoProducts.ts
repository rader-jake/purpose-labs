export interface BogoProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  group: 1 | 2 | 3;
}

export const BOGO_PRODUCTS: BogoProduct[] = [
  // Group 1 — $49.99
  { id: 2060, name: "Glutathione", price: 49.99, group: 1, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/08/C3B859D1-19E0-4A7A-AC40-0A866C70C6E0.png" },
  { id: 102, name: "MT2", price: 49.99, group: 1, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-06_12_43-PM.png" },
  { id: 831, name: "GHK-Cu 50mg", price: 49.99, group: 1, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-06_26_43-PM.png" },
  { id: 799, name: "Selank Vial", price: 49.99, group: 1, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-05_51_10-PM.png" },
  { id: 796, name: "Semax Vial", price: 49.99, group: 1, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-05_45_50-PM.png" },
  { id: 1271, name: "L-Carnitine", price: 49.99, group: 1, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/06/L-Carnitine.png" },
  // Group 2 — $75
  { id: 1188, name: "NAD+", price: 75.00, group: 2, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/06/ChatGPT-Image-Jul-23-2026-06_03_09-PM.png" },
  { id: 1187, name: "MOTS-C", price: 75.00, group: 2, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/06/ChatGPT-Image-Jul-23-2026-06_00_23-PM.png" },
  { id: 801, name: "Selank Spray", price: 75.00, group: 2, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-24-2026-01_27_20-PM.png" },
  { id: 806, name: "Semax Spray", price: 75.00, group: 2, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-24-2026-01_29_53-PM.png" },
  { id: 832, name: "GHK-Cu 100mg", price: 75.00, group: 2, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-06_26_43-PM.png" },
  // Group 3 — $90
  { id: 100, name: "PL 3RT", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/09/PL-RT-original.png" },
  { id: 95, name: "BPC-157", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-06_06_05-PM.png" },
  { id: 103, name: "TB-500", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-06_18_14-PM.png" },
  { id: 2069, name: "BPC-157 + TB-500 Stack", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/08/3145B71D-B2EB-4BE9-BFB5-6F8F3DBDA33F.png" },
  { id: 97, name: "CJC + Ipamorelin", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-05_57_26-PM.png" },
  { id: 1421, name: "KLOW", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/ChatGPT-Image-Jul-23-2026-06_37_58-PM.png" },
  { id: 1936, name: "PL TZ", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/PL-TZ-1.png" },
  { id: 1546, name: "PL TESA", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/PL-TESA.png" },
  { id: 1931, name: "IGF-1 LR3", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/ChatGPT-Image-Jul-23-2026-06_32_54-PM.png" },
  { id: 831, name: "GHK-Cu 50mg x3", price: 90.00, group: 3, image: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-06_26_43-PM.png" },
];

export const BOGO_PRODUCT_IDS = new Set(BOGO_PRODUCTS.map((p) => p.id));

export function getBogoGroup(productId: number): 1 | 2 | 3 | null {
  return BOGO_PRODUCTS.find((p) => p.id === productId)?.group ?? null;
}

export function getBogoEligibleFreeProducts(purchasedProductId: number): BogoProduct[] {
  const group = getBogoGroup(purchasedProductId);
  if (!group) return [];
  return BOGO_PRODUCTS.filter((p) => p.group === group);
}
