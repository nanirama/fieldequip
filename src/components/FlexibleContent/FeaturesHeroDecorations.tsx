"use client";

import { useEffect, useState } from "react";

// Loaded client-side after mount so decorative images don't compete with
// the LCP image fetch during the critical window. Positions differ slightly
// from ProductHeroDecorations (right-50 vs right-30 on lines).
export function FeaturesHeroDecorations() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute top-10 right-60 bg-[url('/images/product-hero-shade1.png')] bg-no-repeat bg-contain z-30 w-[500px] h-[500px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-30 bg-[url('/images/product-hero-shade2.png')] bg-no-repeat bg-contain z-30 w-[330px] h-[430px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-0 bg-[url('/images/product-hero-line1.png')] bg-no-repeat bg-contain z-20 w-[260px] h-[570px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 right-50 bg-[url('/images/product-hero-line2.webp')] bg-no-repeat bg-contain z-20 w-[780px] h-[780px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-30 right-50 bg-[url('/images/product-hero-line3.webp')] bg-no-repeat bg-contain z-20 w-[780px] h-[500px]" />
    </>
  );
}
