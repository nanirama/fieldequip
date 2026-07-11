"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * gtag.js is ~165KB. On a slow connection that is roughly 0.8s of bandwidth, and
 * it competes directly with the hero image for it — which is what the LCP is
 * waiting on. next/script's own strategies (afterInteractive / lazyOnload) still
 * fetch it inside the load window, so hold the script back ourselves until the
 * page has finished loading and the browser is idle. Analytics still fires for
 * every visit (including bounces), just after the page is painted.
 */
export function GoogleAnalytics() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const start = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(() => setReady(true));
      } else {
        timeoutId = window.setTimeout(() => setReady(true), 1500);
      }
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      window.removeEventListener("load", start);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== undefined && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!GA_ID || !ready) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
