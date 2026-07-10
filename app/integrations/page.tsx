import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import BaseLayout from "@/src/components/BaseLayout";
import FaqSchema from "@/src/components/FaqSchema";
import FlexibleContent from "@/src/components/FlexibleContent";
import JsonLd from "@/src/components/JsonLd";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { loadAllIntegrations, loadIntegrationsPage, loadHeader } from "@/src/sanity/loader/loadQuery";
import { buildBreadcrumbs } from "@/lib/schema";

const getHeader = cache(loadHeader)
type IntegrationsPageData = {
  title?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
  sections?: unknown[];
};

type IntegrationListItem = {
  _id: string;
  title?: string;
  slug?: string;
  listingOnly?: boolean;
  shortDescription?: string;
  image?: {
    alt?: string;
    asset?: unknown;
  };
};

type IntegrationSection = {
  _type?: string;
  [key: string]: unknown;
};

export async function generateMetadata(): Promise<Metadata> {
  const integrationsPage = await loadIntegrationsPage();
  const data = integrationsPage.data as IntegrationsPageData | null | undefined;

  return seoGenerateMetadata({
    title: data?.seo?.metaTitle || data?.title || "Integrations",
    description: data?.seo?.metaDescription || "",
    url: "/integrations",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function IntegrationsPage() {
  const [integrationsPage, allIntegrations, headerResult] = await Promise.all([
    loadIntegrationsPage(),
    loadAllIntegrations(),
    getHeader()
  ]);
  const data = integrationsPage.data as IntegrationsPageData | null | undefined;
  const integrations = (allIntegrations.data as IntegrationListItem[] | null | undefined) ?? [];
  const settings = headerResult.data ?? {}
  if (!data) {
    notFound();
  }

  const sectionsWithIntegrations = (data.sections as IntegrationSection[] | undefined)?.map((section) =>
    section?._type === "integrationsSection"
      ? { ...section, integrations }
      : section
  ) ?? [];


  return (
    <>
      <JsonLd schema={buildBreadcrumbs([
        { label: "Home", href: "/" },
        { label: "Integrations", href: "/integrations" },
      ])} />
      <BaseLayout layout="light" settings={settings}>
        <FlexibleContent data={{ sections: sectionsWithIntegrations }} />
        <FaqSchema sections={data.sections} />
      </BaseLayout>
    </>
  );
}
