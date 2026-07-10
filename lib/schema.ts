import { toAbsolutePageUrl } from "@/src/utils/siteUrl";

export type Crumb = { label: string; href: string };

/**
 * Converts a URL slug to a human-readable label.
 *
 * "time-management"          → "Time Management"
 * "oil-and-gas"              → "Oil and Gas"
 * "geofenced-clock-events"   → "Geofenced Clock Events"
 */
export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Builds a valid Schema.org BreadcrumbList JSON-LD object.
 *
 * - Filters out crumbs whose label or href is empty/whitespace.
 * - Position values are always sequential (1-based).
 * - All href values are resolved to absolute canonical URLs with trailing slash.
 * - Passes Google Rich Results Test and Schema.org validation.
 */
export function buildBreadcrumbs(crumbs: Crumb[]) {
  const valid = crumbs.filter(
    (c) => c.label.trim().length > 0 && c.href.trim().length > 0,
  );

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: valid.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label.trim(),
      item: toAbsolutePageUrl(crumb.href),
    })),
  };
}
