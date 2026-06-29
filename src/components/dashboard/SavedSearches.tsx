'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BellPlus, Search, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { saveSearchAction, deleteSavedSearchAction } from '@/app/actions/savedSearches'
import type { PropertyFilters } from '@/lib/propertyQuery'

export type SavedSearchView = { id: string; label: string; query: string }

export default function SavedSearches({ current, searches }: { current: PropertyFilters; searches: SavedSearchView[] }) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const hasCurrent = Boolean(current.q || current.type || current.minRent || current.maxRent || current.rooms || current.minSurface)

  const save = () =>
    startTransition(async () => {
      const res = await saveSearchAction(current)
      if (res.ok) {
        toast.success('Căutare salvată. Te anunțăm când apar listări noi care se potrivesc.')
        router.refresh()
      } else toast.error(res.error)
    })

  const remove = (id: string) =>
    startTransition(async () => {
      const res = await deleteSavedSearchAction(id)
      if (res.ok) {
        toast.success('Căutare ștearsă.')
        router.refresh()
      } else toast.error(res.error)
    })

  return (
    <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Căutări salvate</h2>
          <p className="text-sm text-[var(--muted)]">Primești alerte pe email când apar listări noi care se potrivesc.</p>
        </div>
        <Button type="button" variant="outline" loading={loading} disabled={!hasCurrent} onClick={save} className="px-4 py-2 text-xs">
          <BellPlus size={14} className="mr-1.5 inline" /> Salvează căutarea curentă
        </Button>
      </div>

      {searches.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {searches.map((s) => (
            <li key={s.id} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] py-1 pl-3 pr-1 text-sm">
              <Link href={`/dashboard/cauta${s.query ? `?${s.query}` : ''}`} className="flex items-center gap-1.5 text-[var(--text)]">
                <Search size={13} className="text-[var(--brand)]" /> {s.label}
              </Link>
              <button type="button" onClick={() => remove(s.id)} disabled={loading} aria-label="Șterge căutarea" className="rounded-full p-1 text-[var(--muted)] transition hover:text-[var(--danger)]">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">Nu ai căutări salvate încă.</p>
      )}
    </div>
  )
}
