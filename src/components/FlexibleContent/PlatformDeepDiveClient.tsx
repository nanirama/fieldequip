'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import { urlForImage } from '@/src/sanity/lib/utils'

// ─── Types (exported so the Server Component can reference them) ──────────────

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
          className="text-teal-400 underline underline-offset-2 hover:text-teal-300 transition-colors"
        >
          {children}
        </Link>
      )
    },
  },
}

// ─── Accordion Row ────────────────────────────────────────────────────────────

function AccordionRow({
  item,
  isOpen,
  onToggle,
  isActive,
  imageUrl,
  displayImage,
  blurImageUrl,
  label
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void,
  isActive: boolean,
  imageUrl?: string | null,
  displayImage: any | null,
  blurImageUrl?: string | null,
  label?: string
}) {
  const href: string = item?.link?.url ?? ''
  return (
    <div className="border-b border-slate-700/60 last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <span
          className={`text-base font-bold transition-colors sm:text-lg ${
            isOpen ? 'text-white' : 'text-slate-300'
          }`}
        >
          {item.title}
        </span>
        <span
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={`size-5 ${isOpen ? 'text-teal-400' : 'text-slate-500'}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.81104 8.28966L11.0564 14.5348C11.1818 14.6601 11.3306 14.7596 11.4944 14.8274C11.6582 14.8953 11.8337 14.9302 12.011 14.9302C12.1883 14.9302 12.3639 14.8953 12.5277 14.8274C12.6915 14.7596 12.8403 14.6601 12.9656 14.5348L19.211 8.28936"
              stroke="#13A89E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/*
        * grid-rows-[0fr] collapses height to zero but keeps the text in the
        * DOM, so all accordion descriptions are present in the HTML that
        * Google crawls even when the item is closed.
        */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 pb-5">
            <div className="block mb:hidden">
            {isActive && imageUrl && (
                <div className="block sm:hidden relative order-first lg:order-last my-2">
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      key={imageUrl}
                      src={imageUrl}
                      alt={displayImage ?? label}
                      width={550}
                      height={412}
                      placeholder={blurImageUrl ? 'blur' : 'empty'}
                      blurDataURL={blurImageUrl || undefined}
                      className="h-auto w-full object-cover animate-fade-in block md:hidden"
                      quality={80}
                      sizes="(max-width: 1024px) 100vw, 550px"
                    />
                  </div>
                </div>
              )}
              </div>
            {item.description?.length ? (
              <PortableText value={item.description} components={ptComponents} />
            ) : null}
            {item.link?.label && (
              <Link
                href={href ?? '#'}
                prefetch={false}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-400 underline-offset-2 transition-colors hover:text-teal-300 hover:underline"
              >
                {item.link.label}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            )}
            

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Client Shell ─────────────────────────────────────────────────────────────

export default function PlatformDeepDiveClient({ tabs }: { tabs: PlatformTab[] }) {
  const firstKey = tabs[0]?._key ?? tabs[0]?.label ?? ''
  const [activeTab, setActiveTab] = useState(firstKey)
  const [openItems, setOpenItems] = useState<Record<string, string>>({})
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Scroll to the parent <section id="features"> when this component mounts
  // and the URL contains #features. Runs at mount time so the element is
  // guaranteed to be in the DOM — avoids the timing race in layout-level handlers.
  useEffect(() => {
    if (window.location.hash !== '#features') return;
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [])

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  const activeTabLabel = tabs.find((t) => (t._key ?? t.label) === activeTab)?.label ?? ''

  const toggleItem = (tabKey: string, itemKey: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [tabKey]: prev[tabKey] === itemKey ? '' : itemKey,
    }))
  }

  return (
    <>
      {/* ── Tab Nav ───────────────────────────────────────────────────────── */}

      {/* Mobile / Tablet: custom dropdown */}
      <div ref={dropdownRef} className="relative mb-8 px-4 max-w-xs mx-auto lg:hidden">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-label="Platform features"
          onClick={() => setDropdownOpen((o) => !o)}
          className={[
            'flex w-full items-center justify-between rounded-2xl border px-5 py-3.5 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500',
            dropdownOpen
              ? 'border-teal-500/60 bg-white/15'
              : 'border-white/20 bg-white/10 hover:bg-white/15',
          ].join(' ')}
        >
          <span>{activeTabLabel}</span>
          <svg
            className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <ul
            role="listbox"
            aria-label="Platform features"
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-md"
          >
            {tabs.map((tab, i) => {
              const key = tab._key ?? tab.label
              const isActive = activeTab === key
              const isLast = i === tabs.length - 1
              return (
                <li
                  key={key}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { setActiveTab(key); setDropdownOpen(false) }}
                  className={[
                    'flex cursor-pointer items-center justify-between px-5 py-3.5 text-sm font-medium transition-colors',
                    !isLast && 'border-b border-white/5',
                    isActive
                      ? 'bg-teal-500/15 text-teal-400'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  ].filter(Boolean).join(' ')}
                >
                  {tab.label}
                  {isActive && (
                    <svg className="h-4 w-4 flex-shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Desktop: pill tab bar */}
      <div
        role="tablist"
        aria-label="Platform features"
        className="mb-16 px-4 hidden lg:flex flex-nowrap justify-center items-center gap-2 rounded-full bg-white/10 py-2 max-w-7xl mx-auto"
      >
        {tabs.map((tab) => {
          const key = tab._key ?? tab.label
          const isActive = activeTab === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${key}`}
              id={`tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={[
                'flex-1 cursor-pointer whitespace-nowrap px-4 py-2 text-center text-sm font-medium outline-none transition-all lg:text-base',
                isActive
                  ? 'rounded-full bg-teal-500 text-white shadow-md shadow-teal-900/40'
                  : 'rounded-xl text-slate-400 hover:text-white',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/*
        * ── Tab Panels ────────────────────────────────────────────────────────
        * ALL panels are rendered on every pass so every tab's accordion titles
        * and descriptions are present in the initial HTML. Inactive panels are
        * hidden with the HTML `hidden` attribute (display:none) which Google
        * still indexes. Previously `return null` removed non-active panels from
        * the DOM entirely, making their content invisible to crawlers.
        *
        * Images are only rendered for the active panel to avoid eager loading
        * of off-screen screenshots.
        */}
      {tabs.map((tab) => {
        const tabKey = tab._key ?? tab.label
        const isActive = activeTab === tabKey
        const defaultOpenKey = tab.items?.[0]?._key ?? 'item-0'
        const activeKey = openItems[tabKey] ?? defaultOpenKey

        // Image computation is skipped for inactive panels (no eager network requests).
        const activeItem = isActive
          ? (tab.items ?? []).find((item, idx) => (item._key ?? `item-${idx}`) === activeKey)
          : undefined
        const displayImage = activeItem?.image?.asset ? activeItem.image : (isActive ? tab.image : undefined)

        const imageUrl =
          isActive
            ? (displayImage &&
                urlForImage(displayImage)
                  ?.width(632)
                  ?.format('webp')
                  ?.fit('crop')
                  ?.quality(80)
                  ?.url()) || '/images/placeholder.png'
            : null

        const blurImageUrl =
          isActive && displayImage
            ? urlForImage(displayImage)
                ?.height(9)
                ?.width(22)
                ?.blur(20)
                ?.format('webp')
                ?.fit('crop')
                ?.url()
            : null

        return (
          <div
            key={tabKey}
            id={`tabpanel-${tabKey}`}
            role="tabpanel"
            aria-labelledby={`tab-${tabKey}`}
            hidden={!isActive}
          >
            <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">

              {/* Accordion — all items always in DOM regardless of active state */}
              <div className="flex flex-col divide-y divide-slate-700/60 rounded-2xl py-2 px-4">
                {(tab.items ?? []).map((item, idx) => {
                  const itemKey = item._key ?? `item-${idx}`
                  return (
                    <AccordionRow
                      key={itemKey}
                      item={item}
                      isOpen={activeKey === itemKey}
                      onToggle={() => toggleItem(tabKey, itemKey)}
                      isActive={isActive}
                      imageUrl={imageUrl}
                      displayImage={displayImage?.alt}
                      blurImageUrl={blurImageUrl}
                      label={tab.label}
                    />
                  )
                })}
              </div>

              {/* Screenshot — only rendered for the active panel */}
              {isActive && imageUrl && (
                <div className="md:block hidden relative order-first lg:order-last">
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image
                      key={imageUrl}
                      src={imageUrl}
                      alt={displayImage?.alt ?? tab.label}
                      width={550}
                      height={412}
                      placeholder={blurImageUrl ? 'blur' : 'empty'}
                      blurDataURL={blurImageUrl || undefined}
                      className="h-auto w-full object-cover animate-fade-in"
                      quality={80}
                      sizes="(max-width: 1024px) 100vw, 550px"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        )
      })}
    </>
  )
}
