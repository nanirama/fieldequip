import type { MetadataRoute } from "next";
import { cacheTag, cacheLife } from "next/cache";

import { getSiteOrigin } from "@/src/utils/siteUrl";
import {
  loadPageSlugs,
  loadProductSlugs,
  loadPostSlugs,
  loadLegalPageSlugs,
  loadIndustrySlugs,
  loadConversionPageSlugs,
  loadCaseStudySlugs,
  loadIntegrationSlugs,
  loadWhitePaperSlugs,
} from "@/src/sanity/loader/loadQuery";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SitemapEntry = MetadataRoute.Sitemap[number];

/** Absolute page URL with trailing slash (matches trailingSlash: true). */
function url(origin: string, path: string): string {
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `${origin}${withSlash}`;
}

function entry(
  origin: string,
  path: string,
  changeFrequency: SitemapEntry["changeFrequency"] = "monthly",
  priority = 0.7
): SitemapEntry {
  return {
    url: url(origin, path),
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

/** Extract slugs from any loadQuery result. */
function slugs(data: unknown): string[] {
  const rows = data as { slug?: string }[] | null | undefined;
  return (rows ?? [])
    .map((r) => r?.slug)
    .filter((s): s is string => typeof s === "string" && s.length > 0);
}

// ---------------------------------------------------------------------------
// Cached slug fetching — 24 h TTL, invalidated by Sanity webhook
// ---------------------------------------------------------------------------

type SitemapSlugs = {
  pages: string[];
  products: string[];
  posts: string[];
  legal: string[];
  industries: string[];
  conversions: string[];
  caseStudies: string[];
  integrations: string[];
  whitePapers: string[];
};

async function fetchSitemapSlugs(): Promise<SitemapSlugs> {
  "use cache: remote";
  cacheTag("sitemap");
  cacheLife({ revalidate: 86400 });

  const [
    pageResult,
    productResult,
    postResult,
    legalResult,
    industryResult,
    conversionResult,
    caseStudyResult,
    integrationResult,
    whitePaperResult,
  ] = await Promise.all([
    loadPageSlugs().catch(() => []),
    loadProductSlugs().catch(() => []),
    loadPostSlugs().catch(() => []),
    loadLegalPageSlugs().catch(() => []),
    loadIndustrySlugs().catch(() => []),
    loadConversionPageSlugs().catch(() => []),
    loadCaseStudySlugs().catch(() => []),
    loadIntegrationSlugs().catch(() => []),
    loadWhitePaperSlugs().catch(() => []),
  ]);

  return {
    pages: slugs(pageResult),
    products: slugs(productResult),
    posts: slugs(postResult),
    legal: slugs(legalResult),
    industries: slugs(industryResult),
    conversions: slugs(conversionResult),
    caseStudies: slugs(caseStudyResult),
    integrations: slugs(integrationResult),
    whitePapers: slugs(whitePaperResult),
  };
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NEXT_DEVELOPMENT_ENV !== 'production') return [];

  const origin = getSiteOrigin();

  // ── Static routes ─────────────────────────────────────────────────────────
  const staticEntries: MetadataRoute.Sitemap = [
    entry(origin, "/",                       "weekly",  1.0),
    entry(origin, "/blog",                   "daily",   0.9),
    entry(origin, "/case-studies",           "weekly",  0.8),
    entry(origin, "/integrations",           "weekly",  0.8),
    entry(origin, "/whitepaper",             "monthly", 0.7),
    entry(origin, "/videos-testimonials",    "monthly", 0.6),
    entry(origin, "/thank-you",              "yearly",  0.3),
  ];

  // ── Fetch all dynamic slugs (cached 24 h) ────────────────────────────────
  const data = await fetchSitemapSlugs();

  // ── Catch-all /[slug] pages — each type gets its own priority ───────────────
  // Deduplicate within each group first, then across groups (higher-priority wins).
  const seen = new Set<string>();
  const catchAllEntries: MetadataRoute.Sitemap = [];

  const catchAllGroups: Array<{ slugs: string[]; freq: SitemapEntry["changeFrequency"]; pri: number }> = [
    { slugs: data.pages,       freq: "weekly",  pri: 0.8 },
    { slugs: data.products,    freq: "weekly",  pri: 0.8 },
    { slugs: data.industries,  freq: "monthly", pri: 0.7 },
    { slugs: data.conversions, freq: "monthly", pri: 0.7 },
    { slugs: data.posts,       freq: "weekly",  pri: 0.6 },
    { slugs: data.legal,       freq: "yearly",  pri: 0.3 },
  ];

  for (const { slugs: group, freq, pri } of catchAllGroups) {
    for (const s of group) {
      if (!seen.has(s)) {
        seen.add(s);
        catchAllEntries.push(entry(origin, `/${s}`, freq, pri));
      }
    }
  }

  // ── /case-study/[slug] ───────────────────────────────────────────────────
  const caseStudyEntries = data.caseStudies.map((s) =>
    entry(origin, `/case-study/${s}`, "monthly", 0.7)
  );

  // ── /integrations/[slug] ─────────────────────────────────────────────────
  const integrationEntries = data.integrations.map((s) =>
    entry(origin, `/integrations/${s}`, "monthly", 0.6)
  );

  // ── /whitepaper/[slug] ────────────────────────────────────────────────────
  const whitePaperEntries = data.whitePapers.map((s) =>
    entry(origin, `/whitepaper/${s}`, "monthly", 0.6)
  );

  const allEntries = [
    ...staticEntries,
    ...catchAllEntries,
    ...caseStudyEntries,
    ...integrationEntries,
    ...whitePaperEntries,
  ];

  // ── Sitemap summary ───────────────────────────────────────────────────────
  console.log('\n📄 Sitemap build summary\n');
  console.table([
    { Section: 'Static utility pages (home, blog, integrations, etc.)', Count: staticEntries.length },
    { Section: 'Core pages (pages doc type)',                           Count: data.pages.length },
    { Section: 'Feature / product pages',                               Count: data.products.length },
    { Section: 'Blog / articles',                                       Count: data.posts.length },
    { Section: 'Industry pages',                                        Count: data.industries.length },
    { Section: 'Conversion pages (demo, quote, ROI, etc.)',             Count: data.conversions.length },
    { Section: 'Legal pages (terms, privacy, cookie)',                  Count: data.legal.length },
    { Section: 'Case study pages (/case-study/)',                       Count: data.caseStudies.length },
    { Section: 'Integration pages (/integrations/)',                    Count: data.integrations.length },
    { Section: 'Whitepaper pages (/whitepaper/)',                       Count: data.whitePapers.length },
    { Section: '─────────────────────────────────────────────────────', Count: '─────' },
    { Section: 'TOTAL URLs',                                            Count: allEntries.length },
  ]);
  console.log('');

  return allEntries;
}
