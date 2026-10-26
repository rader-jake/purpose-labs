"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/tiktok-pixel";

export function TikTokSearchEvent({ query }: { query: string }) {
  useEffect(() => {
    if (query) trackSearch(query);
  }, [query]);
  return null;
}
