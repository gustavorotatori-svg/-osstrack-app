import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXTAUTH_URL || "https://osstrack.com.br").replace(/\/$/, "")

  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/cadastro`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/ebook`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ebook/conteudo`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/horarios`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/ajuda`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/lgpd`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/recuperar-senha`, lastModified: now, changeFrequency: "monthly", priority: 0.1 },
  ]
}
