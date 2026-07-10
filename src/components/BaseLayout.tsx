import { Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";

// BaseLayout is a pure composition shell — no data fetching here.
// Header and Footer each own their Sanity data fetch behind two cache layers:
//   - "use cache: remote" on the fetch function (raw data, shared across users)
//   - "use cache"         on the component     (rendered RSC payload)
// Both layers invalidate via revalidateTag('settings') from the Sanity webhook.
const BaseLayout = ({
  children,
  settings,
  layout = "light",
}: {
  children: React.ReactNode;
  settings:any;
  layout?: "dark" | "light";
}) => {
  return (
    <>
      <Suspense fallback={null}>
        <Header layout={layout} settings={settings}  />
      </Suspense>
      <main id="main-content" className="min-h-dvh flex-1">
        {children}
      </main>
      <Suspense fallback={null}>
        <Footer  settings={settings}/>
      </Suspense>
    </>
  );
};

export default BaseLayout;