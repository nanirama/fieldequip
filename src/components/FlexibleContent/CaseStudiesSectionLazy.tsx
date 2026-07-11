"use client";

import dynamic from "next/dynamic";
import LazyVisible from "@/src/components/LazyVisible";

// ssr:false keeps the react-slick carousel (and its layout-thrashing init) out of
// the server HTML and the initial hydration pass. LazyVisible then mounts it only
// when the section scrolls near the viewport, so none of it runs during the LCP
// window. Below-the-fold "Proven in the Field" preview; the case studies keep
// their own fully server-rendered pages.
const CaseStudiesSection = dynamic(() => import("./CaseStudiesSection"), { ssr: false });

type Props = {
  data?: unknown;
  page?: string;
};

export default function CaseStudiesSectionLazy(props: Props) {
  return (
    <LazyVisible minHeight={700}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CaseStudiesSection {...(props as any)} />
    </LazyVisible>
  );
}
