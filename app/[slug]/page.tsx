import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BaseLayout from "@/src/components/BaseLayout";
import BlogPostArticle from "@/src/components/Blog/BlogPostArticle";
import type { BlogPostArticleData } from "@/src/components/Blog/BlogPostArticle";
import FlexibleContent from "@/src/components/FlexibleContent";
import LegalPageContent from "@/src/components/LegalPageContent";
import { seoGenerateMetadata } from "@/src/components/Seo";
import {
  loadBlogPost,
  loadConversionPage,
  loadConversionPageSlugs,
  loadIndustry,
  loadIndustrySlugs,
  loadLegalPage,
  loadLegalPageSlugs,
  loadPage,
  loadPageSlugs,
  loadPostSlugs,
  loadProduct,
  loadProductSlugs,
} from "@/src/sanity/loader/loadQuery";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

type ContentDoc = {
  title?: string;
  slug?: string;
  parent?: {
    title?: string;
    slug?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
  sections?: unknown[];
  content?: unknown[];
};

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type FaqSchemaItem = {
  question: string;
  answer: string;
};

function portableTextToPlainText(value: unknown): string {
  const parts: string[] = [];

  const visit = (node: unknown) => {
    if (typeof node === "string") {
      parts.push(node);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const asRecord = node as Record<string, unknown>;
    if (typeof asRecord.text === "string") {
      parts.push(asRecord.text);
    }

    if (Array.isArray(asRecord.children)) {
      asRecord.children.forEach(visit);
    }
    if (Array.isArray(asRecord.content)) {
      asRecord.content.forEach(visit);
    }
    if (Array.isArray(asRecord.answer)) {
      asRecord.answer.forEach(visit);
    }
  };

  visit(value);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function extractFaqSchemaItems(sections: unknown[] | undefined): FaqSchemaItem[] {
  if (!Array.isArray(sections) || sections.length === 0) return [];

  const out: FaqSchemaItem[] = [];
  for (const section of sections) {
    if (!section || typeof section !== "object") continue;
    const sectionRecord = section as Record<string, unknown>;
    if (sectionRecord._type !== "faqSection") continue;

    const sectionFaqs = sectionRecord.faqs;
    if (!Array.isArray(sectionFaqs)) continue;

    for (const faq of sectionFaqs) {
      if (!faq || typeof faq !== "object") continue;
      const faqRecord = faq as Record<string, unknown>;
      const question =
        typeof faqRecord.question === "string" ? faqRecord.question.trim() : "";
      const answerText = portableTextToPlainText(faqRecord.answer);
      if (!question || !answerText) continue;
      out.push({ question, answer: answerText });
    }
  }

  return out;
}

function FAQSchema({ faqs }: { faqs: FaqSchemaItem[] }) {
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function generateStaticParams() {
  const [productSlugs, pageSlugs, postSlugs, legalSlugs, industrySlugs, conversionSlugs] = await Promise.all([
    loadProductSlugs(),
    loadPageSlugs(),
    loadPostSlugs(),
    loadLegalPageSlugs(),
    loadIndustrySlugs(),
    loadConversionPageSlugs(),
  ]);
  const productRows = productSlugs.data as { slug: string }[] | null | undefined;
  const pageRows = pageSlugs.data as { slug: string }[] | null | undefined;
  const postRows = postSlugs.data as { slug: string }[] | null | undefined;
  const legalRows = legalSlugs.data as { slug: string }[] | null | undefined;
  const industryRows = industrySlugs.data as { slug: string }[] | null | undefined;
  const conversionRows = conversionSlugs.data as { slug: string }[] | null | undefined;
  const unique = new Set<string>();
  for (const row of [
    ...(pageRows ?? []),
    ...(productRows ?? []),
    ...(postRows ?? []),
    ...(legalRows ?? []),
    ...(industryRows ?? []),
    ...(conversionRows ?? []),
  ]) {
    if (row?.slug) unique.add(row.slug);
  }
  if (!unique.size) return [];
  return [...unique].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  const pageResult = await loadPage(slug);
  const cmsPage = pageResult.data as ContentDoc | null | undefined;

  if (cmsPage) {
    return seoGenerateMetadata({
      title: cmsPage.seo?.metaTitle || cmsPage.title || slug,
      description: cmsPage.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: cmsPage.seo?.metaImage,
    });
  }

  const legalResult = await loadLegalPage(slug);
  const legalPage = legalResult.data as ContentDoc | null | undefined;

  if (legalPage) {
    return seoGenerateMetadata({
      title: legalPage.seo?.metaTitle || legalPage.title || slug,
      description: legalPage.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: legalPage.seo?.metaImage,
    });
  }

  const productResult = await loadProduct(slug);
  const product = productResult.data as ContentDoc | null | undefined;

  if (product) {
    return seoGenerateMetadata({
      title: product.seo?.metaTitle || product.title || slug,
      description: product.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: product.seo?.metaImage,
    });
  }

  const postResult = await loadBlogPost(slug);
  const post = postResult.data as BlogPostArticleData & {
    seo?: { metaTitle?: string; metaDescription?: string; metaImage?: string };
  } | null | undefined;

  if (post) {
    return seoGenerateMetadata({
      title: post.seo?.metaTitle || post.title || slug,
      description: post.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: post.seo?.metaImage,
    });
  }

  const industryResult = await loadIndustry(slug);
  const industry = industryResult.data as ContentDoc | null | undefined;

  if (industry) {
    return seoGenerateMetadata({
      title: industry.seo?.metaTitle || industry.title || slug,
      description: industry.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: industry.seo?.metaImage,
    });
  }

  const conversionResult = await loadConversionPage(slug);
  const conversionPage = conversionResult.data as ContentDoc | null | undefined;

  if (conversionPage) {
    return seoGenerateMetadata({
      title: conversionPage.seo?.metaTitle || conversionPage.title || slug,
      description: conversionPage.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: conversionPage.seo?.metaImage,
    });
  }

  return seoGenerateMetadata({
    title: slug,
    description: "",
    url: `/${slug}`,
  });
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  const pageResult = await loadPage(slug);
  const cmsPage = pageResult.data as ContentDoc | null | undefined;

  const pageBreadcrumb: { breadcrumb: BreadcrumbItem[] } = {
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Company", href: "/about-us" },
      { label: cmsPage?.title || slug },
    ],
  };

  if (cmsPage) {
    const faqSchemaFaqs = extractFaqSchemaItems(cmsPage.sections);
    return (
      <BaseLayout>
        <FlexibleContent
          data={{ sections: cmsPage.sections as unknown[] }}
          page={JSON.stringify(pageBreadcrumb)}
        />
        <FAQSchema key={slug} faqs={faqSchemaFaqs} />
      </BaseLayout>
    );
  }

  const legalResult = await loadLegalPage(slug);
  const legalPage = legalResult.data as ContentDoc | null | undefined;

  if (legalPage) {
    return (
      <BaseLayout layout="light">
        <LegalPageContent title={legalPage.title ?? slug} content={legalPage.content as import("@portabletext/types").PortableTextBlock[] | undefined} />
      </BaseLayout>
    );
  }

  const productResult = await loadProduct(slug);
  const product = productResult.data as ContentDoc | null | undefined;
  const productParent = product?.parent;
  const secondProductCrumb: BreadcrumbItem =
    productParent?.title
      ? {
          label: productParent.title,
          href: productParent.slug ? `/${productParent.slug}` : undefined,
        }
      : { label: "Company", href: "/about-us" };

  const productBreadcrumb: { breadcrumb: BreadcrumbItem[] } = {
    breadcrumb: [
      { label: "Home", href: "/" },
      secondProductCrumb,
      { label: product?.title || slug },
    ],
  };

  if (product) {
    const faqSchemaFaqs = extractFaqSchemaItems(product.sections);
    return (
      <BaseLayout layout="light">
        <FlexibleContent
          data={{ sections: product.sections as unknown[] }}
          page={JSON.stringify(productBreadcrumb)}
        />
        <FAQSchema key={slug} faqs={faqSchemaFaqs} />
      </BaseLayout>
    );
  }

  const postResult = await loadBlogPost(slug);
  const post = postResult.data as BlogPostArticleData | null | undefined;

  if (post?.slug) {
    return (
      <BaseLayout layout="light">
        <BlogPostArticle post={post} />
      </BaseLayout>
    );
  }

  const industryResult = await loadIndustry(slug);
  const industry = industryResult.data as ContentDoc | null | undefined;

  if (industry) {
    const faqSchemaFaqs = extractFaqSchemaItems(industry.sections);
    return (
      <BaseLayout layout="light">
        <FlexibleContent
          data={{ sections: industry.sections as unknown[] }}
          page={JSON.stringify({
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: industry.title || slug },
            ],
          })}
        />
        <FAQSchema key={slug} faqs={faqSchemaFaqs} />
      </BaseLayout>
    );
  }

  const conversionResult = await loadConversionPage(slug);
  const conversionPage = conversionResult.data as ContentDoc | null | undefined;

  if (conversionPage) {
    return (
      <BaseLayout layout="light">
        <FlexibleContent
          data={{ sections: conversionPage.sections as unknown[] }}
          page={JSON.stringify({
            page: slug,
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: conversionPage.title || slug },
            ],
          })}
        />
      </BaseLayout>
    );
  }

  notFound();
}
