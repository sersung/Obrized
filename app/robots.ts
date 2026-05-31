import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://obrized.com";

  return {
    rules: [
      // Allow all good bots to crawl public marketing pages
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/register",
          "/sitemap.xml",
          "/robots.txt",
        ],
        disallow: [
          // Block all authenticated / private dashboard routes
          "/dashboard/",
          "/api/",
          "/settings/",
          // Block internal Next.js assets
          "/_next/",
          "/static/",
        ],
      },
      // Allow Google's main crawler full marketing access
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/settings/",
        ],
      },
      // Allow Bing Bot full marketing access
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/settings/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
