import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="section-label">Eroare 404</p>
      <h1 className="mt-6 text-4xl font-semibold">Pagina nu a fost găsită</h1>
      <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--muted)]">
        Pagina pe care o cauți nu există sau a fost mutată.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary px-8 py-4 text-[13px]">Înapoi acasă</Link>
        <Link href="/proprietati" className="btn-outline px-8 py-4 text-[13px]">Vezi proprietățile</Link>
      </div>
    </main>
  )
}
