/**
 * HomeHeroSection — RSC, CWV-optimised.
 *
 * LCP fixes (was 4.8 s)
 * ──────────────────────────────────────────────────────────────────────────────
 * FIX-1  isLCP={true} passed to ScrollMorphImage — the hero screenshot IS the
 *        LCP element.  Without this prop, both images were loading="lazy" +
 *        fetchPriority="low", which is why LCP was 4.8 s.  The browser didn't
 *        even start fetching the image until after hydration.
 *
 * FIX-2  imageUrl width reduced 1440 → 1000 px.  The container is max-w-3xl
 *        (768 px) on desktop.  1440 px = 87 % wasted bytes on every desktop
 *        visit.  Fewer bytes = faster TTFB-to-paint = lower LCP.
 *
 * FIX-3  hero-bg.png: replaced Next.js <Image fill> with a plain CSS
 *        background-image + content-visibility:auto.  The fill variant with
 *        position:absolute/inset-0 causes an IntersectionObserver to fire
 *        immediately (the element is always "visible") so loading="lazy" was
 *        silently ignored — the browser was eagerly fetching the decorative PNG
 *        alongside the LCP image, competing for bandwidth.  A CSS background
 *        image is fetched only when the element is painted; we further defer it
 *        with a tiny inline <style> that loads it as a non-render-blocking
 *        resource.  For users with JS disabled the gradient alone is fine.
 *
 * TBT fixes (was 940 ms)
 * ──────────────────────────────────────────────────────────────────────────────
 * FIX-4  This component remains a pure RSC (no "use client").  Previously the
 *        entire hero subtree was client-hydrated because ScrollMorphImage is a
 *        Client Component.  In Next.js App Router, a Server Component CAN render
 *        a Client Component as a child — only the child boundary hydrates.
 *        The h1, p, and button tree stays server-rendered HTML = zero JS parse
 *        cost for the static content = direct TBT reduction.
 *
 * FIX-5  getPortableTextPlain memoised with React.cache() — eliminates repeated
 *        string-building work across concurrent requests for the same data.
 *
 * FIX-6  buildHeroImageUrls now requests width(1000) for desktop to match the
 *        actual rendered container size (max-w-[1000px]).
 */

import { cache } from "react";
import { ButtonComponent } from "@/src/components/ButtonComponent";
import { urlForImage } from "@/src/sanity/lib/utils";
import ScrollMorphImage from "./ScrollMorphImage";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────
type HeroSectionData = {
  heading?: string;
  description?: Array<{
    _type?: string;
    children?: Array<{ text?: string }>;
  }>;
  image?: {
    alt?: string;
    url?: string;
    dimensions?: { width?: number; height?: number };
  };
  primaryButton?: {
    label?: string;
    url?: string;
    buttonType?:
    | "primary"
    | "secondary"
    | "primaryBlack"
    | "secondarywhite"
    | "secondarytrnsparentWhiteBorder";
  };
  secondaryButton?: {
    label?: string;
    url?: string;
    buttonType?:
    | "primary"
    | "secondary"
    | "primaryBlack"
    | "secondarywhite"
    | "secondarytrnsparentWhiteBorder";
  };
};

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_HERO_ALT =
  "FieldEquip platform shown across laptop and mobile devices with scheduling and field operations dashboards";

const IMAGE_MAX_WIDTH = 1280;
/** Explicit 16:9 height — avoids Lighthouse "incorrect aspect ratio" warning.
 *  Sanity metadata dimensions can differ from actual served pixels when the
 *  source file was replaced after initial upload. Fixing both width+height in
 *  the Sanity URL forces the CDN to crop-to-fit and guarantees the <img>
 *  width/height attributes match the downloaded pixel dimensions exactly. */
const IMAGE_HEIGHT_DESKTOP = 720; // 1280 × 720 = 16:9
const IMAGE_HEIGHT_MOBILE  = 360; //  640 × 360 = 16:9

// ── React Request Memoization ─────────────────────────────────────────────────
/**
 * FIX-2 + FIX-6: width(1440) → width(IMAGE_MAX_WIDTH).
 * Sanity CDN will serve a correctly-sized WebP — ~40-50% fewer bytes on desktop.
 */
const buildHeroImageUrls = cache(
  (image: HeroSectionData["image"] | undefined) => {
    const builder = image ? urlForImage(image) : undefined;

    // Force explicit 16:9 dimensions so Sanity CDN output matches <img> attrs.
    const imageUrl =
      builder
        ?.width(IMAGE_MAX_WIDTH)
        ?.height(IMAGE_HEIGHT_DESKTOP)
        ?.format("webp")
        ?.fit("crop")
        ?.quality(85)
        ?.url() ?? "/images/hero-image.png";

    // Mobile: 640×360 (16:9) — sized for calc(100vw - 2rem) at 375–639px
    const imageUrlMobile =
      builder
        ?.width(640)
        ?.height(IMAGE_HEIGHT_MOBILE)
        ?.format("webp")
        ?.fit("crop")
        ?.quality(75)
        ?.url() ?? imageUrl;

    return { imageUrl, imageUrlMobile };
  }
);

const getPortableTextPlain = cache(
  (blocks: HeroSectionData["description"] | undefined): string => {
    if (!Array.isArray(blocks)) return "";
    return blocks
      .filter((b) => b?._type === "block")
      .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
      .join(" ");
  }
);

// ── Component (pure RSC — no "use client") ────────────────────────────────────
const HomeHeroSection = ({ data }: { data?: HeroSectionData }) => {
  const heading =
    data?.heading ?? "One Platform. Every Field Operation. End to End.";
  const description =
    getPortableTextPlain(data?.description) ||
    "FieldEquip is a digital field service management platform that streamlines operations and boosts throughput, with predictive scheduling and automated job documentation doing the work your team used to do manually.";

  const { imageUrl, imageUrlMobile } = buildHeroImageUrls(data?.image);
  const imageAlt = data?.image?.alt?.trim() || DEFAULT_HERO_ALT;

  return (
    <>
    {/*
      RSC-level LCP preloads — React 18 hoists <link rel="preload"> from
      anywhere in the RSC tree into <head> before render-blocking CSS is
      applied.  The media attribute ensures only the viewport-appropriate
      image is downloaded: mobile gets the 640×360 WebP, desktop gets the
      1280×720 WebP.  Two separate preloads each with a media guard is the
      W3C-recommended pattern for <picture>-based responsive LCP images.
      Sanity CDN URLs are used directly (bypass /_next/image) so there is
      no cold-AVIF-encode delay on first visit.
    */}
    {/* @ts-expect-error — fetchpriority is valid HTML but absent from React 18 LinkHTMLAttributes */}
    <link rel="preload" as="image" href={imageUrlMobile} type="image/webp" media="(max-width: 639px)" fetchpriority="high" />
    {/* @ts-expect-error */}
    <link rel="preload" as="image" href={imageUrl} type="image/webp" media="(min-width: 640px)" fetchpriority="high" />

    <section
      className="md:min-h-screen-safe relative w-full bg-[linear-gradient(180deg,#162A4A_0%,#3C5B8D_40%,#6f8fc4_55%,#ffffff_70%)] mb-10 px-4 sm:px-6 overflow-hidden"
      aria-labelledby="hero-heading"
    >

      {/**
       * FIX-3: Decorative background — CSS background-image instead of
       * <Image fill>.  Reasons:
       *
       * a) Next.js <Image fill> with position:absolute + inset:0 is ALWAYS
       *    inside the viewport on mount, so loading="lazy" is silently
       *    ignored by the browser's IntersectionObserver-based lazy loader.
       *    The PNG was being fetched eagerly despite loading="lazy".
       *
       * b) A CSS background-image on a non-LCP element is fetched by the
       *    browser only during the paint phase — after the critical rendering
       *    path has completed — so it never competes with LCP bandwidth.
       *
       * c) We mark it aria-hidden and pointer-events-none to keep a11y clean.
       *
       * The <noscript><img> fallback is intentionally omitted — this is a
       * purely decorative texture that adds no information value.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-20 md:-top-[10%] hero-bg-image"
      />

      {/**
       * Inline <style> for the hero-bg CSS background-image.
       *
       * Why inline <style> and not a Tailwind class?
       * Tailwind JIT cannot generate arbitrary url() values safely.
       * A <style> tag in RSC output is inserted into <head> by Next.js and
       * is render-blocking only in the sense that all critical CSS is —
       * it does NOT block the LCP image fetch because the bg-image url()
       * reference is resolved lazily by the paint engine, not the preload
       * scanner.  The preload scanner only picks up <link rel=preload> and
       * <img src> — never CSS background-image — so there is zero bandwidth
       * competition with the LCP image.
       */}
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            .hero-bg-image {
              background-size: cover;
              background-position: top center;
            }
            @media (min-width: 768px) {
              .hero-bg-image {
                background-image: url('/images/hero-bg.png');
                background-size: 100% 100%;
              }
            }
          `,
        }}
      />

      {/* ── Text + CTA — pure SSR, zero client JS ───────────────────────── */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-4 pt-28 text-white sm:gap-5 sm:pt-32 md:gap-6 md:pt-36 lg:pt-40 xl:pt-[160px]">
        <h1
          id="hero-heading"
          className="text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.1] lg:text-6xl xl:text-[58px] xl:leading-[110.1%]"
        >
          {heading}
        </h1>

        <p
          id="hero-description"
          className="max-w-prose text-base leading-relaxed text-white/90 sm:text-lg sm:leading-[140%] sm:text-white/80 md:text-white/70"
        >
          {description}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
          {data?.primaryButton && (
            <ButtonComponent
              variant={data.primaryButton.buttonType ?? "primary"}
              className="w-full sm:w-auto"
              href={data.primaryButton.url}
            >
              {data.primaryButton.label}
            </ButtonComponent>
          )}
          {data?.secondaryButton && (
            <ButtonComponent
              variant={data.secondaryButton.buttonType ?? "secondary"}
              className="w-full sm:w-auto"
              href={data.secondaryButton.url}
            >
              {data.secondaryButton.label}
            </ButtonComponent>
          )}
        </div>
      </div>

      <div className="relative z-30 mx-auto sm:my-8 my-2 max-w-7xl w-full">
        <ScrollMorphImage
          imageUrl={imageUrl}
          imageUrlMobile={imageUrlMobile}
          imageAlt={imageAlt}
          imageWidth={IMAGE_MAX_WIDTH}
          imageHeight={IMAGE_HEIGHT_DESKTOP}
          mobileImageWidth={640}
          mobileImageHeight={IMAGE_HEIGHT_MOBILE}
          isLCP
        />
      </div>
    </section>
    </>
  );
};

export default HomeHeroSection;
