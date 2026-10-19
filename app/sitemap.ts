import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { source } from "@/lib/source";

// No `lastModified`: a build timestamp would claim every page changed on every
// deploy, which teaches crawlers to ignore the field.
export default function sitemap(): MetadataRoute.Sitemap {
  const docsPages = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/preview`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...docsPages,
  ];
}
