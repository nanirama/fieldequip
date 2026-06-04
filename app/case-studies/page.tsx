import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/types";

import BaseLayout from "@/src/components/BaseLayout";
import CaseStudyCard, { type CaseStudyCardData } from "@/src/components/CaseStudies/CaseStudyCard";
import { seoGenerateMetadata } from "@/src/components/Seo";
import type { SanityImage } from "@/src/types/sanity-image";
import { loadCaseStudiesall, loadCaseStudiesPage } from "@/src/sanity/loader/loadQuery";

type CaseStudiesPageData = {
  name?: string;
  description?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
};

type CaseStudyData = {
  _id: string;
  name?: string;
  slug?: string;
  tags?: string[];
  statistics?: { label?: string; value?: string }[];
  clientName?: string;
  clientJobTitle?: string;
  clientTestimonial?: PortableTextBlock[];
  clientImage?: (SanityImage & { alt?: string }) | null;
  youtubeVideoUrl?: string;
  videoDuration?: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const result = await loadCaseStudiesPage();
  const data = result.data as CaseStudiesPageData | null | undefined;

  return seoGenerateMetadata({
    title: data?.seo?.metaTitle || data?.name || "Case Studies",
    description: data?.seo?.metaDescription || data?.description || "",
    url: "/case-studies",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function CaseStudiesPage() {
  const [pageResult, caseStudiesResult] = await Promise.all([loadCaseStudiesPage(), loadCaseStudiesall()]);
  const data = pageResult.data as CaseStudiesPageData | null | undefined;
  const caseStudies = (caseStudiesResult.data as CaseStudyData[] | null | undefined) ?? [];

  if (!data) {
    notFound();
  }

  return (
    <BaseLayout layout="light">
      <section className="relative overflow-hidden bg-white">
        {/* <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[420px] bg-[url('/images/globe.png')] bg-contain bg-top bg-no-repeat opacity-40" /> */}

        <div className="relative mx-auto max-w-7xl mt-12 px-4 pt-14 sm:pt-16 lg:pt-32">
          <h1 className="max-w-3xl font-manrope text-4xl font-medium tracking-tight text-[#020210] sm:text-5xl">
            {data.name}
          </h1>
          {data.description ? (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#020210]/70">
              {data.description}
            </p>
          ) : null}
        </div>

        <div className="mx-auto max-w-7xl divide-y divide-slate-300/70 px-4">
          {caseStudies.map((item, index) => (
            <CaseStudyCard key={item._id} item={item as CaseStudyCardData} reverse={index % 2 === 1} />
          ))}
        </div>
      </section>
    </BaseLayout>
  );
}
