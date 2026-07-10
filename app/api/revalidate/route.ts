import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

import { revalidateSecret } from '@/src/sanity/lib/api'

// Maps Sanity document _type → Next.js cache tags to invalidate.
// Slug-specific tags (e.g. "product:my-slug") are derived at runtime from the body.
const TAGS_BY_TYPE: Record<string, string[]> = {
  home: ['home'],
  product: ['product'],
  pages: ['page'],
  legalPages: ['legalPage'],
  legalLandingPages: ['legalLandingPages'],
  integrations: ['integrations', 'integrationsPage'],
  integrationsPage: ['integrationsPage'],
  industries: ['industries'],
  post: ['post'],
  // A category change can affect post listings
  category: ['category', 'post'],
  blogPage: ['blogPage'],
  caseStudy: ['caseStudy'],
  caseStudiesPage: ['caseStudiesPage'],
  videoTestimonials: ['videoTestimonialsPage'],
  videoTestimonialsPage: ['videoTestimonialsPage'],
  whitePapers: ['whitePapers'],
  whitePapersPage: ['whitePapersPage'],
  conversionPages: ['conversionPages'],
  // Referenced document types: invalidate every page type that embeds them
  faq: ['page', 'product', 'industries', 'integrations', 'conversionPages'],
  teamMember: ['page'],
}

// ── GET /api/revalidate?path=<slug>&secret=<SANITY_REVALIDATE_SECRET> ─────────
// Manually purge a single page by its slug or full path.
// Examples:
//   /api/revalidate?path=field-service-work-order-management&secret=xxx
//   /api/revalidate?path=/products/field-service-work-order-management/&secret=xxx
//   /api/revalidate?tag=product&secret=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const path   = searchParams.get('path')
  const tag    = searchParams.get('tag')

  if (revalidateSecret && secret !== revalidateSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  if (!path && !tag) {
    return NextResponse.json(
      { message: 'Provide ?path=<slug> and/or ?tag=<cache-tag>' },
      { status: 400 },
    )
  }

  const revalidated: string[] = []

  if (tag) {
    revalidateTag(tag, 'max')
    revalidated.push(`tag:${tag}`)
  }

  if (path) {
    // Normalise: ensure leading slash + trailing slash (trailingSlash: true)
    const normalised = `/${path.replace(/^\//, '').replace(/\/$/, '')}/`
    revalidatePath(normalised)
    revalidated.push(`path:${normalised}`)
  }

  return NextResponse.json({ revalidated: true, items: revalidated })
}

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{
      _type: string
      slug?: { current: string }
    }>(req, revalidateSecret)

    if (isValidSignature === false) {
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 401 })
    }

    if (!body?._type) {
      return NextResponse.json({ message: 'Missing _type in request body' }, { status: 400 })
    }

    const baseTags = TAGS_BY_TYPE[body._type] ?? []

    // Also bust the slug-specific tag when Sanity provides it
    const slugTag = body.slug?.current ? `${body._type}:${body.slug.current}` : null
    const tags = slugTag ? [...baseTags, slugTag] : baseTags

    if (tags.length === 0) {
      return NextResponse.json({
        revalidated: false,
        message: `No cache tags configured for document type: ${body._type}`,
      })
    }

    for (const tag of tags) {
      revalidateTag(tag, 'max')
    }

    return NextResponse.json({ revalidated: true, tags })
  } catch (err) {
    console.error('[revalidate]', err)
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 })
  }
}
