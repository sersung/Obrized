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
      url: `${baseUrl}/privacy`,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/case-studies/maple-ridge`,
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
