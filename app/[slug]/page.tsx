import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BaseLayout from "@/src/components/BaseLayout";
import BlogPostArticle from "@/src/components/Blog/BlogPostArticle";
import type { BlogPostArticleData } from "@/src/components/Blog/BlogPostArticle";
import BlogPostJsonLd from "@/src/components/Blog/JsonLd";
import JsonLd from "@/src/components/JsonLd";
import { buildBreadcrumbs, slugToLabel } from "@/lib/schema";
import FaqSchema from "@/src/components/FaqSchema";
import FlexibleContent from "@/src/components/FlexibleContent";
import LegalPageContent from "@/src/components/LegalPageContent";
import { seoGenerateMetadata } from "@/src/components/Seo";
import {
  loadBlogPost,
  loadConversionPage,
  loadConversionPageSlugs,
  loadHeader,
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
  effectiveDate?: string;
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

type PostDoc = BlogPostArticleData & {
  seo?: { metaTitle?: string; metaDescription?: string; metaImage?: string };
};

type SlugMatch =
  | { type: "page"; page: ContentDoc }
  | { type: "legal"; legalPage: ContentDoc }
  | { type: "product"; product: ContentDoc }
  | { type: "post"; post: PostDoc }
  | { type: "industry"; industry: ContentDoc }
  | { type: "conversion"; conversionPage: ContentDoc };

const getHeader = cache(loadHeader)

// React.cache deduplicates this across generateMetadata + SlugPage within the same
// render cycle. All 6 loaders fire in parallel — each has its own 'use cache'
// boundary so Sanity is only hit once per slug per cache period regardless of type.
const loadSlugContent = cache(async (slug: string): Promise<SlugMatch | null> => {
  const [
    productResult,
    pageResult,
    legalResult,
    postResult,
    industryResult,
    conversionResult,
  ] = await Promise.all([
    loadProduct(slug),
    loadPage(slug),
    loadLegalPage(slug),
    loadBlogPost(slug),
    loadIndustry(slug),
    loadConversionPage(slug),
  ]);

  // Priority resolution — order matches the original waterfall priority
  const product = productResult.data as ContentDoc | null | undefined;
  if (product) return { type: "product", product };

  const page = pageResult.data as ContentDoc | null | undefined;
  if (page) return { type: "page", page };

  const legalPage = legalResult.data as ContentDoc | null | undefined;
  if (legalPage) return { type: "legal", legalPage };

  const post = postResult.data as PostDoc | null | undefined;
  if (post?.slug) return { type: "post", post };

  const industry = industryResult.data as ContentDoc | null | undefined;
  if (industry) return { type: "industry", industry };

  const conversionPage = conversionResult.data as ContentDoc | null | undefined;
  if (conversionPage) return { type: "conversion", conversionPage };

  return null;
});

export async function generateStaticParams() {
  const [productSlugs, pageSlugs, postSlugs, legalSlugs, industrySlugs, conversionSlugs] = await Promise.all([
    loadProductSlugs(),
    loadPageSlugs(),
    loadPostSlugs(),
    loadLegalPageSlugs(),
    loadIndustrySlugs(),
    loadConversionPageSlugs(),
  ]);
  const productRows = productSlugs as { slug: string }[] | null | undefined;
  const pageRows = pageSlugs as { slug: string }[] | null | undefined;
  const postRows = postSlugs as { slug: string }[] | null | undefined;
  const legalRows = legalSlugs as { slug: string }[] | null | undefined;
  const industryRows = industrySlugs as { slug: string }[] | null | undefined;
  const conversionRows = conversionSlugs as { slug: string }[] | null | undefined;
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
  // cacheComponents forbids returning []. If Sanity is unreachable at this
  // moment the placeholder keeps the build valid; it will hit notFound().
  if (!unique.size) return [{ slug: '__placeholder' }];
  return [...unique].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = await loadSlugContent(slug);

  if (!match) {
    return seoGenerateMetadata({ title: slug, description: "", url: `/${slug}` });
  }

  if (match.type === "product") {
    const { product } = match;
    return seoGenerateMetadata({
      title: product.seo?.metaTitle || product.title || slug,
      description: product.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: product.seo?.metaImage,
    });
  }
  if (match.type === "page") {
    const { page } = match;
    return seoGenerateMetadata({
      title: page.seo?.metaTitle || page.title || slug,
      description: page.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: page.seo?.metaImage,
    });
  }

  if (match.type === "legal") {
    const { legalPage } = match;
    return seoGenerateMetadata({
      title: legalPage.seo?.metaTitle || legalPage.title || slug,
      description: legalPage.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: legalPage.seo?.metaImage,
    });
  }

  

  if (match.type === "post") {
    const { post } = match;
    return seoGenerateMetadata({
      title: post.seo?.metaTitle || post.title || slug,
      description: post.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: post.seo?.metaImage,
    });
  }

  if (match.type === "industry") {
    const { industry } = match;
    return seoGenerateMetadata({
      title: industry.seo?.metaTitle || industry.title || slug,
      description: industry.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: industry.seo?.metaImage,
    });
  }

  if (match.type === "conversion") {
    const { conversionPage } = match;
    return seoGenerateMetadata({
      title: conversionPage.seo?.metaTitle || conversionPage.title || slug,
      description: conversionPage.seo?.metaDescription || "",
      url: `/${slug}`,
      imageUrl: conversionPage.seo?.metaImage,
    });
  }

  return seoGenerateMetadata({ title: slug, description: "", url: `/${slug}` });
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const [match, headerResult] = await Promise.all([loadSlugContent(slug), getHeader()])
  const settings = headerResult.data ?? {}

  if (!match) {
    notFound();
  }

  if (match.type === "product") {
    const product = match.product;
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
    const productCrumbs = [
      { label: "Home", href: "/" },
      ...(productParent?.title
        ? [{ label: productParent.title, href: productParent.slug ? `/${productParent.slug}` : "/about-us" }]
        : []),
      { label: product.title || slugToLabel(slug), href: `/${slug}` },
    ];
    return (
      <>
        <JsonLd schema={buildBreadcrumbs(productCrumbs)} />
        <BaseLayout layout="light" settings={settings}>
          <FlexibleContent
            data={{ sections: product.sections as unknown[] }}
            page={JSON.stringify(productBreadcrumb)}
          />
          <FaqSchema sections={product.sections} />
        </BaseLayout>
      </>
    );
  }

  if (match.type === "page") {
    const cmsPage = match.page;
    const pageBreadcrumb: { page: string; breadcrumb: BreadcrumbItem[] } = {
      page: slug,
      breadcrumb: [
        { label: "Home", href: "/" },
        { label: "Company", href: "/about-us" },
        { label: cmsPage?.title || slug },
      ],
    };
    return (
      <>
        <JsonLd schema={buildBreadcrumbs([
          { label: "Home", href: "/" },
          { label: cmsPage.title || slugToLabel(slug), href: `/${slug}` },
        ])} />
        <BaseLayout settings={settings}>
          <FlexibleContent
            data={{ sections: cmsPage.sections as unknown[] }}
            page={JSON.stringify(pageBreadcrumb)}
          />
          <FaqSchema sections={cmsPage.sections} />
        </BaseLayout>
      </>
    );
  }

  if (match.type === "legal") {
    const legalPage = match.legalPage;
    return (
      <>
        <JsonLd schema={buildBreadcrumbs([
          { label: "Home", href: "/" },
          { label: legalPage.title || slugToLabel(slug), href: `/${slug}` },
        ])} />
        <BaseLayout layout="light" settings={settings}>
          <LegalPageContent
            title={legalPage.title ?? slug}
            effectiveDate={legalPage.effectiveDate}
            content={legalPage.content as import("@portabletext/types").PortableTextBlock[] | undefined}
          />
        </BaseLayout>
      </>
    );
  }

  

  if (match.type === "post") {
    const post = match.post;
    return (
      <>
        <JsonLd schema={buildBreadcrumbs([
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title || slugToLabel(slug), href: `/${slug}` },
        ])} />
        <BaseLayout layout="light" settings={settings}>
          <BlogPostJsonLd post={post} slug={slug} />
          <BlogPostArticle post={post} />
        </BaseLayout>
      </>
    );
  }

  if (match.type === "industry") {
    const industry = match.industry;
    return (
      <>
        <JsonLd schema={buildBreadcrumbs([
          { label: "Home", href: "/" },
          { label: industry.title || slugToLabel(slug), href: `/${slug}` },
        ])} />
        <BaseLayout layout="light" settings={settings}>
          <FlexibleContent
            data={{ sections: industry.sections as unknown[] }}
            page={JSON.stringify({
              breadcrumb: [
                { label: "Home", href: "/" },
                { label: industry.title || slug },
              ],
            })}
          />
          <FaqSchema sections={industry.sections} />
        </BaseLayout>
      </>
    );
  }

  if (match.type === "conversion") {
    const conversionPage = match.conversionPage;
    return (
      <>
        <JsonLd schema={buildBreadcrumbs([
          { label: "Home", href: "/" },
          { label: conversionPage.title || slugToLabel(slug), href: `/${slug}` },
        ])} />
        <BaseLayout layout="light" settings={settings}>
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
          <FaqSchema sections={conversionPage.sections} />
        </BaseLayout>
      </>
    );
  }

  notFound();
}
