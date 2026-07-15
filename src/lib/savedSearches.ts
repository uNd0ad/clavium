// Căutări salvate + alerte pe listări noi care se potrivesc. Filtrele se păstrează ca JSON și se
// re-aplică periodic (cron) pe listările apărute de la ultima notificare.
import { prisma } from './prisma'
import { notify } from './notify'
import { sendEmail } from './email'
import { logger } from './logger'
import { buildPropertyWhere, type PropertyFilters } from './propertyQuery'
import { APP_URL } from './constants'

export const MAX_SAVED_SEARCHES = 20

// Doar câmpurile de filtrare relevante (nu și sortarea); ignoră valorile goale.
export function sanitizeFilters(input: Partial<PropertyFilters>): PropertyFilters {
  const out: PropertyFilters = {}
  if (input.q && input.q.trim()) out.q = input.q.trim().slice(0, 120)
  if (input.type === 'VANZARE' || input.type === 'INCHIRIERE') out.type = input.type
  for (const key of ['minRent', 'maxRent', 'rooms', 'minSurface'] as const) {
    const v = input[key]
    if (v && Number(v) > 0) out[key] = String(Number(v))
  }
  return out
}

// Etichetă lizibilă a unei căutări salvate (pentru listă / alertă) când nu are nume.
export function describeFilters(filters: PropertyFilters): string {
  const parts: string[] = []
  if (filters.type) parts.push(filters.type === 'VANZARE' ? 'De vânzare' : 'De închiriat')
  if (filters.q) parts.push(`„${filters.q}”`)
  if (filters.rooms) parts.push(`${filters.rooms}+ camere`)
  if (filters.minRent || filters.maxRent) parts.push(`${filters.minRent ?? '0'}–${filters.maxRent ?? '∞'} RON`)
  if (filters.minSurface) parts.push(`${filters.minSurface}+ m²`)
  return parts.length ? parts.join(' · ') : 'Toate proprietățile'
}

function parseFilters(raw: string): PropertyFilters {
  try {
    return sanitizeFilters(JSON.parse(raw))
  } catch {
    return {}
  }
}

// Procesează toate căutările salvate și notifică listările noi (DISPONIBILA) apărute de la ultima
// alertă, care se potrivesc cu filtrele și nu aparțin căutătorului. Idempotent prin `lastNotifiedAt`.
export async function processSavedSearchAlerts(now: Date = new Date()) {
  const searches = await prisma.savedSearch.findMany({ include: { user: true } })

  let alerted = 0
  let matchedTotal = 0
  for (const search of searches) {
    const filters = parseFilters(search.filters)
    const since = search.lastNotifiedAt ?? search.createdAt
    try {
      const matches = await prisma.property.findMany({
        where: {
          status: 'DISPONIBILA',
          createdAt: { gt: since },
          ownerId: { not: search.userId },
          ...buildPropertyWhere(filters),
        },
        select: { id: true, title: true, location: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      if (matches.length > 0) {
        const label = search.name || describeFilters(filters)
        await notify(
          search.userId,
          'Listări noi pentru căutarea ta',
          `${matches.length} ${matches.length === 1 ? 'listare nouă' : 'listări noi'} pentru „${label}”.`,
          'info'
        )
        try {
          const lines = matches.map((m) => `• ${m.title} — ${m.location}: ${APP_URL}/proprietati/${m.id}`).join('\n')
          await sendEmail(
            search.user.email,
            'Listări noi pe Vatrio pentru căutarea ta',
            `Bună, ${search.user.firstName},\n\nAm găsit ${matches.length} listări noi pentru „${label}”:\n\n${lines}\n\nVezi toate: ${APP_URL}/proprietati`
          )
        } catch (err) {
          logger.warn('saved-search: email eșuat', { searchId: search.id, error: (err as Error).message })
        }
        alerted += 1
        matchedTotal += matches.length
      }
      await prisma.savedSearch.update({ where: { id: search.id }, data: { lastNotifiedAt: now } })
    } catch (err) {
      logger.error('saved-search: procesare eșuată', { searchId: search.id, error: (err as Error).message })
    }
  }
  return { alerted, matched: matchedTotal }
}
