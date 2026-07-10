/**
 * Returns the canonical site origin from NEXT_PUBLIC_SITE_URL.
 *
 * NEXT_PUBLIC_SITE_URL is the ONLY source of truth for all canonical URLs,
 * hreflang URLs, sitemap entries, OG URLs, and metadataBase.
 *
 * Set it in your Vercel (or .env) environment:
 *   Production  →  NEXT_PUBLIC_SITE_URL=https://fieldequip.com
 *   Preview     →  NEXT_PUBLIC_SITE_URL=https://fieldequip.com
 *
 * WHY we do NOT fall back to VERCEL_URL:
 *   Vercel auto-sets VERCEL_URL to the per-deployment hash hostname
 *   (e.g. fieldequip-dpmaj9w14-fieldequip.vercel.app).  It changes on every
 *   deployment.  Using it as a canonical fallback causes every page on every
 *   preview deploy to report a different canonical origin — SEO tools flag
 *   these as "canonical points to a different deployment" errors and Google
 *   cannot consolidate page signals.  If NEXT_PUBLIC_SITE_URL is not set we
 *   fall back to localhost so the misconfiguration is immediately obvious.
 */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteOrigin()}/`);
}

const PREVIEW_ORIGIN = 'https://fieldequip-website.vercel.app';
const CANONICAL_ORIGIN = 'https://www.fieldequip.com';
/** Converts a relative path to an absolute URL, adding a trailing slash to
 *  match the site's `trailingSlash: true` config. Already-absolute URLs are
 *  returned unchanged, except that the Vercel preview origin is replaced with
 *  the canonical production origin so CMS-stored URLs never leak preview
 *  hostnames into the rendered site. */
export function toAbsoluteUrl(pathOrUrl: string | undefined | null): string {
  if (!pathOrUrl) return getSiteOrigin() + '/';
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl.replace(PREVIEW_ORIGIN, CANONICAL_ORIGIN);
  }
  const withSlash = pathOrUrl.endsWith('/') ? pathOrUrl : `${pathOrUrl}/`;
  return new URL(withSlash, `${getSiteOrigin()}/`).href;
}

/**
 * For page routes only (canonical, hreflang, sitemap, OG url).
 *
 * Adds a trailing slash so the resolved URL matches the actually-served URL
 * under `trailingSlash: true` in next.config.ts.  Without this, hreflang URLs
 * point to the non-slash version which returns a 308 redirect — SEO tools and
 * Google flag these as broken alternates.
 *
 * Examples:
 *   toAbsolutePageUrl("/")               → "https://example.com/"
 *   toAbsolutePageUrl("/blog")           → "https://example.com/blog/"
 *   toAbsolutePageUrl("/case-study/x") → "https://example.com/case-study/x/"
 *   toAbsolutePageUrl("https://…/page") → returned as-is
 */
export function toAbsolutePageUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const withSlash = pathOrUrl.endsWith("/") ? pathOrUrl : `${pathOrUrl}/`;
  return new URL(withSlash, `${getSiteOrigin()}/`).href;
}
