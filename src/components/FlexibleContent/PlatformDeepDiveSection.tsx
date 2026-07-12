// Server Component.
//
// This section used to be one big client component: the tab bar, all four
// panels and every accordion row hydrated on load, even though the whole thing
// sits well below the fold. It's plain server markup now —
//
//   tabs       -> radio inputs + <label> pills (`:checked` drives the panels)
//   accordion  -> native <details name="..."> (one open at a time, as before)
//   screenshot -> CSS `:has()` picks the image belonging to the open row
//
// so none of it runs JavaScript. Every tab's copy is still in the HTML exactly
// as it was, so crawlers see all of it. The only client code left is the mobile
// dropdown, which does nothing but open and close itself.
//
// The repeated row styles live in globals.css rather than as Tailwind strings:
// a Server Component's markup is serialised into the RSC payload as well as the
// HTML, so a 200-character className on 60 rows gets paid for twice.

import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import { urlForImage } from '@/src/sanity/lib/utils'
import PlatformDeepDiveTabSelect from './PlatformDeepDiveTabSelect'

// ─── Types ────────────────────────────────────────────────────────────────────

type SanityImage = {
  asset?: { _ref?: string }
  alt?: string
}

export interface AccordionItem {
  _key?: string
  title: string
  description?: PortableTextBlock[]
  link?: { label?: string; url?: string }
  image?: SanityImage
}

export interface PlatformTab {
  _key?: string
  label: string
  image?: SanityImage & { alt?: string }
  items?: AccordionItem[]
}

interface PlatformDeepDiveSectionProps {
  data?: {
    heading?: string
    subheading?: string
    tabs?: PlatformTab[]
  }
}

const PREVIEW_ORIGIN = 'https://fieldequip.com'
const CANONICAL_ORIGIN = 'https://preview.fieldequip.com'

// The radios need document-unique ids, and the section only ever appears once.
const ID = 'dd'

function sanitizeUrl(url?: string): string | undefined {
  return url?.replace(PREVIEW_ORIGIN, CANONICAL_ORIGIN)
}

function screenshotUrl(image?: SanityImage): string | null {
  if (!image?.asset) return null
  return urlForImage(image)?.width(632)?.format('webp')?.fit('crop')?.quality(80)?.url() ?? null
}

// ─── PortableText ─────────────────────────────────────────────────────────────

const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-sm leading-relaxed text-white/70 sm:text-base">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-2 space-y-1.5 text-sm text-white/70 sm:text-base">{children}</ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-center gap-2">
        <span className="size-1 shrink-0 rounded-full bg-white/70" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href ?? ''
      const isExternal = href.startsWith('http')
      return (
        <Link
          href={href}
          prefetch={false}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="dd-link"
        >
          {children}
        </Link>
      )
    },
  },
}

// ─── Screenshot ───────────────────────────────────────────────────────────────

function Screenshot({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="dd-shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        width={550}
        height={412}
        loading="lazy"
        decoding="async"
        className="dd-img"
      />
    </div>
  )
}

// ─── Accordion row ────────────────────────────────────────────────────────────

function AccordionRow({
  item,
  index,
  tabKey,
  defaultOpen,
  imageUrl,
  imageAlt,
}: {
  item: AccordionItem
  index: number
  tabKey: string
  defaultOpen: boolean
  imageUrl: string | null
  imageAlt: string
}) {
  return (
    // A shared `name` gives the rows the behaviour the old openId state had:
    // opening one closes the others, and clicking the open one closes it.
    <details
      name={`${ID}-acc-${tabKey}`}
      open={defaultOpen}
      className={`dd-item dd-i${index}`}
    >
      <summary className="dd-summary">
        <span className="dd-title">{item.title}</span>
        <span className="dd-chev" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.81104 8.28966L11.0564 14.5348C11.1818 14.6601 11.3306 14.7596 11.4944 14.8274C11.6582 14.8953 11.8337 14.9302 12.011 14.9302C12.1883 14.9302 12.3639 14.8953 12.5277 14.8274C12.6915 14.7596 12.8403 14.6601 12.9656 14.5348L19.211 8.28936"
              stroke="#13A89E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>

      <div className="dd-body">
        {/* Phone screenshot — above the copy, where it was before. It's lazy, and
            inside a closed <details> the browser doesn't fetch it at all. */}
        {imageUrl && (
          <div className="dd-shot-phone">
            <Screenshot url={imageUrl} alt={imageAlt} />
          </div>
        )}

        {item.description?.length ? (
          <PortableText value={item.description} components={ptComponents} />
        ) : null}

        {item.link?.label && (
          <Link href={item.link.url ?? '#'} prefetch={false} className="dd-cta">
            {item.link.label}
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        )}
      </div>
    </details>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function PlatformDeepDiveSection({ data }: PlatformDeepDiveSectionProps) {
  const heading = data?.heading ?? ''
  const subheading = data?.subheading
  const tabs = (data?.tabs ?? [])
    .filter((t) => t?.label && (t.items?.length ?? 0) > 0)
    .map((tab) => ({
      ...tab,
      items: tab.items?.map((item) => ({
        ...item,
        link: item.link ? { ...item.link, url: sanitizeUrl(item.link.url) } : item.link,
      })),
    }))

  if (!tabs.length) return null

  const selectTabs = tabs.map((tab, i) => ({
    key: tab._key ?? tab.label ?? `tab-${i}`,
    label: tab.label,
  }))

  return (
    <section id="features" className="bg-brand text-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 border-b border-white/20 py-12 sm:py-20 lg:py-24">

        <div className="mb-10 text-center">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-[42px] leading-[110%]">
            {heading}
          </h2>
          {subheading && (
            <p className="mx-auto mt-4 max-w-3xl text-base text-slate-400 sm:text-lg mb-6">
              {subheading}
            </p>
          )}
        </div>

        <div className="dd-root">
          {/* Mobile picker — its options are labels for the radios below. */}
          <PlatformDeepDiveTabSelect idPrefix={ID} tabs={selectTabs} />

          {/* Desktop pill bar. Each radio sits right next to its own label, so the
              active pill is a single `:checked + label` rule. */}
          <div
            role="radiogroup"
            aria-label="Platform features"
            className="mb-16 px-4 hidden lg:flex flex-nowrap justify-center items-center gap-2 rounded-full bg-white/10 py-2 max-w-7xl mx-auto"
          >
            {tabs.map((tab, i) => (
              <div key={selectTabs[i].key} className="flex flex-1">
                <input
                  type="radio"
                  name={`${ID}-tabs`}
                  id={`${ID}-t${i}`}
                  defaultChecked={i === 0}
                  className="dd-radio"
                />
                <label htmlFor={`${ID}-t${i}`} className="dd-tab">
                  {tab.label}
                </label>
              </div>
            ))}
          </div>

          {/* All panels are in the HTML; CSS shows the one whose radio is checked. */}
          {tabs.map((tab, tabIndex) => {
            const tabKey = selectTabs[tabIndex].key
            const items = tab.items ?? []
            const fallbackUrl = screenshotUrl(tab.image)
            const imageFor = (item: AccordionItem) => screenshotUrl(item.image) ?? fallbackUrl
            const altFor = (item: AccordionItem) =>
              item.image?.alt ?? tab.image?.alt ?? tab.label

            return (
              <div key={tabKey} className={`dd-panel dd-panel-${tabIndex}`}>
                <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">

                  <div className="dd-rows">
                    {items.map((item, i) => (
                      <AccordionRow
                        key={item._key ?? `item-${i}`}
                        item={item}
                        index={i}
                        tabKey={tabKey}
                        defaultOpen={i === 0}
                        imageUrl={imageFor(item)}
                        imageAlt={altFor(item)}
                      />
                    ))}
                  </div>

                  {/* One screenshot per row. `:has()` reveals the one belonging to
                      whichever row is open; the last one covers "all rows closed". */}
                  <div className="dd-shots">
                    {items.map((item, i) => {
                      const url = imageFor(item)
                      if (!url) return null
                      return (
                        <div key={item._key ?? `media-${i}`} className={`dd-media dd-m${i}`}>
                          <Screenshot url={url} alt={altFor(item)} />
                        </div>
                      )
                    })}

                    {fallbackUrl && (
                      <div className="dd-media dd-media-default">
                        <Screenshot url={fallbackUrl} alt={tab.image?.alt ?? tab.label} />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
