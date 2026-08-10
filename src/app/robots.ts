import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXTAUTH_URL || "https://osstrack.com.br").replace(/\/$/, "")

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/convite/", "/screenshot/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
