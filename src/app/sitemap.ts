import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://purposelabs.shop";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/quality`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal/disclaimer`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/legal/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/shipping-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}
