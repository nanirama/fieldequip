import Image from "next/image";
import Link from "next/link";
import type { PortableTextBlock } from "@portabletext/types";
import { PortableText, type PortableTextComponents } from "next-sanity";

import type { SanityImage } from "@/src/types/sanity-image";
import { urlForImage } from "@/src/sanity/lib/utils";
import { ButtonComponent } from "@/src/components/ButtonComponent";
import BlogFaqSection, { type BlogFaqSectionProps } from "@/src/components/Blog/BlogFaqSection";

type ButtonBlockValue = {
  _type?: string;
  text?: string;
  label?: string;
  link?: string;
  url?: string;
  href?: string;
  buttonType?: string;
  style?: string;
};

type TableValue = {
  _type: "table";
  rows?: Array<{
    _key: string;
    _type: "tableRow";
    cells?: string[];
  }>;
};

function mapButtonVariant(raw?: string): "primary" | "secondary" | "primaryBlack" | "secondarywhite" | "secondarytrnsparentWhiteBorder" {
  const v = (raw ?? "primary").toLowerCase().replace(/\s+/g, "");
  if (v === "secondary" || v === "secondarywhite") return "secondarywhite";
  if (v === "primaryblack" || v === "dark" || v === "black") return "primaryBlack";
  if (v === "outline" || v === "secondarytransparent" || v === "ghost") return "secondarytrnsparentWhiteBorder";
  return "primary";
}

function PortableImage({ value }: { value: SanityImage & { alt?: string } }) {
  const url =
    value &&
    urlForImage(value)?.width(1200)?.height(750)?.fit("max")?.quality(82)?.format("webp")?.url();
  const blur =
    value && urlForImage(value)?.width(40)?.height(25)?.blur(20)?.format("webp")?.url();
  const alt = value?.alt?.trim() || "";

  if (!url) return null;

  return (
    <figure className="my-10 min-w-0 overflow-hidden rounded-xl sm:rounded-2xl">
      <Image
        src={url}
        alt={alt || "Article image"}
        width={1200}
        height={750}
        className="h-auto w-auto min-w-[600px] mx-auto max-w-full object-cover"
        sizes="(max-width: 768px) 100vw, 720px"
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur || undefined}
        quality={80}
      />
    </figure>
  );
}

function PortableButton({ value }: { value: ButtonBlockValue }) {
  const label = (value.text || value.label || "Learn more").trim();
  const href = (value.link || value.url || value.href || "").trim();
  const variant = mapButtonVariant(value.buttonType || value.style);

  if (!href) {
    return (
      <div className="my-6">
        <ButtonComponent href={href} variant={variant} className="w-full min-h-12 sm:w-auto">
          {label}
        </ButtonComponent>
      </div>
    );
  }

  return (
    <div className="my-6">
      <ButtonComponent href={href} variant={variant} className="w-full min-h-12 sm:w-auto">
        {label}
      </ButtonComponent>
    </div>
  );
}

function PortableTable({ value }: { value: TableValue }) {
  const rows = value.rows ?? [];
  if (!rows.length) return null;
  const [head, ...body] = rows;

  return (
    <div className="my-8 overflow-x-auto border border-slate-300">
      <table className="min-w-full border-collapse text-base leading-relaxed text-[#374151]">
        {head?.cells?.length ? (
          <thead>
            <tr className="bg-[#e8eaed]">
              {head.cells.map((cell, i) => (
                <th
                  key={i}
                  className="border border-slate-300 px-5 py-4 text-center font-bold text-[#020210]"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody className="bg-white">
          {body.map((row) => (
            <tr key={row._key}>
              {(row.cells ?? []).map((cell, i) => (
                <td
                  key={i}
                  className="border border-slate-300 px-5 py-4 text-center leading-relaxed text-[#374151]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => <PortableImage value={value as SanityImage & { alt?: string }} />,
    button: ({ value }) => <PortableButton value={(value ?? {}) as ButtonBlockValue} />,
    table: ({ value }) => <PortableTable value={value as TableValue} />,
    portableFaqSection: ({ value }) => (
      <BlogFaqSection {...(value as BlogFaqSectionProps)} />
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 font-manrope text-2xl font-semibold tracking-tight text-[#020210] first:mt-0 sm:mt-12 sm:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 font-manrope text-xl font-semibold text-[#020210] sm:text-2xl">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-[#14B8A6] bg-slate-50 py-3 pl-4 pr-4 text-[#374151] sm:my-8 sm:pl-6">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mt-4 text-base leading-relaxed text-[#374151] sm:text-lg">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-[#374151] sm:pl-6">{children}</ul>,
    number: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-[#374151] sm:pl-6">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-[#020210]">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-[#020210]">{children}</code>
    ),
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href.trim() : "";
      if (!href) return <>{children}</>;
      const external = /^https?:\/\//i.test(href);
      return (
        <Link
          href={href}
          className="font-medium hover:text-[#14B8A6] text-[#374151] underline-offset-2 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6]"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </Link>
      );
    },
  },
};

type Props = {
  value: PortableTextBlock[] | undefined;
};

export default function BlogPostBody({ value }: Props) {
  if (!value?.length) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
      <div className="max-w-none text-base leading-relaxed sm:text-lg">
        <PortableText value={value} components={components} />
      </div>
    </div>
  );
}
