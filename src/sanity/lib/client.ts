import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/src/sanity/lib/api'

const isProd = process.env.NODE_ENV === 'production'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: false, // ← completely disabled, no studioUrl needed
  maxRetries: 5, // Mitigate UND_ERR_SOCKET API timeouts during build
})