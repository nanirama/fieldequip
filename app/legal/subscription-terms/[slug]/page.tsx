import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";

import BaseLayout from "@/src/components/BaseLayout";
import { seoGenerateMetadata } from "@/src/components/Seo";
import {
  loadLegalLandingPage,
  loadLegalLandingPageSlugs,
} from "@/src/sanity/loader/loadQuery";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type LegalLandingContentItem = {
  _key?: string;
  title?: string;
  description?: PortableTextBlock[];
};

type LegalLandingPage = {
  _id?: string;
  title?: string;
  slug?: string;
  documentDetails?: PortableTextBlock[];
  printDetails?: PortableTextBlock[];
  contents?: LegalLandingContentItem[];
};

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="mt-8 border-t border-[#E6EAF0] pt-6 font-manrope text-2xl font-semibold tracking-tight text-[#020210] first:mt-0 first:border-t-0 first:pt-0">
        {children}
      </h2>
    ),
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-lg leading-relaxed text-[#162A4A] [&+p]:mt-3">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="mt-4 list-disc space-y-1.5 pl-8 text-lg leading-relaxed text-[#020210]">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="mt-4 list-decimal space-y-1.5 pl-8 text-lg leading-relaxed text-[#020210]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
    number: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-semibold text-[#020210]">{children}</strong>
    ),
    em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  },
};

function portableTextToPlainText(value: PortableTextBlock[] | undefined): string {
  if (!Array.isArray(value)) return "";

  return value
    .map((block) =>
      Array.isArray(block.children)
        ? block.children.map((child) => ("text" in child ? String(child.text) : "")).join("")
        : "",
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function sectionAnchor(title: string, index: number) {
  return `${slugify(title, "section")}-${index + 1}`;
}

function titleWithNumber(title: string, index: number) {
  return /^\d+[\).\s-]/.test(title.trim()) ? title : `${index + 1}. ${title}`;
}

export async function generateStaticParams() {
  const result = await loadLegalLandingPageSlugs();
  const rows = (result.data as { slug?: string }[] | null | undefined) ?? [];

  return rows
    .filter((row): row is { slug: string } => Boolean(row?.slug))
    .map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadLegalLandingPage(slug);
  const data = result.data as LegalLandingPage | null | undefined;

  if (!data) {
    return { title: "Subscription Terms" };
  }

  return seoGenerateMetadata({
    title: data.title || "FieldEquip Subscription Terms",
    description:
      portableTextToPlainText(data.documentDetails) ||
      portableTextToPlainText(data.printDetails) ||
      "",
    url: `/legal/subscription-terms/${slug}`,
  });
}

export default async function LegalLandingPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const result = await loadLegalLandingPage(slug);
  const data = result.data as LegalLandingPage | null | undefined;

  if (!data?.title) {
    notFound();
  }

  const contents = data.contents?.filter((item) => item?.title?.trim()) ?? [];

  return (
     <main className="bg-white">
      <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-manrope text-3xl font-semibold tracking-tight text-[#020210] sm:text-4xl">
            {data.title}
          </h1>
          {data.documentDetails?.length ? (
            <div className="mt-3 space-y-2">
              <PortableText value={data.documentDetails} components={portableTextComponents} />
            </div>
          ) : null}
        </header>

        {contents.length ? (
          <nav
            aria-labelledby="legal-contents-heading"
            className="mt-7 rounded-2xl border border-[#E0E4EA] px-5 pb-6 pt-4 sm:px-6"
          >
            <div className="py-4">
              <h2
                id="legal-contents-heading"
                className="font-manrope text-xl font-semibold tracking-tight text-[#020210]"
              >
                Contents
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-lg leading-relaxed">
                {contents.map((item, index) => {
                  const title = item.title ?? "";
                  const sectionId = sectionAnchor(title, index);

                  return (
                    <li key={item._key ?? sectionId}>
                      <a
                        href={`#${sectionId}`}
                        className="text-[#008D84] underline-offset-4 transition-colors hover:text-[#006F68] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#13A89E] focus-visible:ring-offset-2"
                      >
                        {titleWithNumber(title, index)}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        ) : null}

        {data.printDetails?.length ? (
          <div className="mt-12 space-y-4">
            <PortableText value={data.printDetails} components={portableTextComponents} />
          </div>
        ) : null}

        {contents.length ? (
          <div className="mt-10 space-y-8">
            {contents.map((item, index) => {
              const title = item.title ?? "";
              const sectionId = sectionAnchor(title, index);

              return (
                <section
                  id={sectionId}
                  key={item._key ?? sectionId}
                  className="scroll-mt-28 border-t border-[#E6EAF0] pt-6"
                >
                  <h2 className="font-manrope text-2xl font-semibold tracking-tight text-[#020210]">
                    {titleWithNumber(title, index)}
                  </h2>
                  {item.description?.length ? (
                    <div className="mt-4">
                      <PortableText
                        value={item.description}
                        components={portableTextComponents}
                      />
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        ) : null}
      </article>
      </main>
  );
}
