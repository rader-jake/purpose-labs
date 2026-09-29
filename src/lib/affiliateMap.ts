/**
 * Affiliate ID → WooCommerce coupon code mapping.
 * Key = Affiliatly affiliate ID (from ?aff= URL param)
 * Value = their WooCommerce coupon code (lowercase)
 * Last updated: 2026-09-21 from Affiliatly export
 */
export const AFFILIATE_COUPON_MAP: Record<string, string> = {
  "2": "wamis",        // ando
  "3": "jess92",       // Jessica
  "4": "macypep",      // Macy
  "6": "obfit",        // Owen Borbe
  "8": "thewiz",       // Santiago Mastoridis
  "11": "phil",        // Ryan Mathes
  "12": "jponder29",   // Joey Ponder
  "13": "domm",        // Dom liquari
  "15": "fitb26",      // Breyden Marquis
  "16": "twan",        // antwan
  "17": "shane",       // Shane Perez
  "18": "elmer2great", // Elmer
  "20": "domm1",       // Domenique
  "22": "aj513",       // Ashly Spicer
  "23": "eman",        // Erwin Guillen
  "24": "matheus10",   // Matheus
  "26": "alex2",       // Alexander SanJuan
  "27": "joeyg",       // Joseph Velez
  "28": "cesar100",    // Cesar D Gomez Suarez
  "30": "hary",        // Hary Martinez
  "31": "duul",        // Abdullah Imran
  "33": "lucca",       // Lucca Lien
  "34": "mr9",         // Antonio
  "35": "callmelash",  // Jacqueline Marie Evans
  "36": "esoderrick",  // Derrick Mei
  "37": "fin",         // Finley
  "38": "pimp",        // Marc V
  "39": "chadrick",    // Chad Malinowski
  "40": "jake",        // Jake rodgers
  "41": "1wayfranco",  // Franco Nestico
  "42": "nattyisra",   // Israel De Leon
  "43": "darker",      // Darker
  "44": "cells",       // Alexander Cells
  "45": "kristyg",     // KristyG
  "46": "arielj",      // ArielJ
  "47": "c4iden",      // c4iden
  "48": "blatina",     // Blaatina
  "49": "peyton",      // Peyton Buzzell
  "50": "vic10",       // Victor bobadilla
  "51": "jen32",       // Jennifer Baltazar
  "52": "edel",        // Edel Orahim
  "53": "kayla10",     // Kayla
  "54": "lex",         // LEX
  "55": "ebony",       // ebony
  "56": "gemtren",     // Gemtren
  "57": "atreya",      // Atreya monaghan david
  "58": "sabrinaj",    // Sabrina Jean
  "59": "fitzepm",     // fredy
  "61": "ryang",       // Ryan
  "62": "pep10",       // Aldo Gomez
  "63": "madigan",     // Joseph Madigan
  "64": "graccid",     // Gracci
  "65": "trxgger",     // Alex Saiz
  "68": "jdn",         // jdn
  "69": "rose10",      // angelica rose
  "70": "victoria10",  // Victoria
  "71": "spice",       // Spice Brooks
  "72": "anika",       // Anika
  "74": "eddy10",      // edward
  "75": "ramis",       // Ramis
  "76": "swrv",        // SWRV
  "87": "rpep",        // RPEP
  "77": "habibi_zeegt", // Zeid najjar
  "78": "odalys",      // Odalys
  "79": "fear",        // Feroze Khan
};

export function getCouponForAffiliate(affId: string | null | undefined): string | null {
  if (!affId) return null;
  return AFFILIATE_COUPON_MAP[affId] ?? null;
}
