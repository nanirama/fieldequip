import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BaseLayout from "@/src/components/BaseLayout";
import FlexibleContent from "@/src/components/FlexibleContent";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { loadIntegration, loadIntegrationSlugs } from "@/src/sanity/loader/loadQuery";

type IntegrationDoc = {
  title?: string;
  slug?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
  sections?: unknown[];
};

type IntegrationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const rows = await loadIntegrationSlugs();
  const data = rows.data as { slug?: string }[] | null | undefined;
  return (data ?? []).filter((row) => Boolean(row?.slug)).map((row) => ({ slug: row.slug as string }));
}

export async function generateMetadata({ params }: IntegrationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const integration = await loadIntegration(slug);
  const data = integration.data as IntegrationDoc | null | undefined;

  if (!data) {
    return seoGenerateMetadata({
      title: "Integration",
      description: "",
      url: `/integrations/${slug}`,
    });
  }

  return seoGenerateMetadata({
    title: data.seo?.metaTitle || data.title || "Integration",
    description: data.seo?.metaDescription || "",
    url: `/integrations/${slug}`,
    imageUrl: data.seo?.metaImage,
  });
}

export default async function IntegrationDetailPage({ params }: IntegrationPageProps) {
  const { slug } = await params;
  const integration = await loadIntegration(slug);
  const data = integration.data as IntegrationDoc | null | undefined;

  if (!data) {
    notFound();
  }

  return (
    <BaseLayout layout="light">
      <FlexibleContent data={{ sections: data.sections ?? [] }} page={`integrations/${slug}`} />
    </BaseLayout>
  );
}
