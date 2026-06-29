'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { sanitizeFilters, MAX_SAVED_SEARCHES } from '@/lib/savedSearches'
import type { PropertyFilters } from '@/lib/propertyQuery'

// Salvează căutarea curentă (filtre) pentru a primi alerte la listări noi care se potrivesc.
export async function saveSearchAction(filters: Partial<PropertyFilters>, name?: string) {
  try {
    const user = await requireActionUser()
    const count = await prisma.savedSearch.count({ where: { userId: user.id } })
    if (count >= MAX_SAVED_SEARCHES) {
      return { ok: false as const, error: `Poți salva maximum ${MAX_SAVED_SEARCHES} căutări.` }
    }
    const clean = sanitizeFilters(filters)
    const search = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: name?.trim()?.slice(0, 80) || null,
        filters: JSON.stringify(clean),
        // Alertăm doar listările apărute DUPĂ salvare.
        lastNotifiedAt: new Date(),
      },
    })
    revalidatePath('/dashboard/cauta')
    return { ok: true as const, id: search.id }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function deleteSavedSearchAction(id: string) {
  try {
    const user = await requireActionUser()
    const res = await prisma.savedSearch.deleteMany({ where: { id, userId: user.id } })
    if (res.count === 0) return { ok: false as const, error: 'Căutarea nu există.' }
    revalidatePath('/dashboard/cauta')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
