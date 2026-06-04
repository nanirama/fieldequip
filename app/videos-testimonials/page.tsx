import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BaseLayout from "@/src/components/BaseLayout";
import FlexibleContent from "@/src/components/FlexibleContent";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { loadVideoTestimonialsPage } from "@/src/sanity/loader/loadQuery";

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
    url: "/fieldequip-videos",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function FieldEquipVideosPage() {
  const page = await loadVideoTestimonialsPage();
  const data = page.data as VideoTestimonialsPageData | null | undefined;

  if (!data) {
    notFound();
  }

  return (
    <BaseLayout layout="light">
      <FlexibleContent data={{ sections: data.sections ?? [] }} />
    </BaseLayout>
  );
}
