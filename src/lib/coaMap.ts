// src/lib/coaMap.ts
//
// Keys verified against the real 22-product catalog (fetched directly via
// the WooCommerce REST API — GET /wp-json/wc/v3/products?per_page=100&
// status=any, not the 20-product default the storefront was using, which
// was silently missing one product). All files are placed in
// storefront/public/coas/ — 8 filenames matched what was requested
// exactly; 5 had space-vs-underscore mismatches (e.g. "KLOW COA.jpg" vs
// the expected "KLOW_COA.jpg") and were renamed on copy to match.

import type { CoaDocument } from "@/components/CoaModal";

export const COA_MAP: Record<string, CoaDocument[]> = {
  "bpc-157-10mg": [{ label: "Certificate of Analysis", url: "/coas/BPC-157-COA.webp" }],

  "cjc-1295-no-dac-ipamorelin": [
    { label: "Certificate of Analysis", url: "/coas/CJC-COA.webp" },
  ],

  "ghk-cu-50mg": [{ label: "Certificate of Analysis", url: "/coas/GHK-CU-COA.webp" }],

  // RESOLVED (was flagged): read both PDFs directly. Both list "Labeled
  // as: GLP-3_RT" and "Testing material: Retatrutide", same lot (RT_1025)
  // — so "GLP-3" is this business's commercial name for Retatrutide, not
  // a different compound. Confirmed correct for "glp-3-10mg".
  "glp-3-10mg": [
    {
      label: "Certificate of Analysis — FTIR/HPLC",
      url: "/coas/GLP-3-RT-CoA-Lot-RT1025-FTIR-HPLC.pdf",
    },
    {
      label: "Certificate of Analysis — Endotoxins",
      url: "/coas/GLP-3-RT-CoA-RT1025-Endotoxins-Jul2026.pdf",
    },
  ],

  "klow-80mg": [{ label: "Certificate of Analysis", url: "/coas/KLOW_COA.jpg" }],

  "mots-c-10mg": [{ label: "Certificate of Analysis", url: "/coas/MOTS_COA.jpg" }],

  "mt-2": [{ label: "Certificate of Analysis", url: "/coas/MT2-COA.webp" }],

  // FLAG — dosage mismatch, not a slug problem: this COA's own table
  // tests against a "500 mg" specification ("Content/Potency: 500 mg",
  // "Specifications: 90–110% of 500mg"), but the product it's mapped to
  // is sold as "NAD+ 600mg". Either this is an older/different batch
  // than what's currently sold under that name, or the product's stated
  // dosage and the tested dosage genuinely don't match — please confirm
  // which before this goes live; attaching a COA for the wrong strength
  // is worse than no COA at all.
  "nad-600mg": [{ label: "Certificate of Analysis", url: "/coas/NAD__COA.jpg" }],

  // RESOLVED (was flagged as possibly needing both Selank variants):
  // the COA's own "Visual Description" reads "Small clear vial... silver
  // crimp, black plastic cap" — that's lyophilized-powder vial packaging,
  // not a nasal spray bottle. Mapped only to the vial product
  // ("selank-10mg"); deliberately NOT mapped to "selank-10mg-nasal-spray"
  // since there's no evidence this tested lot is what's in the spray
  // formulation, and a wrong-product COA is worse than the button not
  // appearing on the spray page (CoaButton already degrades gracefully
  // to rendering nothing when a slug has no entry).
  "selank-10mg": [{ label: "Certificate of Analysis", url: "/coas/Selank_COA.jpeg" }],

  // RESOLVED — same reasoning as Selank above: "Small clear vial...
  // silver crimp, dark blue plastic cap" is vial packaging. Mapped only
  // to "semax-10mg", not "semax-10-mg-spray".
  "semax-10mg": [{ label: "Certificate of Analysis", url: "/coas/Semax_COA.jpeg" }],

  "tb-500-10mg": [{ label: "Certificate of Analysis", url: "/coas/TB500-COA.webp" }],

  "tesamorelin-5mg": [
    { label: "Certificate of Analysis", url: "/coas/tesamorelin-5mg-coa.pdf" },
  ],
};
