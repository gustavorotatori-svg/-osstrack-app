import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://osstrack.app"

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/cadastro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/recuperar-senha`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/lgpd`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/ajuda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/ebook`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]
}
