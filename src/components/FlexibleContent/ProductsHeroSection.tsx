import Link from "next/link";
import { preload } from "react-dom";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlForImage, sameOriginImage } from "@/src/sanity/lib/utils";
import { ProductHeroDecorations } from "./ProductHeroDecorations";
import { ButtonComponent } from "../ButtonComponent";
// ─── Types ────────────────────────────────────────────────────────────────────

interface Button {
  label?: string | null;
  url?: string | null;
}

function isValidHref(url: unknown): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

/** Matches Sanity image shape for `urlForImage` */
type ProductHeroImage = {
  asset?: { _ref?: string };
  alt?: string;
};

interface ProductHeroSectionProps {
  data?: {
    badge?: string;
    heading?: string;
    description?: PortableTextBlock[];
    primaryButton?: Button;
    secondaryButton?: Button;
    image?: ProductHeroImage;
    imageHeight?: number;
    imageWidth?: number;
    imageWidthDesktop?: number;
    imageHeightDesktop?: number;
  };
}

// ─── PortableText ───────────────────────────────────────────────────────────────

const descriptionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p>
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-neutral-800">{children}</em>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? ''
      const newTab: boolean = value?.openInNewTab ?? true
      return (
        <Link
          href={href}
          className="text-teal-600 underline underline-offset-2 hover:text-teal-700 transition-colors"
        >
          {children}
        </Link>
      )
    },
  },
};

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductHeroSection({ data }: ProductHeroSectionProps) {
  const badge = data?.badge;
  const heading = data?.heading ?? "";
  const description = data?.description;
  const primaryButton = data?.primaryButton;
  const secondaryButton = data?.secondaryButton;
  const image = data?.image;
  const imageWidthMobile = data?.imageWidth ?? 640;
  const imageHeightMobile = data?.imageHeight ?? 640;
  const imageWidthDesktop = data?.imageWidthDesktop ?? 860;
  const imageHeightDesktop = data?.imageHeightDesktop ?? Math.round(860 / (image?.asset?.metadata?.dimensions?.aspectRatio ?? 1));

  const imageAlt = image?.alt?.trim() || heading || "FieldEquip product interface";

  // Explicit WebP via ?fm=webp: the format is baked into the URL so the
  // preload request and <img> fetch hit the same browser cache entry regardless
  // of their Accept headers. auto("format") appends ?auto=format which triggers
  // Vary: Accept on Sanity's CDN — the preload scanner and the <img> fetch can
  // send different Accept headers (AVIF vs WebP), producing a cache miss.
  const imageUrl = sameOriginImage(
    (image &&
      urlForImage(image)
        ?.width(imageWidthDesktop)
        ?.fit("max")
        ?.format("webp")
        ?.quality(75)
        ?.url()) || "/images/hero-image.png"
  );

  const imageUrlMobile = sameOriginImage(
    urlForImage(image)
      ?.width(imageWidthMobile)
      ?.height(imageHeightMobile)
      ?.fit("max")
      ?.format("webp")
      ?.quality(40)
      ?.url() ?? imageUrl
  );

  const primaryHref = isValidHref(primaryButton?.url) ? primaryButton.url.trim() : "";
  const secondaryHref = isValidHref(secondaryButton?.url)
    ? secondaryButton.url.trim()
    : "";

  const primaryLabel =
    primaryButton?.label?.trim() || (primaryHref ? "Schedule a Demo" : "");
  const secondaryLabel =
    secondaryButton?.label?.trim() ||
    (secondaryHref ? "Build Your Business Case" : "");

  // type: "image/webp" lets the browser skip the preload on the rare browser
  // that doesn't support WebP (it would skip the <source> too, so no wasted fetch).
  preload(imageUrlMobile, { as: "image", fetchPriority: "high", type: "image/webp", media: "(max-width: 639px)", imageSizes: "100vw" });
  preload(imageUrl, { as: "image", fetchPriority: "high", type: "image/webp", media: "(min-width: 640px)" });

  return (
    <section
      aria-labelledby="product-hero-heading"
      className="min-h-screen relative mx-auto w-full max-w-[1640px] overflow-x-hidden overflow-y-hidden bg-white"
    >
      {/* Atmosphere: soft teal wash + dot grid on the right (design) */}
      {/* <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-[min(100%,920px)] bg-gradient-to-l from-teal-50/95 via-cyan-50/40 to-transparent lg:max-w-[58%]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-[min(100%,880px)] bg-[linear-gradient(to_right,rgba(20,184,166,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,184,166,0.08)_1px,transparent_1px)] bg-[length:28px_28px] opacity-60 lg:max-w-[52%]"
      /> */}

      {/* Decorative backgrounds rendered client-side after mount so their ~770 KB
          of image data doesn't compete with the LCP image fetch. Hidden on mobile
          at the component level (md:block) — no server-side element at all during
          the LCP window. */}
      <div className="hidden md:block">
        <ProductHeroDecorations />
      </div>


      <div className="relative z-40 flex w-full flex-col gap-y-3 pt-24 pb-8 sm:gap-y-12 sm:py-20 lg:flex-row lg:items-stretch lg:gap-x-0 lg:gap-y-0 lg:py-24 xl:py-28">
        {/* Copy: 50% column; pl aligns with left edge of centered max-w-7xl (1280px) inside 1920 */}
        <div
          className="order-1 flex w-full z-80 relative min-w-0 flex-col justify-center px-4 sm:px-6 lg:box-border lg:flex-[0_0_50%] lg:pl-[max(1rem,calc((min(100vw,1640px)-1280px)/2+1rem))] lg:pr-8 xl:pr-10"
        >
          {badge ? (
            <div className="mb-5 flex w-fit items-center justify-start gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3.5 py-1.5">
              <WrenchIcon className="size-4 shrink-0 text-[#0e1d1b]" />
              <h1 className="inline-flex w-fit items-center text-xs font-medium tracking-wide text-teal-800 sm:text-sm">
                {badge}
              </h1>
            </div>
          ) : null}

          <h2
            id="product-hero-heading"
            className="text-balance text-3xl font-bold leading-[1.12] tracking-tight text-black sm:text-4xl sm:leading-[1.1] lg:text-5xl lg:leading-[1.08] xl:text-[3.25rem]"
          >
            {heading}
          </h2>

          {description && (
            <div className="mt-3 max-w-xl space-y-3 sm:mt-6">
              <PortableText
                value={description}
                components={descriptionComponents}
              />
            </div>
          )}



          {(primaryHref && primaryLabel) || (secondaryLabel && secondaryHref) ? (
            <div className="mt-4 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {primaryHref && primaryLabel && (
                <ButtonComponent variant="primary" href={primaryHref} className="w-full sm:w-auto">
                  {primaryLabel}
                </ButtonComponent>
              )}
              {secondaryLabel && secondaryHref && (
                <ButtonComponent variant="secondarytrnsparentWhiteBorder" href={secondaryHref} className="w-full sm:w-auto">
                  {secondaryLabel}
                </ButtonComponent>
              )}
            </div>
          ) : null}
          </div>

        {/* Image: 50% column */}
        <div className="order-2 flex w-full min-w-0 items-center justify-center px-4 sm:px-6 lg:flex-[0_0_50%] lg:justify-end lg:pl-6 lg:pr-0">
          <figure className="z-20 w-full max-w-lg sm:max-w-2xl lg:max-w-none">
              <picture>
                <source media="(max-width: 639px)" srcSet={imageUrlMobile} type="image/webp" sizes="100vw" />
                <source media="(min-width: 640px)" srcSet={imageUrl} type="image/webp" />

                <img
                  src={imageUrlMobile}
                  alt={imageAlt}
                  width={imageWidthMobile}
                  height={imageHeightMobile}
                  className="w-full h-auto block"
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  draggable={false}
                />
              </picture>
            </figure>
        </div>
      </div>
    </section>
  );
}
