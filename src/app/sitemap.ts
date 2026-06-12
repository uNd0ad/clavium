import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: { status: 'DISPONIBILA' },
    select: { id: true, updatedAt: true },
    take: 1000,
  })

  return [
    { url: APP_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/proprietati`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/auth/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${APP_URL}/auth/register`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/termeni`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${APP_URL}/confidentialitate`, changeFrequency: 'yearly', priority: 0.2 },
    ...properties.map((property) => ({
      url: `${APP_URL}/proprietati/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
