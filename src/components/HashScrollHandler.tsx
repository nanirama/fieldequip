"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fallback hash-scroll handler for general anchor links across the site.
// #features used to be handled separately, by the deep-dive section's client
// component at mount time. That section is server-rendered now, so its target is
// in the DOM from the first paint and this handler covers it like any other.
export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pathname]);

  return null;
}
