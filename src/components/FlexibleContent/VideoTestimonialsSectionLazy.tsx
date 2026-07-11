"use client";

import dynamic from "next/dynamic";
import LazyVisible from "@/src/components/LazyVisible";

// Same idea as CaseStudiesSectionLazy: the "Customer Testimonials" video slider
// is a below-the-fold react-slick carousel, so keep it out of the initial
// hydration and mount it on scroll.
const VideoTestimonialsSection = dynamic(() => import("./VideoTestimonialsSection"), { ssr: false });

type Props = {
  data?: unknown;
  page?: string;
};

export default function VideoTestimonialsSectionLazy(props: Props) {
  return (
    <LazyVisible minHeight={700}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <VideoTestimonialsSection {...(props as any)} />
    </LazyVisible>
  );
}
