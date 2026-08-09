// src/lib/coaDirectory.ts
//
// Single source of truth for Certificate of Analysis data — both the
// Quality & COAs page (COA_DIRECTORY, all products) and the per-product
// CoaButton/CoaModal (COA_MAP, derived below by slug). These used to be
// two separate hand-maintained datasets (this file and a since-removed
// coaMap.ts) that would have silently drifted apart; reconciled into one
// so that can't happen again.
//
// Content verified two ways:
// - Transcribed directly from the real, currently-live COA documents —
//   not guessed.
// - Every direct-file doc below was checked byte-for-byte (MD5) against
//   what's actually live on purposelabs.shop before being pointed at a
//   local copy. All 13 matched exactly — these are the same documents,
//   just self-hosted instead of linked cross-domain.
//
// Hosting: self-hosted under /public/coas/ for every doc that's a real
// file (image/PDF), rather than linked directly to the WordPress origin
// — this is exactly the risk that materialized: purposelabs.shop's DNS
// moved to this Vercel frontend and WordPress relocated to
// joshuar120.sg-host.com, which would have silently broken every
// hardcoded purposelabs.shop link if they hadn't been self-hosted. The
// two IGF-1-LR3/Tirzepatide entries are the deliberate exception: their
// COA lives behind a full WordPress page (not a raw file), so there's
// nothing static to self-host — those stay as live links built from
// NEXT_PUBLIC_WORDPRESS_ORIGIN (see .env.local) instead of a hardcoded
// domain, so the next backend move doesn't repeat this. CoaModal
// handles a non-file URL gracefully (link-out card instead of a broken
// embed) for exactly this case.

export type CoaDoc = { label: string; url: string };

export type CoaEntry = {
  /** Real WooCommerce product slug — keys COA_MAP below for CoaButton. */
  slug: string;
  lab: string;
  title: string; // product name, may include a line break via \n
  purity: string;
  method?: string;
  storage?: string;
  lot?: string;
  endotoxinTested?: boolean;
  docs: CoaDoc[];
};

export const COA_DIRECTORY: CoaEntry[] = [
  {
    slug: "glp-3-10mg",
    lab: "BT Labs · 2026",
    title: "GLP-3 10MG",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    endotoxinTested: true,
    docs: [
      { label: "View COA (Endotoxins)", url: "/coas/GLP-3-RT-CoA-RT1025-Endotoxins-Jul2026.pdf" },
      { label: "View COA (FTIR/HPLC)", url: "/coas/GLP-3-RT-CoA-Lot-RT1025-FTIR-HPLC.pdf" },
    ],
  },
  {
    slug: "tb-500-10mg",
    lab: "BT Labs · 2026",
    title: "TB-500 10MG",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/TB500-COA.webp" }],
  },
  {
    slug: "bpc-157-10mg",
    lab: "BT Labs · 2026",
    title: "BPC-157 10MG",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/BPC-157-COA.webp" }],
  },
  {
    slug: "ghk-cu-50mg",
    lab: "BT Labs · 2026",
    title: "GHK-CU 50MG",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/GHK-CU-COA.webp" }],
  },
  {
    slug: "mt-2",
    lab: "BT Labs · 2026",
    title: "MT-2",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/MT2-COA.webp" }],
  },
  {
    slug: "cjc-1295-no-dac-ipamorelin",
    lab: "BT Labs · 2026",
    title: "CJC 1295 No DAC",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/CJC-COA.webp" }],
  },
  {
    // RESOLVED: this COA's own "Visual Description" is lyophilized-powder
    // vial packaging, not a nasal spray bottle. Deliberately NOT mapped to
    // "semax-10-mg-spray" — no evidence this tested lot is what's in the
    // spray formulation, and a wrong-product COA is worse than the button
    // not appearing on that page (CoaButton degrades gracefully when a
    // slug has no entry).
    slug: "semax-10mg",
    lab: "BT Labs · 2026",
    title: "Semax 10MG",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/Semax_COA.jpeg" }],
  },
  {
    // RESOLVED — same reasoning as Semax above: vial packaging, not spray.
    // Deliberately NOT mapped to "selank-10mg-nasal-spray".
    slug: "selank-10mg",
    lab: "BT Labs · 2026",
    title: "Selank 10MG",
    purity: "≥99%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/Selank_COA.jpeg" }],
  },
  {
    slug: "mots-c-10mg",
    lab: "BT Labs · 2026",
    title: "MOTS-C 10MG",
    purity: "99.7%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/MOTS_COA.jpg" }],
  },
  {
    // FLAG — dosage mismatch, not a slug problem, and NOT resolved by
    // this reconciliation: re-verified directly against the live document
    // (byte-identical MD5 to the file already flagged here previously,
    // just re-uploaded to WordPress under a different filename). It still
    // tests against a "500 mg" specification ("Content/Potency: 500 mg",
    // "Specifications: 90–110% of 500mg"), while the product it's mapped
    // to is sold as "NAD+ 600mg". Please confirm which is correct before
    // this goes live — attaching a COA for the wrong strength is worse
    // than no COA at all.
    slug: "nad-600mg",
    lab: "BT Labs · 2026",
    title: "NAD+ 600MG",
    purity: "99.8%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/NAD__COA.jpg" }],
  },
  {
    slug: "klow-80mg",
    lab: "BT Labs · 2026",
    title: "KLOW 80MG",
    purity: "99.7%",
    method: "FTIR + HPLC",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/KLOW_COA.jpg" }],
  },
  {
    slug: "tesamorelin-5mg",
    lab: "BT Labs · 2026",
    title: "Tesamorelin 5MG",
    purity: "99.7%",
    storage: "R.T.",
    docs: [{ label: "View COA", url: "/coas/tesamorelin-5mg-coa.pdf" }],
  },
  {
    // No local file: this COA lives behind a full WordPress page, not a
    // raw file — confirmed the page embeds a direct image
    // (igf-1-lr3-coa-lot-IG18584-1.jpg) but the Quality page intentionally
    // links to the friendlier branded page instead. CoaModal (used by the
    // per-product CoaButton) renders a link-out card rather than trying
    // to embed this URL as an image.
    slug: "igf-1-lr3-1mg",
    lab: "Freedom Diagnostics · 2026",
    title: "IGF-1-LR3 1MG",
    purity: "99.56%",
    method: "HPLC-UV + LC-MS",
    lot: "IG18584",
    docs: [{ label: "View COA", url: "/coas/IGF-1-LR3-COA.jpg" }],
  },
  {
    // Same as IGF-1-LR3 above — page link, not a raw file.
    slug: "tirzepatide-10mg",
    lab: "Freedom Diagnostics · 2026",
    title: "Tirzepatide 10MG",
    purity: "99.74%",
    method: "HPLC-UV + LC-MS",
    lot: "TR8585",
    docs: [{ label: "View COA", url: "/coas/TIRZ-COA.jpg" }],
  },
];

export const COA_STATS = [
  { value: "≥99%", label: "Purity" },
  { value: "100%", label: "Batch Tested" },
  { value: "3RD", label: "Party Lab" },
  { value: "HPLC", label: "Method" },
];

/** Derived from COA_DIRECTORY, not hand-duplicated — see module comment. */
export const COA_MAP: Record<string, CoaDoc[]> = Object.fromEntries(
  COA_DIRECTORY.map((entry) => [entry.slug, entry.docs])
);
