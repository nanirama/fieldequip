import type { Metadata } from "next";

import { loadHome } from "@/src/sanity/loader/loadQuery";
import BaseLayout from "@/src/components/BaseLayout";
import { seoGenerateMetadata } from "@/src/components/Seo";
import FlexibleContent from "@/src/components/FlexibleContent";

// ISR: statically pre-rendered at build time, revalidated every hour.
// On-demand revalidation still works via Sanity webhook → revalidateTag('home').
export const revalidate = 3600;

type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
};

type HomeDoc = {
  title?: string;
  seo?: SeoFields;
  sections?: unknown[];
};

export async function generateMetadata(): Promise<Metadata> {
  const home = await loadHome();
  const data = home.data as HomeDoc | null | undefined;

  return seoGenerateMetadata({
    title: data?.seo?.metaTitle || data?.title || "Home",
    description: data?.seo?.metaDescription || "",
    url: "/",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function Home() {
  const home = await loadHome();
  const homeData = (home as { data?: HomeDoc }).data;
  return (
    <BaseLayout layout="dark">
      <div className="w-full overflow-hidden">
        <FlexibleContent data={homeData} page={'home'} />
      </div>
    </BaseLayout>
  );
}
