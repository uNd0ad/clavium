import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,113,227,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(0,113,227,0.12),_transparent_30%)] opacity-95" />

        <div className="page-transition relative w-full max-w-xl">
          <p className="select-none bg-gradient-to-b from-[var(--brand)] to-[var(--brand-dark)] bg-clip-text text-[clamp(110px,24vw,220px)] font-semibold leading-none tracking-[-0.05em] text-transparent">
            404
          </p>

          <div className="section-label mt-2 justify-center">Pagina nu a fost găsită</div>

          <h1 className="mt-6 text-[clamp(28px,5vw,44px)] font-semibold tracking-[-0.03em] text-[var(--text)]">
            Am pierdut firul acestei adrese
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
            Pagina pe care o cauți nu există, a fost mutată sau linkul este greșit. Hai să te ducem înapoi pe drumul cel bun.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn-primary px-8 py-4">
              <Home size={16} /> Înapoi acasă
            </Link>
            <Link href="/proprietati" className="btn-outline px-8 py-4">
              <Search size={16} /> Vezi proprietățile
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
