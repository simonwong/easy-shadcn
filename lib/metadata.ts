import type { Metadata } from 'next/types';
import { alt, size } from '@/app/opengraph-image';

// Production origin. Canonical URLs, og:image, robots and sitemap all resolve
// against it, so it must never be a per-deployment *.vercel.app host: those
// are served with `x-robots-tag: noindex`.
export const SITE_URL = 'https://easy-shadcn.vercel.app';

export function createMetadata(override: Metadata): Metadata {
  const canonical = override.alternates?.canonical;

  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url:
        canonical && typeof canonical === 'object' && 'url' in canonical
          ? canonical.url
          : (canonical ?? undefined),
      siteName: 'Easy Shadcn',
      // A segment that sets `openGraph` stops inheriting the root
      // `opengraph-image`, so point at it explicitly.
      images: { url: '/opengraph-image', alt, ...size },
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@simonwong',
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: { url: '/twitter-image', alt, ...size },
      ...override.twitter,
    },
    alternates: {
      ...override.alternates,
    },
  };
}

export const baseUrl =
  process.env.NODE_ENV === 'development'
    ? new URL('http://localhost:3000')
    : new URL(SITE_URL);
