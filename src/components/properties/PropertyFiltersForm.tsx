import type { PropertyFilters } from '@/lib/propertyQuery'

const inputClass =
  'rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-[var(--brand)]'

// Formular GET — filtrele trăiesc în URL, deci sunt shareable și SSR-friendly.
export default function PropertyFiltersForm({ filters, action }: { filters: PropertyFilters; action?: string }) {
  return (
    <form method="get" action={action} className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-2 lg:grid-cols-7">
      <input name="q" defaultValue={filters.q ?? ''} placeholder="Localitate sau titlu" className={`${inputClass} lg:col-span-2`} />
      <input name="minRent" type="number" min={0} defaultValue={filters.minRent ?? ''} placeholder="Chirie min" className={inputClass} />
      <input name="maxRent" type="number" min={0} defaultValue={filters.maxRent ?? ''} placeholder="Chirie max" className={inputClass} />
      <input name="rooms" type="number" min={1} defaultValue={filters.rooms ?? ''} placeholder="Camere min" className={inputClass} />
      <select name="sort" defaultValue={filters.sort ?? ''} className={inputClass}>
        <option value="">Cele mai noi</option>
        <option value="pret-asc">Preț crescător</option>
        <option value="pret-desc">Preț descrescător</option>
      </select>
      <button type="submit" className="btn-primary py-3 text-[13px]">
        Caută
      </button>
    </form>
  )
}
