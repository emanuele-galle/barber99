import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = 'https://barber99.it'

// Force dynamic rendering so Payload can query the DB at runtime
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/prenota`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/servizi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/termini`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Add dynamic service pages
  try {
    const payload = await getPayload({ config })
    const services = await payload.find({
      collection: 'services',
      where: { active: { equals: true } },
      limit: 100,
    })

    for (const service of services.docs) {
      entries.push({
        url: `${BASE_URL}/servizi/${service.slug}`,
        lastModified: new Date(service.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch {
    // Fallback: static service slugs if DB unreachable
    const fallbackSlugs = ['taglio', 'meches', 'barba', 'taglio-barba', 'taglio-meches', 'taglio-barba-meches']
    for (const slug of fallbackSlugs) {
      entries.push({
        url: `${BASE_URL}/servizi/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return entries
}
