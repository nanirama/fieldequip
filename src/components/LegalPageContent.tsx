import Link from "next/link";
import type { PortableTextBlock } from "@portabletext/types";
import { PortableText, type PortableTextComponents } from "next-sanity";

// ── Heading helpers ───────────────────────────────────────────────────────────

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type Heading = { text: string; id: string };

function extractHeadings(content: PortableTextBlock[]): Heading[] {
  return content
    .filter((b: any) => b._type === "block" && b.style === "h2")
    .map((b: any) => {
      const text = (b.children ?? [])
        .map((c: { text?: string }) => c.text ?? "")
        .join("");
      return { text, id: generateId(text) };
    })
    .filter((h) => h.text);
}

function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 2) return null;

  const mid = Math.ceil(headings.length / 2);
  const left = headings.slice(0, mid);
  const right = headings.slice(mid);

  return (
    <nav aria-label="Table of contents" className="my-8 rounded-xl border border-teal-100 bg-[#eef9f9] px-6 py-5">
      <p className="mb-4 text-sm font-bold uppercase tracking-widest text-teal-700">
        Contents
      </p>
      <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        <ol className="space-y-2.5">
          {left.map((h, i) => (
            <li key={h.id} className="flex items-start gap-2 text-sm leading-snug">
              {/* <span className="shrink-0 tabular-nums text-slate-500">{i + 1}.</span> */}
              <a
                href={`#${h.id}`}
                className="text-teal-600 underline-offset-2 transition-colors hover:text-teal-800 hover:underline"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
        {right.length > 0 && (
          <ol className="mt-2.5 space-y-2.5 sm:mt-0">
            {right.map((h, i) => (
              <li key={h.id} className="flex items-start gap-2 text-sm leading-snug">
                {/* <span className="shrink-0 tabular-nums text-slate-500">{mid + i + 1}.</span> */}
                <a
                  href={`#${h.id}`}
                  className="text-teal-600 underline-offset-2 transition-colors hover:text-teal-800 hover:underline"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </nav>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TableValue = {
  _type: "table";
  rows?: Array<{
    _key: string;
    _type: "tableRow";
    cells?: string[];
  }>;
};

type NoteBlockValue = {
  _type: "publisherNoteBlock" | "importantNoteBlock";
  label?: string;
  body?: PortableTextBlock[];
};

// ── Shared mark helpers ────────────────────────────────────────────────────────

function noteLink(
  href: string,
  blank: boolean,
  colorClass: string,
  children: React.ReactNode,
) {
  return (
    <a
      href={href}
      className={`underline underline-offset-2 ${colorClass}`}
      {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

// Components for the first paragraph inside a note — renders block as a
// fragment so the bold label and paragraph text stay on the same line.
function makeFirstParaComponents(linkColor: string): PortableTextComponents {
  return {
    block: { normal: ({ children }) => <>{children}</> },
    marks: {
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      link: ({ value, children }) =>
        noteLink(value?.href ?? "", value?.blank ?? false, linkColor, children),
    },
  };
}

// Components for subsequent paragraphs inside a note.
function makeRestComponents(
  textColor: string,
  linkColor: string,
): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => (
        <p className={`mt-2 leading-relaxed sm:text-base text-sm ${textColor}`}>{children}</p>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      link: ({ value, children }) =>
        noteLink(value?.href ?? "", value?.blank ?? false, linkColor, children),
    },
  };
}

// ── Table ─────────────────────────────────────────────────────────────────────

function LegalTable({ value }: { value: TableValue }) {
  const rows = value.rows ?? [];
  if (!rows.length) return null;
  const [head, ...body] = rows;

  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-collapse text-sm">
        {head?.cells?.length ? (
          <thead>
            <tr className="bg-blue-50">
              {head.cells.map((cell, i) => (
                <th
                  key={i}
                  className="bg-blue-50 border-b-2 border-b-slate-300 border-r border-r-slate-200 last:border-r-0 px-4 py-3 text-left font-bold text-[#1a1a1a]"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {body.map((row) => (
            <tr key={row._key} className="border-b border-slate-200 last:border-b-0">
              {(row.cells ?? []).map((cell, i) => (
                <td
                  key={i}
                  className="border-r border-slate-200 last:border-r-0 px-4 py-4 align-top leading-relaxed text-[#374151]"
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

// ── Publisher Note (orange) ────────────────────────────────────────────────────

function PublisherNote({ value }: { value: NoteBlockValue }) {
  const [first, ...rest] = value.body ?? [];
  const labelColor = "text-orange-800";
  const bodyColor = "text-[#7c2d12]";
  const linkColor = "text-orange-700 hover:text-orange-900";

  return (
    <div className="my-6 rounded-lg border border-orange-200 border-l-4 border-l-orange-400 bg-orange-50 px-5 py-4">
      {first ? (
        <p className={`leading-relaxed sm:text-base text-sm ${bodyColor}`}>
          {/* {value.label && (
            <strong className={`font-bold ${labelColor}`}>{value.label}</strong>
          )}{" "} */}
          <PortableText value={[first]} components={makeFirstParaComponents(linkColor)} />
        </p>
      ) : value.label ? (
        <p className={`sm:text-base text-sm font-bold ${labelColor}`}>{value.label}</p>
      ) : null}
      {rest.length > 0 && (
        <PortableText value={rest} components={makeRestComponents(bodyColor, linkColor)} />
      )}
    </div>
  );
}

// ── Important Note (blue) ──────────────────────────────────────────────────────

function ImportantNote({ value }: { value: NoteBlockValue }) {
  const [first, ...rest] = value.body ?? [];
  const labelColor = "text-blue-800";
  const bodyColor = "text-slate-700";
  const linkColor = "text-blue-600 hover:text-blue-800";

  return (
    <div className="my-6 rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
      {first ? (
        <p className={`leading-relaxed sm:text-base text-sm ${bodyColor}`}>
          {/* {value.label && (
            <strong className={`font-bold ${labelColor}`}>{value.label}</strong>
          )}{" "} */}
          <PortableText value={[first]} components={makeFirstParaComponents(linkColor)} />
        </p>
      ) : value.label ? (
        <p className={`sm:text-base text-sm font-bold ${labelColor}`}>{value.label}</p>
      ) : null}
      {rest.length > 0 && (
        <PortableText value={rest} components={makeRestComponents(bodyColor, linkColor)} />
      )}
    </div>
  );
}

// ── Main PortableText components ──────────────────────────────────────────────

const components: PortableTextComponents = {
  types: {
    table: ({ value }) => <LegalTable value={value as TableValue} />,
    publisherNoteBlock: ({ value }) => <PublisherNote value={value as NoteBlockValue} />,
    importantNoteBlock: ({ value }) => <ImportantNote value={value as NoteBlockValue} />,
  },
  block: {
    h2: ({ children, value }) => {
      const text = ((value as any)?.children ?? [])
        .map((c: { text?: string }) => c.text ?? "")
        .join("");
      return (
        <h2
          id={generateId(text)}
          className="mt-4 my-4 font-manrope text-xl font-semibold tracking-tight text-[#51423e] first:mt-0 sm:mt-6 sm:text-2xl scroll-mt-24"
        >
          {children}
        </h2>
      );
    },
    normal: ({ children }) => (
      <p className="leading-relaxed text-[#554743] mb-2 sm:text-base">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-3 list-disc space-y-2 pl-5 text-[#374151] sm:pl-6">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-3 list-decimal space-y-2 pl-5 text-[#374151] marker:text-[#374151] sm:pl-6">
        {children}
      </ol>
    ),
    alpha: ({ children }) => (
      <ol className="my-3 list-[lower-alpha] space-y-2 pl-5 text-[#374151] marker:text-[#374151] sm:pl-6">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
    alpha: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-lg text-[#42312d]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href.trim() : "";
      if (!href) return <>{children}</>;
      const external = /^https?:\/\//i.test(href);
      return (
        <Link
          href={href}
          className="font-medium text-[#374151] underline underline-offset-2 hover:text-[#14B8A6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6]"
          {...(value?.openInNewTab || external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </Link>
      );
    },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  title: string;
  effectiveDate?: string;
  content: PortableTextBlock[] | undefined;
};

export default function LegalPageContent({ title, effectiveDate, content }: Props) {
  const headings = content?.length ? extractHeadings(content) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36">
      <h1 className="font-manrope text-3xl font-semibold tracking-tight text-[#020210] lg:text-5xl">
        {title}
      </h1>
      {effectiveDate && (
        <p className="mt-3 text-sm text-[#6b7280]">Effective date: {effectiveDate}</p>
      )}
      <TableOfContents headings={headings} />
      {content?.length ? (
        <div className="mt-4">
          <PortableText value={content} components={components} />
        </div>
      ) : null}
    </div>
  );
}
