import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

// DEV-ONLY: bust all known cache tags without needing a signed webhook.
// Remove this file before deploying to production.
export async function GET() {
  const tags = [
    'home', 'product', 'post', 'category', 'blogPage',
    'caseStudy', 'caseStudiesPage', 'page', 'legalPage',
    'legalLandingPages', 'industries', 'integrations',
    'integrationsPage', 'videoTestimonialsPage',
    'whitePapers', 'whitePapersPage', 'conversionPages',
    'settings',
  ]
  tags.forEach((tag) => revalidateTag(tag, 'max'))
  return NextResponse.json({ revalidated: true, tags })
}
