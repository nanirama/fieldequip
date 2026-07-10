import { Metadata } from "next";

import { toAbsoluteUrl, toAbsolutePageUrl } from "@/src/utils/siteUrl";

interface SeoProps {
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Central canonical/metadata factory used by every generateMetadata() call.
 *
 * This site is English-only so hreflang language alternates are intentionally
 * omitted. Google does not require hreflang for single-language sites, and
 * incorrect hreflang (URL mismatches) triggers GSC warnings that outweigh any
 * benefit. The <html lang="en"> in layout.tsx already signals the language.
 *
 * Only a self-referencing canonical is set here to consolidate signals.
 */
export function seoGenerateMetadata({
  title,
  description,
  url,
  imageUrl,
}: SeoProps): Metadata {
  const metaImagePath = imageUrl ?? "/og-image.png";
  const absoluteImage = toAbsoluteUrl(metaImagePath);

  const absolutePageUrl = url ? toAbsolutePageUrl(url) : undefined;

  return {
    ...(absolutePageUrl
      ? {
          alternates: {
            canonical: absolutePageUrl,
          },
        }
      : {}),
    title,
    description,
    openGraph: {
      title,
      description,
      images: absoluteImage,
      ...(absolutePageUrl ? { url: absolutePageUrl } : {}),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: absoluteImage,
    },
  };
}

// Organization Schema JSON-LD data
