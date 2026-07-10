import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import type { CSSProperties } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackageCard {
  _key?: string
  tier?: string
  isFeatured?: boolean
  heading?: string
  description?: PortableTextBlock[]
  features?: string[]
  cta?: {
    label?: string
    href?: string
    openInNewTab?: boolean
  }
}

interface PackageDetailsSectionData {
  eyebrow?: string
  heading?: string
  subHeading?: string
  description?: PortableTextBlock[]
  packages?: PackageCard[]
}

// ─── Module-level style constants — zero per-render allocation ────────────────

/**
 * content-visibility: auto  → browser skips layout + paint for this section
 *   while it is off-screen (direct Speed Index improvement).
 * containIntrinsicBlockSize → placeholder height so the scrollbar doesn't
 *   jump when the section enters the viewport (prevents CLS).
 */
const SECTION_STYLE: CSSProperties = {
  contentVisibility: 'auto',
  // "auto 900px": browser uses 900px as placeholder on first paint, then
  // remembers the real rendered height. Prevents anchor-scroll miscalculation
  // when #get-quote sits below this section (static '900px' estimate causes
  // the browser to land at the wrong offset if actual height > 900px).
  containIntrinsicBlockSize: 'auto 900px',
}

/**
 * contain: layout style  → browser can skip this subtree in global
 *   layout/style recalculations.  "paint" is deliberately excluded so the
 *   "Most Popular" badge (absolute -top-[18px]) is not clipped.
 */
const CARD_CONTAIN_STYLE: CSSProperties = {
  contain: 'layout style',
}

// ─── PortableText configs — allocated once, never recreated ───────────────────

const sectionDescComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-white/60 text-base leading-relaxed my-2 py-1">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
}

const cardDescComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-white/65 text-sm sm:text-base leading-relaxed">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
}

// ─── Icons — pure SVG, no deps ────────────────────────────────────────────────

function CheckIcon() {
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
        <path
          d="M1 4L3.5 6.5L9 1"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function PackageCard({ card }: { card: PackageCard }) {
  const { tier, isFeatured, heading, description, features, cta } = card

  return (
    <div
      style={CARD_CONTAIN_STYLE}
      className={
        'relative flex flex-col rounded-2xl p-6 sm:p-8 bg-[#102240] ' +
        (isFeatured ? 'border-2 border-[#13A89E]' : 'border border-white/10')
      }
    >
      {isFeatured && (
        <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#13A89E] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          <StarIcon />
          Most Popular
        </div>
      )}

      {tier && (
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#13A89E]">
          {tier}
        </p>
      )}

      {heading && (
        <h3 className="mb-4 text-xl font-bold leading-snug text-white sm:text-2xl">
          {heading}
        </h3>
      )}

      {description && description.length > 0 && (
        <div className="mb-5">
          <PortableText value={description} components={cardDescComponents} />
        </div>
      )}

      <div className="mb-5 border-t border-white/10" />

      {features && features.length > 0 && (
        <ul className="flex flex-1 flex-col gap-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckIcon />
              <span className="text-sm leading-snug text-white/85 sm:text-base">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/*
        Plain <a> instead of next/link.
        next/link is a Client Component — importing it in an RSC ships the Link
        hydration runtime to the browser for every page that renders this section.
        These CTAs go to a contact/quote page with no SPA prefetch benefit,
        so a plain anchor is strictly faster: zero client JS.
      */}
      {cta?.href && (
        <div className="mt-8">
          <a
            href={`#get-quote`}
            target={cta.openInNewTab ? '_blank' : undefined}
            rel={cta.openInNewTab ? 'noopener noreferrer' : undefined}
            className={
              'block w-full rounded-full py-3 px-6 text-center text-sm font-semibold transition-colors duration-200 ' +
              (isFeatured
                ? 'bg-[#13A89E] text-white hover:bg-blue-700'
                : 'border border-white/20 text-white/80 hover:border-white/40 hover:text-white')
            }
          >
            {cta.label ?? 'Get a Quote'}
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function PackageDetailsSection({
  data,
}: {
  data?: PackageDetailsSectionData
}) {
  if (!data) return null

  const { eyebrow, heading, subHeading, description, packages } = data

  // Only add grid top-padding when a featured badge actually overflows upward.
  const hasFeatured = packages?.some((p) => p.isFeatured) ?? false

  return (
    <section
      style={SECTION_STYLE}
      className="bg-brand px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">

        <div className="mb-12 sm:mb-16 flex md:flex-row flex-col justify-start items-end gap-4">
          <div className="md:w-[55%]">
          {eyebrow && (
            <p className=" mb-3 text-xs font-bold uppercase tracking-widest text-[#13A89E]">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="mb-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-[40px] ">
              {heading}
            </h2>
          )}
          </div>
          <div className="md:w-[45%]">
          {subHeading && !description?.length && (
            <p className="max-w-2xl text-base text-white/60 sm:text-lg">
              {subHeading}
            </p>
          )}
          {description && description.length > 0 && (
            <div className="max-w-2xl">
              <PortableText value={description} components={sectionDescComponents} />
            </div>
          )}
          </div>
        </div>

        {packages && packages.length > 0 && (
          <div
            className={
              'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8' +
              (hasFeatured ? ' pt-5' : '')
            }
          >
            {packages.map((card) => (
              <PackageCard key={card._key ?? card.tier} card={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
