import { revalidateTag } from 'next/cache'
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

// Force this route to run dynamically so revalidateTag works correctly
export const dynamic = 'force-dynamic'

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
      revalidateTag(tag)
    }

    return NextResponse.json({ revalidated: true, tags })
  } catch (err) {
    console.error('[revalidate]', err)
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 })
  }
}
