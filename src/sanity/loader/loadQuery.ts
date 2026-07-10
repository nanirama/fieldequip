import 'server-only'
import { cacheTag, cacheLife } from 'next/cache'
import { client } from '@/src/sanity/lib/client'
import {
  homeQuery,
  headerQuery,
  integrationsQuery,
  integrationsSlugsQuery,
  allIntegrationsQuery,
  integrationsPageQuery,
  blogPageQuery,
  blogPostsQuery,
  blogCategoriesQuery,
  blogPostBySlugQuery,
  blogPostSlugsQuery,
  caseStudiesQuery,
  caseStudiesAllQuery,
  caseStudiesPageQuery,
  whitePapersPageQuery,
  whitePapersListQuery,
  whitePaperBySlugQuery,
  whitePaperSlugsQuery,
  caseStudyBySlugQuery,
  caseStudySlugsQuery,
  videoTestimonialsPageQuery,
  pageQuery,
  pageSlugsQuery,
  legalPageQuery,
  legalPageSlugsQuery,
  legalLandingPageQuery,
  legalLandingPageSlugsQuery,
  industriesQuery,
  industriesSlugsQuery,
  allIndustriesQuery,
  productQuery,
  productSlugsQuery,
  allProductsQuery,
  conversionPagesQuery,
  conversionPagesSlugsQuery,
  settingsQuery,
  allFaqsQuery,
  slugTypeQuery,
} from '@/src/sanity/lib/queries'
import type { CaseStudyListDocument } from '@/src/sanity/lib/mapCaseStudiesForSection'

// ── Core cache function ───────────────────────────────────────────────────────

async function cachedFetch(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
): Promise<unknown> {
  'use cache'
  cacheTag(...tags)
  cacheLife({ stale: 86400, revalidate: 3600, expire: 604800 })
  return client.fetch(query, params)
}

async function cached(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
): Promise<{ data: unknown }> {
  const data = await cachedFetch(query, params, tags)
  return { data }
}

// ── Public loaders ────────────────────────────────────────────────────────────

export const loadHome = () =>
  cached(homeQuery, {}, ['home'])

export const loadAllFaqs = () =>
  cached(allFaqsQuery, {}, ['faqs'])

export const loadHeader = () =>
  cached(headerQuery, {}, ['settings'])

export const loadSettings = () =>
  cached(settingsQuery, {}, ['settings'])

// Tiny discriminator — call this first to find which _type owns the slug,
// then call the matching full loader. Tagged with every slug-specific cache tag
// so any content change at this slug invalidates the discriminator too.
export const loadSlugType = (slug: string) =>
  cached(slugTypeQuery, { slug }, [
    `product:${slug}`,
    `page:${slug}`,
    `legalPage:${slug}`,
    `post:${slug}`,
    `industries:${slug}`,
    `conversionPages:${slug}`,
  ])

export const loadProduct = (slug: string) =>
  cached(productQuery, { slug }, ['product', `product:${slug}`])

export const loadProductSlugs = () =>
  client.fetch(productSlugsQuery, {})

export const loadPage = (slug: string) =>
  cached(pageQuery, { slug }, ['page', `page:${slug}`])

export const loadPageSlugs = () =>
  client.fetch(pageSlugsQuery, {})

export const loadLegalPage = (slug: string) =>
  cached(legalPageQuery, { slug }, ['legalPage', `legalPage:${slug}`])

export const loadLegalPageSlugs = () =>
  client.fetch(legalPageSlugsQuery, {})

export const loadLegalLandingPage = (slug: string) =>
  cached(legalLandingPageQuery, { slug }, ['legalLandingPages', `legalLandingPages:${slug}`])

export const loadLegalLandingPageSlugs = () =>
  client.fetch(legalLandingPageSlugsQuery, {})

export const loadIndustry = (slug: string) =>
  cached(industriesQuery, { slug }, ['industries', `industries:${slug}`])

export const loadIndustrySlugs = () =>
  client.fetch(industriesSlugsQuery, {})

export const loadAllIndustries = () =>
  cached(allIndustriesQuery, {}, ['industries'])

export const loadIntegrationsPage = () =>
  cached(integrationsPageQuery, {}, ['integrationsPage'])

export const loadIntegration = (slug: string) =>
  cached(integrationsQuery, { slug }, ['integrations', `integrations:${slug}`])

export const loadIntegrationSlugs = () =>
  client.fetch(integrationsSlugsQuery, {})

export const loadAllIntegrations = () =>
  cached(allIntegrationsQuery, {}, ['integrations'])

export const loadVideoTestimonialsPage = () =>
  cached(videoTestimonialsPageQuery, {}, ['videoTestimonialsPage'])

export const loadBlogPage = () =>
  cached(blogPageQuery, {}, ['blogPage'])

export const loadCaseStudiesPage = () =>
  cached(caseStudiesPageQuery, {}, ['caseStudiesPage'])

export const loadWhitePapersPage = () =>
  cached(whitePapersPageQuery, {}, ['whitePapersPage'])

export const loadWhitePapersList = () =>
  cached(whitePapersListQuery, {}, ['whitePapers'])

export const loadWhitePaper = (slug: string) =>
  cached(whitePaperBySlugQuery, { slug }, ['whitePapers', `whitePapers:${slug}`])

export const loadWhitePaperSlugs = () =>
  client.fetch(whitePaperSlugsQuery, {})

export const loadCaseStudies = () =>
  cached(caseStudiesQuery, {}, ['caseStudy'])

export const loadCaseStudiesall = () =>
  cached(caseStudiesAllQuery, {}, ['caseStudy'])

export async function getAllCaseStudies(): Promise<CaseStudyListDocument[]> {
  const { data } = await loadCaseStudies()
  return (data as CaseStudyListDocument[] | null | undefined) ?? []
}

export const loadCaseStudy = (slug: string) =>
  cached(caseStudyBySlugQuery, { slug }, ['caseStudy', `caseStudy:${slug}`])

export const loadCaseStudySlugs = () =>
  client.fetch(caseStudySlugsQuery, {})

export const loadBlogPosts = () =>
  cached(blogPostsQuery, {}, ['post'])

export const loadBlogCategories = () =>
  cached(blogCategoriesQuery, {}, ['category'])

export const loadBlogPost = (slug: string) =>
  cached(blogPostBySlugQuery, { slug }, ['post', `post:${slug}`])

export const loadPostSlugs = () =>
  client.fetch(blogPostSlugsQuery, {})

export const loadConversionPage = (slug: string) =>
  cached(conversionPagesQuery, { slug }, ['conversionPages', `conversionPages:${slug}`])

export const loadConversionPageSlugs = () =>
  client.fetch(conversionPagesSlugsQuery, {})

export const loadAllProducts = () =>
  cached(allProductsQuery, {}, ['product'])