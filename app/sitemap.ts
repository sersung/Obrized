import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://obrized.com";
  const updated = new Date("2026-01-01");

  return [
    {
      url: baseUrl,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
