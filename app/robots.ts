import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/src/utils/siteUrl";
/**
 * Generates /robots.txt at build time.
 *
 * Goals:
 *  1. Full crawl access for all search engines on all public routes.
 *  2. Explicit welcome for every major AI search / LLM crawler so FieldEquip
 *     content is indexed for ChatGPT Search, Perplexity, Google AI Overviews,
 *     Claude.ai, and other AI assistants (AEO / GEO strategy).
 *  3. Block all internal routes — API endpoints, Sanity Studio CMS admin.
 *  4. Point crawlers to the XML sitemap and llms.txt.
 *
 * NOTE: /_next/ is intentionally NOT blocked. Googlebot requires access to
 * Next.js JS/CSS bundles to fully render and index server-rendered pages.
 * Blocking it degrades crawl quality and can suppress rankings.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  if (process.env.NEXT_DEVELOPMENT_ENV !== 'production') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  // Routes that must never be crawled or indexed.
  const disallow = [
    // ── Next.js / Sanity internals ─────────────────────────────────────────
    "/api/",                 // Internal webhooks & cron — not public content
    "/studio/",              // Sanity Studio CMS admin panel

    // ── WordPress / legacy admin paths ────────────────────────────────────
    "/wp-admin/",            // WordPress admin (old site remnant)
    "/fe-wp-login/",         // Custom WP login page

    // ── Dev / staging / test paths ────────────────────────────────────────
    "/dev",                  // Dev root (no trailing slash)
    "/dev/",                 // Dev directory
    "/deve/",                // Alternate dev path
    "/devp/",                // Alternate dev path
    "/bursys_demo",          // Demo/test environment

    // ── Internal / restricted content ─────────────────────────────────────
    "/wlshowcase",           // Whitelist showcase (internal)
    "/clients/",             // Client-only pages
    "/companies/",           // Internal company directory
    "/companies/abraj",      // Specific company page (covered by /companies/ above)
    "/technology/",          // Internal technology section

    // ── Old / archived pages ──────────────────────────────────────────────
    "/company-newsroom21/",  // Archived 2021 newsroom
    "/company-newsroom22/",  // Archived 2022 newsroom
    "/linked-in-5/",         // LinkedIn campaign landing (archived)
    "/linked-in-56/",        // LinkedIn campaign landing (archived)
    "/logos-fe-and-btx/",    // Internal brand assets page
    "/policypage/",          // Replaced by /legal/ routes

    // ── Legal pages (no SEO value, handled via sitemap exclusion) ─────────
    "/legal/",                                    // All /legal/* sub-pages
    "/legal/subscription-terms/",                 // Legal subscription terms index
    "/legal/subscription-terms/print/",           // Print version
    "/legal/subscription-terms/online/",          // Online version
  ];

  return {
    rules: [
      // ── All crawlers ───────────────────────────────────────────────────────
      // Default: crawl every public page, block internals.
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },

      // ── AI search crawlers ─────────────────────────────────────────────────
      // Explicitly welcome all major AI crawlers.
      // These bots already inherit the * rule above; listing them here is
      // declarative intent — it signals AEO-readiness and future-proofs against
      // any platform-level block-lists or crawl-budget restrictions.
      //
      // Bots that power AI answer engines (ChatGPT Search, Perplexity,
      // Google AI Overviews, Apple Intelligence, Meta AI, Claude):
      // {
      //   userAgent: [
      //     "GPTBot",            // OpenAI — ChatGPT training + ChatGPT Search
      //     "OAI-SearchBot",     // OpenAI — search index crawler
      //     "ChatGPT-User",      // OpenAI — ChatGPT browsing plugin
      //     "ClaudeBot",         // Anthropic — Claude.ai
      //     "anthropic-ai",      // Anthropic — secondary UA
      //     "PerplexityBot",     // Perplexity AI search
      //     "Google-Extended",   // Google — Gemini / AI Overviews content
      //     "Applebot",          // Apple — Safari Suggestions + Spotlight
      //     "Applebot-Extended", // Apple — Apple Intelligence / Siri
      //     "Meta-ExternalAgent",// Meta — Meta AI assistant
      //     "Bytespider",        // ByteDance — TikTok AI
      //     "cohere-ai",         // Cohere AI search
      //     "YouBot",            // You.com AI search
      //     "Diffbot",           // Diffbot knowledge graph
      //     "Brightbot",         // Bright Data AI
      //     "iaskspider",        // iAsk.ai search engine
      //     "Timpibot",          // Timpi search
      //   ],
      //   allow: "/",
      //   disallow,
      // },
    ],
    // Primary XML sitemap — canonical URLs, change frequencies, priorities.
    sitemap: `${origin}/sitemap.xml`,
  };
}