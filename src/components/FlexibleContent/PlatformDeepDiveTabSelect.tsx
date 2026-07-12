'use client'

import { useState, useRef, useEffect } from 'react'

// Mobile/tablet tab picker.
//
// The tabs themselves are plain radio inputs rendered by the Server Component,
// and every option here is just a <label> pointing at one of them — so picking a
// tab needs no JavaScript. All this component does is open and close the
// dropdown, which is why it stays this small: the panels, the accordion rows and
// the screenshots are server markup and never hydrate.

interface Props {
  idPrefix: string
  tabs: { key: string; label: string }[]
}

export default function PlatformDeepDiveTabSelect({ idPrefix, tabs }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative mb-8 px-4 max-w-xs mx-auto lg:hidden">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Platform features"
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex w-full items-center justify-between rounded-2xl border px-5 py-3.5 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500',
          open
            ? 'border-teal-500/60 bg-white/15'
            : 'border-white/20 bg-white/10 hover:bg-white/15',
        ].join(' ')}
      >
        {/* Every label is in the markup; CSS shows the one whose radio is checked. */}
        <span>
          {tabs.map((tab, i) => (
            <span key={tab.key} className={`dd-cur dd-cur-${i}`}>
              {tab.label}
            </span>
          ))}
        </span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-md">
          {tabs.map((tab, i) => (
            <li key={tab.key} className={`dd-opt dd-opt-${i}`}>
              <label
                htmlFor={`${idPrefix}-t${i}`}
                onClick={() => setOpen(false)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-3.5 text-sm font-medium"
              >
                {tab.label}
                <svg
                  className="dd-check h-4 w-4 flex-shrink-0 text-teal-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
