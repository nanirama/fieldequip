import { client } from "@/src/sanity/lib/client";
import { settingsQuery } from "@/src/sanity/lib/queries";
import type { SettingsMenuData } from "@/src/components/Header/menu-types";
import Header from "./Header";
import Footer from "./Footer";

const BaseLayout = async ({ children, layout = "light" }: { children: React.ReactNode, layout?: "dark" | "light" }) => {
  const settings = await client.fetch<SettingsMenuData | null>(
    settingsQuery,
    {},
    { next: { revalidate: 3600, tags: ['settings'] } }
  ) ?? {};

  return (
    <>
      <Header layout={layout} settings={settings} />
      <main id="main-content" className="min-h-dvh flex-1">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
};

export default BaseLayout;
