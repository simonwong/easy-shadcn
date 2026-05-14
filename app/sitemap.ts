import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const SITE_URL = "https://easy-shadcn.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const docsPages = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/preview`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...docsPages,
  ];
}
