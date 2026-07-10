import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import type { CSSProperties } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatItem {
  _key?: string
  value?: string
  label?: string
}

interface PreviewPanel {
  label?: string
  stats?: StatItem[]
  footnote?: string
}

interface RoiPreviewSectionData {
  eyebrow?: string
  headline?: string
  description?: PortableTextBlock[]
  cta?: { label?: string; href?: string }
  trustNote?: string
  previewPanel?: PreviewPanel
}

// ─── Performance ──────────────────────────────────────────────────────────────

const SECTION_STYLE: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicBlockSize: 'auto 560px',
}

// ─── PortableText ─────────────────────────────────────────────────────────────

const descComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-white/65 text-base leading-relaxed [&+p]:mt-3">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className="underline underline-offset-2 text-[#13A89E] hover:text-[#0bd4c8] transition-colors"
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0 opacity-50"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

// Rotating stat icons — clock, dollar-sign, zap, calendar (cycles by index)
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ClipboardDollarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <path d="M9.5 13.5a2.5 2.5 0 0 0 5 0c0-1.38-2.5-2-2.5-2s-2.5.62-2.5 2a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

function RocketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

const STAT_ICONS = [ClockIcon, ClipboardDollarIcon, RocketIcon, CalendarIcon, TrendIcon, ClockIcon]

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanelCard({ panel }: { panel: PreviewPanel }) {
  const { label, stats, footnote } = panel

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#102240' }}
      role="complementary"
      aria-label={label ?? 'ROI preview report'}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
          {label ?? 'A Preview of Your Report'}
        </p>
      </div>

      {/* Stats — vertical list */}
      {stats && stats.length > 0 && (
        <ul role="list">
          {stats.map((stat, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length]
            const isLast = i === stats.length - 1
            return (
              <li
                key={stat._key ?? i}
                className={`flex items-center justify-between gap-4 px-5 py-5${
                  isLast ? '' : ' border-b'
                }`}
                style={isLast ? undefined : { borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {/* Value + label */}
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none text-white sm:text-[28px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-white/50">
                    {stat.label}
                  </p>
                </div>

                {/* Icon badge */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#13A89E]"
                  style={{ backgroundColor: 'rgba(19,168,158,0.12)' }}
                  aria-hidden="true"
                >
                  <Icon />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Footnote */}
      {footnote && (
        <div
          className="border-t px-5 py-3"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs text-white/35">{footnote}</p>
        </div>
      )}
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function RoiPreviewSection({
  data,
}: {
  data?: RoiPreviewSectionData
}) {
  if (!data) return null

  const { eyebrow, headline, description, cta, trustNote, previewPanel } = data

  return (
    <section
      style={SECTION_STYLE}
      className="bg-brand w-full py-14 sm:py-20 lg:py-24"
      aria-label={headline ?? 'ROI preview'}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 7 + 5 column grid on desktop */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">

          {/* ── Left col (7/12) ── */}
          <div className="lg:col-span-7 min-w-0">

            {eyebrow && (
              <p className="mb-4 text-sm font-semibold text-[#13A89E]">
                {eyebrow}
              </p>
            )}

            {headline && (
              <h2 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
                {headline}
              </h2>
            )}

            {description && description.length > 0 && (
              <div className="mb-8 max-w-lg">
                <PortableText value={description} components={descComponents} />
              </div>
            )}

            {/* CTA */}
            {cta?.href && (
              <div className="flex flex-col items-start gap-3.5">
                <a
                  href={cta.href}
                  className="inline-flex items-center gap-2 hover:bg-transparent rounded-full border border-[#13A89E] px-6 py-3 text-sm font-semibold hover:text-[#13A89E] transition-colors duration-200 bg-[#13A89E] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13A89E]"
                >
                  {cta.label ?? 'Open the ROI calculator'}
                  <ArrowRightIcon />
                </a>

                {trustNote && (
                  <p className="flex items-center gap-1.5 text-xs text-white/45">
                    <InfoIcon />
                    <span>{trustNote}</span>
                  </p>
                )}
              </div>
            )}

            {/* Trust note without CTA */}
            {!cta?.href && trustNote && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-white/45">
                <InfoIcon />
                <span>{trustNote}</span>
              </p>
            )}
          </div>

          {/* ── Right col (5/12) ── */}
          {previewPanel && (
            <div className="lg:col-span-5 w-full">
              <PreviewPanelCard panel={previewPanel} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
