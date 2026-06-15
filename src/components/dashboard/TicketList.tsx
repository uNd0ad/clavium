'use client'

import { useMemo, useState } from 'react'
import TicketCard from './TicketCard'
import EmptyState from './EmptyState'
import type { TicketView } from '@/lib/dashboardData'

const STATUS_FILTERS = [
  { value: 'TOATE', label: 'Toate' },
  { value: 'DESCHIS', label: 'Deschise' },
  { value: 'IN_LUCRU', label: 'În lucru' },
  { value: 'REZOLVAT', label: 'Rezolvate' },
  { value: 'INCHIS', label: 'Închise' },
]

const SORTS = [
  { value: 'activitate', label: 'Activitate recentă' },
  { value: 'prioritate', label: 'Prioritate' },
]

// Ordinea priorităților pentru sortare: urgente întâi.
const PRIORITY_RANK: Record<string, number> = { URGENTA: 0, NORMALA: 1, SCAZUTA: 2 }

const controlClass =
  'rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--brand)]'

// Filtrare după status și sortare (activitate sau prioritate) pe lista deja încărcată de pe server.
export default function TicketList({ tickets }: { tickets: TicketView[] }) {
  const [status, setStatus] = useState('TOATE')
  const [sort, setSort] = useState('activitate')

  const visible = useMemo(() => {
    const filtered = status === 'TOATE' ? tickets : tickets.filter((ticket) => ticket.statusCode === status)
    if (sort === 'prioritate') {
      // Copie nouă: lista vine deja sortată după activitate (updatedAt desc), păstrăm asta ca departajare.
      return [...filtered].sort(
        (a, b) => (PRIORITY_RANK[a.priorityCode] ?? 9) - (PRIORITY_RANK[b.priorityCode] ?? 9)
      )
    }
    return filtered
  }, [tickets, status, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)]">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={controlClass}>
            {STATUS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)]">
          Sortează
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={controlClass}>
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState message="Niciun tichet nu se potrivește cu filtrul ales." />
      ) : (
        <div className="space-y-4">
          {visible.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
