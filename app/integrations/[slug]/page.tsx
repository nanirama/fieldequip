import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import BaseLayout from "@/src/components/BaseLayout";
import FaqSchema from "@/src/components/FaqSchema";
import FlexibleContent from "@/src/components/FlexibleContent";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { loadIntegration, loadIntegrationSlugs, loadHeader } from "@/src/sanity/loader/loadQuery";
import JsonLd from "@/src/components/JsonLd";
import { buildBreadcrumbs, slugToLabel } from "@/lib/schema";
const getHeader = cache(loadHeader)
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
  const params = (data ?? []).filter((row) => Boolean(row?.slug)).map((row) => ({ slug: row.slug as string }));
  if (!params.length) return [{ slug: '__placeholder' }];
  return params;
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
  const [integration, headerResult] = await Promise.all([
      loadIntegration(slug),
      getHeader()
    ]);
  //const integration = integrationData?.data;
  const data = integration.data as IntegrationDoc | null | undefined;
  const settings = headerResult.data ?? {}
  if (!data) {
    notFound();
  }

  return (
    <>
      <JsonLd schema={buildBreadcrumbs([
        { label: "Home", href: "/" },
        { label: "Integrations", href: "/integrations" },
        { label: data.title || slugToLabel(slug), href: `/integrations/${slug}` },
      ])} />
      <BaseLayout layout="light" settings={settings}>
        <FlexibleContent data={{ sections: data.sections ?? [] }} page={`integrations/${slug}`} />
        <FaqSchema sections={data.sections} />
      </BaseLayout>
    </>
  );
}
