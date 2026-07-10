import { cacheTag, cacheLife } from "next/cache";

import { getSiteOrigin } from "@/src/utils/siteUrl";
import {
  loadAllIndustries,
  loadAllIntegrations,
  loadAllProducts,
  loadBlogPosts,
  loadCaseStudiesall,
  loadWhitePapersList,
} from "@/src/sanity/loader/loadQuery";

type Post = { title: string; slug: string; excerpt?: string | null };
type Integration = {
  title: string;
  slug: string;
  shortDescription?: string | null;
  listingOnly?: boolean | null;
};
type Industry = { title: string; slug: string; shortDescription?: string | null };
type Product = { title: string; slug: string };
type CaseStudy = {
  name: string;
  slug: string;
  shortDescription?: string | null;
  industry?: string | null;
};
type WhitePaper = { name: string; slug: string; shortDescription?: string | null };

type LlmsData = {
  posts: Post[];
  integrations: Integration[];
  industries: Industry[];
  products: Product[];
  caseStudies: CaseStudy[];
  whitePapers: WhitePaper[];
};

// Cached at the Data Cache level — rebuilt at most once per hour.
// Sanity webhook can invalidate on-demand via revalidateTag('llms-txt'). this
async function fetchLlmsData(): Promise<LlmsData> {
  "use cache: remote";
  cacheTag("llms-txt");
  cacheLife({ revalidate: 3600 });

  const [postsRes, integrationsRes, industriesRes, productsRes, caseStudiesRes, whitePapersRes] =
    await Promise.all([
      loadBlogPosts().catch(() => ({ data: null })),
      loadAllIntegrations().catch(() => ({ data: null })),
      loadAllIndustries().catch(() => ({ data: null })),
      loadAllProducts().catch(() => ({ data: null })),
      loadCaseStudiesall().catch(() => ({ data: null })),
      loadWhitePapersList().catch(() => ({ data: null })),
    ]);

  return {
    posts: ((postsRes.data as Post[] | null) ?? []).slice(0, 30),
    integrations: ((integrationsRes.data as Integration[] | null) ?? []).filter(
      (i) => !i.listingOnly,
    ).slice(0, 40),
    industries: (industriesRes.data as Industry[] | null) ?? [],
    products: (productsRes.data as Product[] | null) ?? [],
    caseStudies: (caseStudiesRes.data as CaseStudy[] | null) ?? [],
    whitePapers: (whitePapersRes.data as WhitePaper[] | null) ?? [],
  };
}

export async function GET() {
  const origin = getSiteOrigin();
  const { posts, integrations, industries, products, caseStudies, whitePapers } =
    await fetchLlmsData();

  const lines: string[] = [
    "# FieldEquip",
    "",
    "> FieldEquip is a field service management (FSM) software platform that helps businesses digitize work orders, schedule and dispatch field technicians, track equipment assets, and manage field operations — eliminating paper and unnecessary intermediaries.",
    "",
    // ── Company ────────────────────────────────────────────────────────────────
    "## Company",
    `- [Home](${origin}/): Platform overview and core field service management capabilities`,
    `- [Why FieldEquip](${origin}/why-fieldequip/): Why companies choose FieldEquip over alternatives`,
    `- [About Us](${origin}/about-us/): Company background, team, and mission`,
    `- [Careers](${origin}/careers/): Open positions and working at FieldEquip`,
    `- [Compliance & Certifications](${origin}/compliance-and-certifications/): Security and compliance standards including SOC 2 Type II`,
    `- [AI](${origin}/ai/): AI-powered capabilities within the FieldEquip platform`,
    "",
    // ── Get Started ────────────────────────────────────────────────────────────
    "## Get Started",
    `- [Book a Demo](${origin}/demo/): Schedule a product demonstration`,
    `- [Get a Quote](${origin}/get-a-quote/): Request pricing information`,
    `- [ROI Calculator](${origin}/roi-calculator/): Calculate return on investment`,
    `- [Contact](${origin}/contact/): Sales enquiries and customer support`,
    "",
  ];

  // ── Products ─────────────────────────────────────────────────────────────────
  if (products.length > 0) {
    lines.push("## Products & Features");
    for (const product of products) {
      lines.push(`- [${product.title}](${origin}/${product.slug}/)`);
    }
    lines.push("");
  }

  // ── Industries ───────────────────────────────────────────────────────────────
  if (industries.length > 0) {
    lines.push("## Industries Served");
    for (const industry of industries) {
      const desc = industry.shortDescription ? `: ${industry.shortDescription}` : "";
      lines.push(`- [${industry.title}](${origin}/${industry.slug}/)${desc}`);
    }
    lines.push("");
  }

  // ── Integrations ─────────────────────────────────────────────────────────────
  if (integrations.length > 0) {
    lines.push("## Integrations");
    for (const integration of integrations) {
      const desc = integration.shortDescription ? `: ${integration.shortDescription}` : "";
      lines.push(`- [${integration.title}](${origin}/integrations/${integration.slug}/)${desc}`);
    }
    lines.push("");
  }

  // ── Resources (index pages) ──────────────────────────────────────────────────
  lines.push("## Resources");
  lines.push(`- [Blog](${origin}/blog/): Field service management articles, guides, and industry insights`);
  lines.push(`- [Case Studies](${origin}/case-studyies/): Customer success stories with measurable outcomes`);
  lines.push(`- [White Papers](${origin}/whitepaper/): In-depth research reports on field service trends`);
  lines.push(`- [Video Testimonials](${origin}/videos-testimonials/): Customer video testimonials`);
  lines.push("");

  // ── Case Studies ─────────────────────────────────────────────────────────────
  if (caseStudies.length > 0) {
    lines.push("## Case Studies");
    for (const cs of caseStudies) {
      const desc = cs.shortDescription
        ? `: ${cs.shortDescription}`
        : cs.industry
          ? ` — ${cs.industry}`
          : "";
      lines.push(`- [${cs.name}](${origin}/case-study/${cs.slug}/)${desc}`);
    }
    lines.push("");
  }

  // ── White Papers ─────────────────────────────────────────────────────────────
  if (whitePapers.length > 0) {
    lines.push("## White Papers");
    for (const wp of whitePapers) {
      const desc = wp.shortDescription ? `: ${wp.shortDescription}` : "";
      lines.push(`- [${wp.name}](${origin}/whitepaper/${wp.slug}/)${desc}`);
    }
    lines.push("");
  }

  // ── Blog Articles ─────────────────────────────────────────────────────────────
  if (posts.length > 0) {
    lines.push("## Blog Articles");
    for (const post of posts) {
      const desc = post.excerpt ? `: ${post.excerpt}` : "";
      lines.push(`- [${post.title}](${origin}/${post.slug}/)${desc}`);
    }
    lines.push("");
  }

  // ── Legal ────────────────────────────────────────────────────────────────────
  lines.push("## Legal");
  lines.push(`- [Privacy Policy](${origin}/privacy-policy/)`);
  lines.push(`- [Terms of Service](${origin}/terms-of-service/)`);
  lines.push(`- [Cookie Policy](${origin}/cookie-policy/)`);
  lines.push(`- [GDPR Compliance](${origin}/gdpr-compliance/)`);
  lines.push(`- [Subscription Terms](${origin}/legal/subscription-terms/)`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
