"use client";

import { useEffect, useState } from "react";

// Loaded client-side after mount so the 5 decorative images (~770 KB total)
// don't compete for bandwidth with the LCP image during the critical window.
// These are aria-hidden and purely decorative — a brief post-LCP appearance
// delay is imperceptible and worth the LCP improvement.
export function ProductHeroDecorations() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute top-10 right-60 bg-[url('/images/product-hero-shade1.png')] bg-no-repeat bg-contain z-30 w-[500px] h-[500px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-30 bg-[url('/images/product-hero-shade2.png')] bg-no-repeat bg-contain z-30 w-[330px] h-[430px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-10 bg-[url('/images/product-hero-line1.png')] bg-no-repeat bg-contain z-20 w-[260px] h-[570px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 right-30 bg-[url('/images/product-hero-line2.webp')] bg-no-repeat bg-contain z-20 w-[780px] h-[780px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-30 right-30 bg-[url('/images/product-hero-line3.webp')] bg-no-repeat bg-contain z-20 w-[780px] h-[500px]" />
    </>
  );
}
