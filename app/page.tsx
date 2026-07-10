import type { Metadata } from "next";
import { cache } from "react";
import { cacheTag, cacheLife } from "next/cache";

import { loadHome, loadHeader } from "@/src/sanity/loader/loadQuery";
import BaseLayout from "@/src/components/BaseLayout";
import { seoGenerateMetadata } from "@/src/components/Seo";
import FlexibleContent from "@/src/components/FlexibleContent";
import type { SettingsMenuData } from "../src/components/Header/menu-types";

const getHome = cache(loadHome)
const getHeader = cache(loadHeader)

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
  const home = await getHome()
  const data = home.data as HomeDoc | null | undefined;

  return seoGenerateMetadata({
    title: data?.seo?.metaTitle || data?.title || "Home",
    description: data?.seo?.metaDescription || "",
    url: "/",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function Home() {
  "use cache";
  // 'home'     — busted by webhook when the home document changes in Sanity
  // 'settings' — busted by webhook when the header/nav settings change
  cacheTag("home", "settings");
  // stale:86400   serve the cached RSC payload for 24 h while revalidating in background
  // revalidate:60 attempt a background refresh every 60 s of activity
  // expire:604800 hard-evict after 7 days so stale renders never linger forever
  cacheLife({ stale: 86400, revalidate: 60, expire: 604800 });

  const [homepageResult, headerResult] = await Promise.all([getHome(), getHeader()]);

  const homeData = homepageResult.data as HomeDoc | null | undefined;
  const settings = (headerResult.data as SettingsMenuData | null) ?? ({} as SettingsMenuData);

  return (
    <BaseLayout layout="dark" settings={settings}>
      <div className="w-full overflow-hidden">
        <FlexibleContent data={homeData} page={"home"} />
      </div>
    </BaseLayout>
  );
}
