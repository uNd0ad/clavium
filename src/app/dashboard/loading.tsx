export default function DashboardLoading() {
  return (
    <section className="space-y-8" aria-busy="true" aria-label="Se încarcă">
      <div className="h-10 w-72 animate-pulse rounded-full bg-[var(--border)]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[32px] bg-[var(--border)]/60" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-[32px] bg-[var(--border)]/40" />
    </section>
  )
}
