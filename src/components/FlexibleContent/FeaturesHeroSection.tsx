import Link from "next/link";
import { preload } from "react-dom";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { ButtonComponent } from "../ButtonComponent";
import { urlForImage } from "@/src/sanity/lib/utils";
import { FeaturesHeroDecorations } from "./FeaturesHeroDecorations";

// ─── Types ────────────────────────────────────────────────────────────────────

type CmsButton = {
  label?: string | null;
  url?: string | null;
  buttonType?: string | null;
};

/** Compatible with Sanity image references passed to `urlForImage` */
type HeroSanityImage = {
  asset?: { _ref?: string };
  alt?: string;
};

type BreadcrumbItem = {
  title?: string | null;
  href?: string | null;
};

interface FeaturesHeroData {
  badge?: string;
  heading?: string;
  description?: PortableTextBlock[];
  breadcrumb?: { items?: BreadcrumbItem[] | null } | null;
  primaryButton?: CmsButton;
  secondaryButton?: CmsButton;
  image?: HeroSanityImage;
  imageWidth?: number;
  imageHeight?: number;
  imageWidthDesktop?: number;
  imageHeightDesktop?: number;
}

interface Props {
  data?: FeaturesHeroData;
  page?: string;
}

function isValidHref(url: unknown): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

// ─── Portable Text ────────────────────────────────────────────────────────────

const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-relaxed text-[#4B5563] sm:text-lg sm:leading-relaxed">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
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

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ breadcrumb }: { breadcrumb?: FeaturesHeroData["breadcrumb"] }) {
  if (!breadcrumb) return null;
  const items = [
    { title: "Home", href: "/" },
    ...(breadcrumb.items ?? [])
      .filter((i) => i?.title?.trim())
      .map((i) => ({ title: i.title!.trim(), href: i.href ?? undefined })),
  ];
  return (
    <nav aria-label="Breadcrumb" className="relative z-10 mb-6 sm:mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#020210]/70 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.title}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span className="text-[#13A89E]">{">"}</span> : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="cursor-pointer py-2 hover:text-[#020210]"
                  style={{ touchAction: "manipulation" }}
                >
                  {item.title}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "py-2 text-[#020210]" : "py-2"}>
                  {item.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeaturesHeroSection({ data, page }: Props) {
  const badge = data?.badge;
  const heading = data?.heading ?? "";
  const description = data?.description;
  const primaryButton = data?.primaryButton;
  const secondaryButton = data?.secondaryButton;
  const image = data?.image;
  const imageWidthDesktop = data?.imageWidthDesktop ?? 800;
  const imageHeightDesktop = data?.imageHeightDesktop ?? 600;
  const imageWidthMobile = data?.imageWidth ?? 640;
  const imageAlt = image?.alt?.trim() || heading || "Product interface preview";

  // auto("format") lets Sanity CDN serve AVIF on Chrome/Edge/Firefox and WebP
  // on Safari — typically 20-30% smaller than WebP alone for the same quality.
  // fit("max") preserves natural aspect ratio.
  // quality(75) desktop, quality(75) mobile — good balance for hero images.
  const imageUrl =
    (image &&
      urlForImage(image)
        ?.width(imageWidthDesktop)
        ?.fit("max")
        ?.auto("format")
        ?.quality(75)
        ?.url()) || "/images/hero-image.png";

  const imageUrlMobile =
    urlForImage(image)
      ?.width(480)
      ?.fit("max")
      ?.auto("format")
      ?.quality(50)
      ?.url() ?? imageUrl;

  const primaryHref = isValidHref(primaryButton?.url) ? primaryButton.url.trim() : "";
  const secondaryHref = isValidHref(secondaryButton?.url)
    ? secondaryButton.url.trim()
    : "";

  const primaryLabel =
    primaryButton?.label?.trim() || (primaryHref ? "Learn more" : "");
  const secondaryLabel =
    secondaryButton?.label?.trim() || (secondaryHref ? "Learn more" : "");

  // No `type` on preload: auto("format") means Sanity serves AVIF or WebP based
  // on Accept headers — we don't know the format at build time. The browser uses
  // its own Accept header in the preload request, matches the same format the
  // <img> will request, so cache hit is guaranteed.
  preload(imageUrlMobile, { as: "image", fetchPriority: "high", media: "(max-width: 639px)" });
  preload(imageUrl, { as: "image", fetchPriority: "high", media: "(min-width: 640px)" });

  return (
    <section
      aria-labelledby="features-hero-heading"
      className="relative w-full overflow-hidden max-w-[1920px] mx-auto bg-white pt-28 pb-16"
    >
      {/* Decorative backgrounds rendered client-side after mount so their ~770 KB
          of image data doesn't compete with the LCP image fetch. Hidden on mobile
          at the component level — no server-side element at all during the LCP window. */}
      <div className="hidden md:block">
        <FeaturesHeroDecorations />
      </div>

      <div className="relative mx-auto z-40 max-w-7xl px-4 pb-12 pt-10 sm:pb-14 sm:pt-12 lg:pb-20 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0 xl:gap-x-16">
          {/* Content column — first in DOM for mobile-first; visually left on lg */}
          <div className="order-1 flex min-w-0 flex-col lg:pr-4">
            <Breadcrumb breadcrumb={data?.breadcrumb} />

            {badge ? (
              <div className="mb-5 flex w-fit items-center justify-start gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3.5 py-1.5">
                <WrenchIcon className="size-4 shrink-0 text-[#0e1d1b]" />
                <h1 className="inline-flex w-fit items-center text-xs font-medium tracking-wide text-teal-800 sm:text-sm">
                  {badge}
                </h1>
              </div>
            ) : null}

            <h2
              id="features-hero-heading"
              className="font-manrope text-2xl font-semibold leading-[1.12] tracking-tight text-black sm:text-4xl sm:leading-[1.1] lg:text-[1.8rem] xl:text-4xl xl:leading-[1.08]"
            >
              {heading}
            </h2>

            {description && description.length > 0 ? (
              <div className="mt-5 max-w-xl space-y-3 sm:mt-6 leading-[150%] text-[#020210]/70">
                <PortableText value={description} components={ptComponents} />
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[14px] mt-4">
              {primaryLabel && (
                <ButtonComponent variant="primary" className="w-full sm:w-auto" href={primaryHref}>
                  {primaryLabel}
                </ButtonComponent>
              )}
              {secondaryLabel && (
                <ButtonComponent variant="secondarytrnsparentWhiteBorder" className="w-full sm:w-auto" href={secondaryHref}>
                  {secondaryLabel}
                </ButtonComponent>
              )}
            </div>
          </div>

          {/* Image column — below content on small screens, right on lg */}
          <div className="order-2 w-full min-w-0">
            <figure className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
              <div className="overflow-hidden rounded-xl">
                <picture>
                  {/* No type="image/webp" — auto("format") means Sanity picks
                      AVIF/WebP based on Accept headers; type would lock us to WebP */}
                  <source media="(max-width: 639px)" sizes="100vw" srcSet={imageUrlMobile} />
                  <source media="(min-width: 640px)" srcSet={imageUrl} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    width={imageWidthDesktop}
                    height={imageHeightDesktop}
                    className="h-auto w-full object-cover object-top"
                    fetchPriority="high"
                    loading="eager"
                    draggable={false}
                    sizes="(max-width: 639px) 100vw, 50vw"
                  />
                </picture>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
