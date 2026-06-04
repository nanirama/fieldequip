// import { client } from "@/src/sanity/lib/client";
// import { settingsQuery } from "@/src/sanity/lib/queries";
// import type { SettingsMenuData } from "@/src/components/Header/menu-types";
// import Header from "./Header";
// import Footer from "./Footer";

const BaseLayout = ({ children, layout = "light" }: { children: React.ReactNode, layout?: "dark" | "light" }) => {
  // Settings fetch is suspended while Header and Footer are hidden.
  // Re-enable the imports above and restore the fetch + components below when ready.

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
