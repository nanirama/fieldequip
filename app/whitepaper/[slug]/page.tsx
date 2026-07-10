import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/types";

import BaseLayout from "@/src/components/BaseLayout";
import FaqSchema from "@/src/components/FaqSchema";
import FlexibleContent from "@/src/components/FlexibleContent";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { loadWhitePaper, loadWhitePaperSlugs, loadHeader } from "@/src/sanity/loader/loadQuery";
import JsonLd from "@/src/components/JsonLd";
import { buildBreadcrumbs, slugToLabel } from "@/lib/schema";
import type { SanityImage } from "@/src/types/sanity-image";
const getHeader = cache(loadHeader)
type WhitePaperDetail = {
  _id?: string;
  name?: string;
  slug?: string;
  shortDescription?: PortableTextBlock[];
  image?: SanityImage & { lqip?: string };
  sections?: unknown[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
};

const shortDescriptionComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-base leading-relaxed text-[#020210]/75 [&+p]:mt-3">{children}</p>
    ),
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const result = await loadWhitePaperSlugs();
  const rows = (result.data as { slug?: string }[] | null | undefined) ?? [];
  const params = rows
    .filter((r): r is { slug: string } => Boolean(r?.slug))
    .map((r) => ({ slug: r.slug }));
  if (!params.length) return [{ slug: '__placeholder' }];
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadWhitePaper(slug);
  const data = result.data as WhitePaperDetail | null | undefined;

  if (!data) {
    return { title: "Whitepaper" };
  }

  const plain =
    data.shortDescription
      ?.filter((b) => b._type === "block")
      .map((b) =>
        "children" in b && Array.isArray(b.children)
          ? b.children.map((c) => ("text" in c ? String(c.text) : "")).join("")
          : "",
      )
      .join(" ")
      .trim() ?? "";

  return seoGenerateMetadata({
    title: data.seo?.metaTitle || data.name || "Whitepaper",
    description: data.seo?.metaDescription || plain || "",
    url: `/whitepaper/${slug}`,
    imageUrl: data.seo?.metaImage,
  });
}

export default async function WhitePaperDetailPage({ params }: PageProps) {
  const { slug } = await params;
  //const result = await loadWhitePaper(slug);
  const [result,  headerResult] = await Promise.all([
      loadWhitePaper(slug),
      getHeader()
    ]);
  const data = result.data as WhitePaperDetail | null | undefined;
  const settings = headerResult.data ?? {}

  if (!data?.name) {
    notFound();
  }

  return (
    <>
      <JsonLd schema={buildBreadcrumbs([
        { label: "Home", href: "/" },
        { label: "Whitepapers", href: "/whitepaper" },
        { label: data.name || slugToLabel(slug), href: `/whitepaper/${slug}` },
      ])} />
      <BaseLayout layout="light" settings={settings}>
      <div className="md:absolute sm:-bottom-[20%] md:-bottom-[40%] md:left-[0%] sm:left-0 bg-[url('/images/abt-hero-left-shadow.png')] bg-no-repeat bg-contain z-0 md:w-[481px] md:h-[580px]" />
      <div className="absolute sm:top-[0%] md:right-[10%] sm:right-0 bg-[url('/images/abt-hero-right-shadow.png')] bg-no-repeat bg-contain z-0 md:w-[432px] md:h-[450px] " />

      <article className="mx-auto relative max-w-7xl px-4 pt-14 sm:pt-16 lg:pt-24">
        {/* <h1 className="max-w-4xl font-manrope text-3xl font-medium tracking-tight text-[#020210] sm:text-4xl lg:text-[2.25rem] lg:leading-tight">
          {data.name}
        </h1>
        {data.shortDescription && data.shortDescription.length > 0 ? (
          <div className="mt-5 max-w-3xl">
            <PortableText
              value={data.shortDescription}
              components={shortDescriptionComponents}
            />
          </div>
        ) : null} */}
        <div className="mt-12">
          <FlexibleContent data={{ sections: data.sections ?? [] }} page="whitepaper" />
        </div>
      </article>
      <FaqSchema sections={data.sections} />
      </BaseLayout>
    </>
  );
}
