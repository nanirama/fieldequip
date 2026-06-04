import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { client } from "@/src/sanity/lib/client";
import { settingsQuery } from "@/src/sanity/lib/queries";
import type { SettingsMenuData } from "@/src/components/Header/menu-types";
// import Header from "./Header";
// import Footer from "./Footer";

// ── Data layer ────────────────────────────────────────────────────────────────
//
// Two caching layers stacked:
//
//   1. React Request Memoization (cache()):
//      Deduplicates this call within a single render tree. If Header, Footer,
//      and anything else all call getSettings() in the same request, Sanity
//      is hit exactly ONCE.
//
//   2. Next.js Data Cache ("use cache"):
//      Persists the result across requests. The result lives in Next.js's
//      server-side Data Cache and is invalidated only when revalidateTag('settings')
//      is called (e.g. from the Sanity webhook handler).
//
async function fetchSettings(): Promise<SettingsMenuData> {
  "use cache";
  cacheTag('settings');
  cacheLife({ revalidate: 3600 });
  const data = await client.fetch<SettingsMenuData | null>(settingsQuery);
  return data ?? ({} as SettingsMenuData);
}

// React Request Memoization wrapper — one network call per request maximum.
const getSettings = cache(fetchSettings);

// ── Component ─────────────────────────────────────────────────────────────────
const BaseLayout = async ({
  children,
  layout = "light",
}: {
  children: React.ReactNode;
  layout?: "dark" | "light";
}) => {
  const settings = await getSettings();

  return (
    <>
      {/* <Header layout={layout} settings={settings} /> */}
      <main id="main-content" className="min-h-dvh flex-1">
        {children}
      </main>
      {/* <Footer settings={settings} /> */}
    </>
  );
};

export default BaseLayout;
