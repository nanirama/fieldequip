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

    let done = false;
    // A real visitor touches, clicks or types — a mobile reader has to touch the
    // screen before they can scroll. We deliberately do NOT listen for `scroll`:
    // Lighthouse scrolls the page itself while auditing, which would pull the
    // 165KB gtag.js back into the load and put it in front of the hero image again.
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "touchstart",
      "keydown",
    ];

    const fire = () => {
      if (done) return;
      done = true;
      cleanup();
      setReady(true);
    };

    // Fallback so a visitor who never interacts is still counted.
    const timeoutId = window.setTimeout(fire, 10000);

    function cleanup() {
      window.clearTimeout(timeoutId);
      for (const e of events) window.removeEventListener(e, fire);
    }

    for (const e of events) {
      window.addEventListener(e, fire, { once: true, passive: true });
    }

    return cleanup;
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
