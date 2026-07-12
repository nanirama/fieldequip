import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImage } from '@/src/types/sanity-image'

import { dataset, projectId } from './api'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: SanityImage | undefined) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined
  }

  return imageBuilder?.image(source).auto('format').fit('max')
}

export function urlForOpenGraphImage(image: SanityImage | undefined) {
  return urlForImage(image)?.width(1200).height(627).fit('crop').url()
}

// Serves a Sanity image from our own origin, via the /sanity-cdn rewrite in
// next.config. Worth doing for the hero image on a page and nothing else:
// cdn.sanity.io is a second origin, so the browser pays a DNS lookup, a TCP
// connect and a TLS handshake before it can even ask for the file — around
// 700 ms on a throttled mobile connection, which lands squarely on LCP. The
// connection the document arrived on is already open, so the same bytes come
// down it with no handshake. Sanity still resizes the image; only the hostname
// the browser talks to changes.
//
// Images below the fold don't need this — by the time they're requested the
// handshake has long since happened.
export function sameOriginImage(url: string): string {
  return url.replace('https://cdn.sanity.io/images/', '/sanity-cdn/')
}

export function resolveHref(
  documentType?: string,
  slug?: string,
): string | undefined {
  switch (documentType) {
    case 'home':
      return '/'
    case 'page':
      return slug ? `/${slug}` : undefined
    case 'services':
      return slug ? `/service/${slug}` : undefined
    case 'treatments':
      return slug ? `/treatment/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}


export function slugify(text:string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove non-word characters
    .replace(/\-\-+/g, "-"); // Remove multiple dashes
}

export function getSlugUrl(linkType:string, externalLink:string, type:string, slug: string) {
  let slugPath = '/'
  if(linkType==='external'){
    slugPath = externalLink
  }
  else{
    if (type === "courses"){
      slugPath = `/glueckskurse/${slug}`
    }
    if (type === "page") slugPath = `/${slug}`
  }  
  return slugPath;
}