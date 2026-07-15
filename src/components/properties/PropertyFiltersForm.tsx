import type { PropertyFilters } from '@/lib/propertyQuery'

const inputClass =
  'rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]'

// Formular GET — filtrele trăiesc în URL, deci sunt shareable și SSR-friendly.
export default function PropertyFiltersForm({ filters, action }: { filters: PropertyFilters; action?: string }) {
  return (
    <form method="get" action={action} className="grid gap-4 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-2 lg:grid-cols-8">
      <input name="q" aria-label="Localitate sau titlu" defaultValue={filters.q ?? ''} placeholder="Localitate sau titlu" className={`${inputClass} lg:col-span-2`} />
      <select name="type" aria-label="Tip tranzacție" defaultValue={filters.type ?? ''} className={inputClass}>
        <option value="">Toate</option>
        <option value="INCHIRIERE">Închiriere</option>
        <option value="VANZARE">Vânzare</option>
      </select>
      <input name="minRent" aria-label="Preț minim" type="number" min={0} defaultValue={filters.minRent ?? ''} placeholder="Preț min" className={inputClass} />
      <input name="maxRent" aria-label="Preț maxim" type="number" min={0} defaultValue={filters.maxRent ?? ''} placeholder="Preț max" className={inputClass} />
      <input name="rooms" aria-label="Număr minim de camere" type="number" min={1} defaultValue={filters.rooms ?? ''} placeholder="Camere min" className={inputClass} />
      <select name="sort" aria-label="Sortare" defaultValue={filters.sort ?? ''} className={inputClass}>
        <option value="">Cele mai noi</option>
        <option value="pret-asc">Preț crescător</option>
        <option value="pret-desc">Preț descrescător</option>
      </select>
      <button type="submit" className="btn-primary py-3 text-sm">
        Caută
      </button>
    </form>
  )
}
