/**
 * FaqSchema — Server Component only.
 *
 * Emits a <script type="application/ld+json"> FAQPage structured data block.
 * JSON-LD scripts are NOT executed by the browser (they are data, not code),
 * so this component has zero JavaScript cost, zero hydration, and zero Core
 * Web Vitals impact.
 *
 * Two usage modes:
 *
 *   // 1. Via flexible-content sections (product/page/industry pages):
 *   <FaqSchema sections={page.sections} />
 *
 *   // 2. Via directly-fetched faqs documents (home page, custom routes):
 *   <FaqSchema items={faqDocs} />
 *
 * Returns null when there are no FAQ items — always safe to render unconditionally.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

type FaqItem = {
  question: string;
  answer: string;
};

/** Raw Sanity 'faqs' document shape (as returned by allFaqsQuery). */
export type SanityFaqDoc = {
  _id?: string;
  question?: string;
  answer?: unknown; // Portable Text blocks
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Walk a Portable Text block tree → plain string for schema Answer text. */
function portableTextToPlainText(value: unknown): string {
  const parts: string[] = [];

  const visit = (node: unknown): void => {
    if (typeof node === "string") {
      parts.push(node);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const r = node as Record<string, unknown>;
    if (typeof r.text === "string") parts.push(r.text);
    if (Array.isArray(r.children)) r.children.forEach(visit);
    if (Array.isArray(r.content)) r.content.forEach(visit);
    if (Array.isArray(r.answer)) r.answer.forEach(visit);
  };

  visit(value);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Extract FAQ items from a sections[] array containing one or more faqSection
 * entries (each section holds faqs[] references resolved via faqSectionFragment).
 */
export function extractFaqSchemaItems(sections: unknown[] | undefined): FaqItem[] {
  if (!Array.isArray(sections) || sections.length === 0) return [];

  const out: FaqItem[] = [];

  for (const section of sections) {
    if (!section || typeof section !== "object") continue;
    const s = section as Record<string, unknown>;
    if (s._type !== "faqSection") continue;
    if (!Array.isArray(s.faqs)) continue;

    for (const faq of s.faqs) {
      if (!faq || typeof faq !== "object") continue;
      const f = faq as Record<string, unknown>;
      const question = typeof f.question === "string" ? f.question.trim() : "";
      const answer = portableTextToPlainText(f.answer);
      if (question && answer) out.push({ question, answer });
    }
  }

  return out;
}

/**
 * Convert directly-fetched Sanity 'faqs' documents into FaqItem[].
 * Used by pages that fetch FAQs outside of the faqSection flexible-content
 * pattern (e.g. the home page which may not have a faqSection in its sections).
 */
function faqDocsToItems(docs: SanityFaqDoc[] | undefined): FaqItem[] {
  if (!Array.isArray(docs) || docs.length === 0) return [];
  const out: FaqItem[] = [];
  for (const doc of docs) {
    const question = doc.question?.trim() ?? "";
    const answer = portableTextToPlainText(doc.answer);
    if (question && answer) out.push({ question, answer });
  }
  return out;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface FaqSchemaProps {
  /**
   * Page sections[] from any Sanity query that includes faqSectionFragment.
   * Used on product / page / industry routes.
   */
  sections?: unknown[];
  /**
   * Directly-fetched 'faqs' Sanity documents.
   * Used on the home page and any route that doesn't use sections-based FAQs.
   * When both `sections` and `items` are provided, items from sections take
   * priority; `items` fills in when sections yield nothing.
   */
  items?: SanityFaqDoc[];
}

export default function FaqSchema({ sections, items }: FaqSchemaProps) {
  // Try sections first (existing pattern for all content pages)
  let faqs = extractFaqSchemaItems(sections);

  // Fall back to directly-fetched FAQ documents (home page)
  if (!faqs.length) {
    faqs = faqDocsToItems(items);
  }

  if (!faqs.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
