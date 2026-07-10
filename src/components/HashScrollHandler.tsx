"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fallback hash-scroll handler for general anchor links across the site.
// For #features specifically, PlatformDeepDiveClient handles it at mount time
// (guaranteed timing). This handler covers other hash links where no
// dedicated component exists.
export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    // Skip #features — PlatformDeepDiveClient owns that scroll.
    if (id === "features") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pathname]);

  return null;
}
