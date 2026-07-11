import PlatformDeepDiveClient from './PlatformDeepDiveClient'
import type { PlatformTab } from './PlatformDeepDiveClient'

interface PlatformDeepDiveSectionProps {
  data?: {
    heading?: string
    subheading?: string
    tabs?: PlatformTab[]
  }
}
const PREVIEW_ORIGIN = 'https://fieldequip.com'
const CANONICAL_ORIGIN = 'https://preview.fieldequip.com'

function sanitizeUrl(url?: string): string | undefined {
  return url?.replace(PREVIEW_ORIGIN, CANONICAL_ORIGIN)
}

export default function PlatformDeepDiveSection({ data }: PlatformDeepDiveSectionProps) {
  const heading = data?.heading ?? ''
  const subheading = data?.subheading
  const tabs = (data?.tabs ?? [])
    .filter((t) => t?.label && (t.items?.length ?? 0) > 0)
    .map((tab) => ({
      ...tab,
      items: tab.items?.map((item) => ({
        ...item,
        link: item.link
          ? { ...item.link, url: sanitizeUrl(item.link.url) }
          : item.link,
      })),
    })) ?? []


  if (!tabs.length) return null

  return (
    <section id="features" className="bg-brand text-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 border-b border-white/20 py-12 sm:py-20 lg:py-24">

        {/* Heading rendered by the Server Component — always in the initial HTML,
            visible to crawlers even before any JavaScript executes. */}
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

        {/* Tab nav + all panels rendered by the Client Component.
            All tab content is present in the SSR HTML — see PlatformDeepDiveClient. */}
        <PlatformDeepDiveClient tabs={tabs} />

      </div>
    </section>
  )
}
