'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

interface FaqItem {
  _id: string
  question?: string
  answer?: PortableTextBlock[]
}

export interface BlogFaqSectionProps {
  title?: string
  faqs?: FaqItem[]
}

const answerComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-sm leading-relaxed text-[#374151] sm:text-base">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-2 space-y-1 text-sm text-[#374151] sm:text-base">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-[#374151] sm:text-base">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-start gap-2">
        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#14B8A6]" />
        <span>{children}</span>
      </li>
    ),
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[#020210]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? ''
      const external = /^https?:\/\//i.test(href)
      return (
        <Link
          href={href}
          className="text-[#14B8A6] underline underline-offset-2 hover:text-teal-600 transition-colors"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </Link>
      )
    },
  },
}

function FaqAccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FaqItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#14B8A6]"
      >
        <span
          className={`font-manrope text-sm font-semibold leading-snug transition-colors sm:text-base ${
            isOpen ? 'text-[#14B8A6]' : 'text-[#020210]'
          }`}
        >
          {faq.question}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#14B8A6]' : 'text-slate-400'}`}
        >
          <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.75 0.750113L6.9954 6.99521C7.12076 7.12057 7.26958 7.22002 7.43337 7.28786C7.59716 7.35571 7.77271 7.39062 7.95 7.39062C8.12728 7.39062 8.30283 7.35571 8.46663 7.28786C8.63042 7.22002 8.77924 7.12057 8.9046 6.99521L15.15 0.749813"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1">
            {faq.answer?.length ? (
              <PortableText value={faq.answer} components={answerComponents} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BlogFaqSection({ title, faqs }: BlogFaqSectionProps) {
  const items = (faqs ?? []).filter((f) => f?._id && f?.question)
  const [openId, setOpenId] = useState<string | null>(items[0]?._id ?? null)

  if (!items.length) return null

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <div className="my-10">
      {title && (
        <h2 className="mb-6 font-manrope text-2xl font-semibold tracking-tight text-[#020210] sm:text-3xl">
          {title}
        </h2>
      )}
      <div className="divide-y divide-slate-300 rounded-xl border border-slate-300 overflow-hidden">
        {items.map((faq) => (
          <FaqAccordionItem
            key={faq._id}
            faq={faq}
            isOpen={openId === faq._id}
            onToggle={() => toggle(faq._id)}
          />
        ))}
      </div>
    </div>
  )
}
