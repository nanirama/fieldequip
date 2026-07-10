import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";

import BaseLayout from "@/src/components/BaseLayout";
import { ButtonComponent } from "@/src/components/ButtonComponent";
import JsonLd from "@/src/components/JsonLd";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { urlForImage } from "@/src/sanity/lib/utils";
import { loadWhitePapersList, loadWhitePapersPage, loadHeader } from "@/src/sanity/loader/loadQuery";
import type { SanityImage } from "@/src/types/sanity-image";
import { buildBreadcrumbs } from "@/lib/schema";
const getHeader = cache(loadHeader)
type WhitePapersPageCta = {
  label?: string;
  url?: string | null;
  buttonType?:
  | "primary"
  | "secondary"
  | "primaryBlack"
  | "secondarywhite"
  | "secondarytrnsparentWhiteBorder";
};

type WhitePaperListItem = {
  _id: string;
  name?: string;
  slug?: string;
  shortDescription?: PortableTextBlock[];
  image?: SanityImage & { alt?: string; lqip?: string };
};

type WhitePapersPageData = {
  _id?: string;
  name?: string;
  description?: string;
  image?: SanityImage & { alt?: string; lqip?: string };
  content?: PortableTextBlock[];
  ctaButton?: WhitePapersPageCta;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
};

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className="mt-0.5 h-5 w-5 shrink-0 text-[#13A89E]"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const shortDescriptionListComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-base leading-relaxed text-black max-w-[512px] [&+p]:mt-3 mt-6">{children}</p>
    ),
  },
};

const contentPortableTextComponents = {
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="mt-4 space-y-3">{children}</ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="mt-4 list-decimal space-y-2 ps-5 marker:text-[#020210]/80">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <li className="flex items-start gap-2.5 text-base font-extrabold leading-relaxed text-[#191921]">
        <CheckIcon />
        <span>{children}</span>
      </li>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <li className="ps-1 text-xl font-medium leading-relaxed text-[#020210]">{children}</li>
    ),
  },
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-2xl lg:text-[32px] leading-snug text-[#191921] [&+p]:mt-4">{children}</p>
    ),
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const result = await loadWhitePapersPage();
  const data = result.data as WhitePapersPageData | null | undefined;

  const title = data?.seo?.metaTitle || data?.name || "Whitepapers";
  const description =
    data?.seo?.metaDescription?.trim() ||
    data?.description?.trim() ||
    "";

  return seoGenerateMetadata({
    title,
    description,
    url: "/whitepaper",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function WhitepaperPage() {
  const [pageResult, listResult, headerResult] = await Promise.all([
    loadWhitePapersPage(),
    loadWhitePapersList(),
    getHeader()
  ]);
  const data = pageResult.data as WhitePapersPageData | null | undefined;
  const settings = headerResult.data ?? {}
  const papers =
    (listResult.data as WhitePaperListItem[] | null | undefined)?.filter(
      (p): p is WhitePaperListItem => Boolean(p?._id && p?.slug),
    ) ?? [];

  if (!data) {
    notFound();
  }

  const imageUrl = data.image
    ? urlForImage(data.image)?.width(1200).format("webp").quality(88).url()
    : undefined;

  const cta = data.ctaButton;
  const ctaHref = cta?.url?.trim() || undefined;

  return (
    <>
      <JsonLd schema={buildBreadcrumbs([
        { label: "Home", href: "/" },
        { label: "Whitepapers", href: "/whitepaper" },
      ])} />
      <BaseLayout layout="light" settings={settings}>
      <div className="md:absolute sm:-bottom-[20%] md:-bottom-[40%] md:left-[0%] sm:left-0 bg-[url('/images/abt-hero-left-shadow.png')] bg-no-repeat bg-contain z-40 md:w-[481px] md:h-[580px]" />
      <div className="absolute sm:top-[0%] md:right-[10%] sm:right-0 bg-[url('/images/abt-hero-right-shadow.png')] bg-no-repeat bg-contain z-30 md:w-[432px] md:h-[450px] " />
      <section className="relative w-full overflow-hidden bg-white">
        <div className="relative z-40 mx-auto max-w-7xl px-4 pt-25 lg:pt-40">
          <h1 className="max-w-3xl font-manrope text-4xl font-medium tracking-tight text-[#020210] sm:text-5xl">
            {data.name}
          </h1>
          {data.description ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#020210]/70">
              {data.description}
            </p>
          ) : null}
        </div>

        <div className="mx-auto grid max-w-7xl relative z-40 grid-cols-1 items-center gap-10 sm:gap-20 lg:gap-30 px-4 pb-14 pt-10 sm:pb-18 sm:pt-12 lg:grid-cols-2 lg:pb-22 lg:pt-16">
          <div className="min-w-0">
            {imageUrl ? (
              <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200/60">
                <div className="p-3.5 bg-[#ebeff4]">
                  <Image
                    src={imageUrl}
                    alt={
                      (data.image && "alt" in data.image && data.image.alt) ||
                      data.name ||
                      "Whitepaper preview"
                    }
                    width={1200}
                    height={800}
                    placeholder={data.image?.lqip ? "blur" : "empty"}
                    blurDataURL={data.image?.lqip}
                    className="h-auto w-full object-cover"
                    quality={80}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col">
            {data.content && data.content.length > 0 ? (
              <div className="prose prose-slate max-w-none prose-p:text-[#020210]">
                <PortableText
                  value={data.content}
                  components={contentPortableTextComponents}
                />
              </div>
            ) : null}

            {cta?.label ? (
              <div className="mt-8 sm:mt-10">
                <ButtonComponent
                  href={ctaHref}
                  variant={cta.buttonType || "primary"}
                  className="w-full sm:w-auto"
                >
                  {cta.label}
                </ButtonComponent>
              </div>
            ) : null}
          </div>
        </div>

        {papers.length > 0 ? (
          <div className="border-t border-slate-200/80 bg-slate-50/40">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-22">
              <ul className="flex flex-col gap-14 sm:gap-16 lg:gap-20">
                {papers.map((paper) => {
                  const href = `/whitepaper/${paper.slug}`;
                  const thumbUrl = paper.image
                    ? urlForImage(paper.image)?.width(960).format("webp").quality(88).url()
                    : undefined;
                  return (
                    <li key={paper._id}>
                      <article className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-20 xl:gap-30">
                        <div className="order-2 min-w-0 lg:order-1">
                          <h2 className="text-balance font-manrope font-semibold leading-snug tracking-tight text-[#191921] text-xl sm:text-2xl lg:text-[32px]">
                            <Link
                              href={href}
                              className="transition hover:text-[#13A89E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#13A89E] focus-visible:ring-offset-2"
                            >
                              {paper.name}
                            </Link>
                          </h2>
                          {paper.shortDescription && paper.shortDescription.length > 0 ? (
                            <div className="mt-4 max-w-xl">
                              <PortableText
                                value={paper.shortDescription}
                                components={shortDescriptionListComponents}
                              />
                            </div>
                          ) : null}
                          <div className="mt-6 lg:mt-8">
                            <ButtonComponent
                              href={href}
                              variant="primary"
                              className="w-full sm:w-auto"
                            >
                              Download the Full Whitepaper
                            </ButtonComponent>
                          </div>
                        </div>
                        <div className="order-1 min-w-0 lg:order-2">
                          {thumbUrl ? (
                            <Link
                              href={href}
                              className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:ring-[#13A89E]/30"
                            >
                              <div className="p-3.5 bg-[#ebeff4]">
                                <Image
                                  src={thumbUrl}
                                  alt={paper.image?.alt || paper.name || "Whitepaper"}
                                  width={960}
                                  height={640}
                                  placeholder={paper.image?.lqip ? "blur" : "empty"}
                                  blurDataURL={paper.image?.lqip}
                                  className="h-auto w-full object-cover rounded-xl transition duration-300 group-hover:scale-[1.02]"
                                  quality={80}
                                  sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                              </div>
                            </Link>
                          ) : (
                            <Link
                              href={href}
                              className="flex min-h-[200px] items-center justify-center rounded-2xl bg-slate-100 text-sm font-medium text-[#020210]/50 ring-1 ring-slate-200/80"
                            >
                              View whitepaper
                            </Link>
                          )}
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </section>
      </BaseLayout>
    </>
  );
}
