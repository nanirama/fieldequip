import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import BaseLayout from "@/src/components/BaseLayout";
import FaqSchema from "@/src/components/FaqSchema";
import FlexibleContent from "@/src/components/FlexibleContent";
import JsonLd from "@/src/components/JsonLd";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { loadVideoTestimonialsPage, loadHeader } from "@/src/sanity/loader/loadQuery";
import { buildBreadcrumbs } from "@/lib/schema";
const getHeader = cache(loadHeader)
type VideoTestimonialsPageData = {
  title?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
  sections?: unknown[];
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadVideoTestimonialsPage();
  const data = page.data as VideoTestimonialsPageData | null | undefined;

  return seoGenerateMetadata({
    title: data?.seo?.metaTitle || data?.title || "Videos & Testimonials",
    description: data?.seo?.metaDescription || "",
    url: "/videos-testimonials",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function FieldEquipVideosPage() {
  const [page, headerResult] = await Promise.all([
        loadVideoTestimonialsPage(),
        getHeader()
      ]);
  //const page = await loadVideoTestimonialsPage();
  const data = page.data as VideoTestimonialsPageData | null | undefined;
  const settings = headerResult.data ?? {}

  if (!data) {
    notFound();
  }

  return (
    <>
      <JsonLd schema={buildBreadcrumbs([
        { label: "Home", href: "/" },
        { label: "Videos & Testimonials", href: "/videos-testimonials" },
      ])} />
      <BaseLayout layout="light" settings={settings}>
        <FlexibleContent data={{ sections: data.sections ?? [] }} />
        <FaqSchema sections={data.sections} />
      </BaseLayout>
    </>
  );
}
