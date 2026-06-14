import type { PropsWithChildren } from 'react'
import Link from 'next/link'
import { ShieldCheck, FileSignature, Wallet, ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Cont verificat',
    description: 'Email și telefon confirmate prin OTP — toți utilizatorii sunt reali.',
  },
  {
    icon: FileSignature,
    title: 'Contracte semnate online',
    description: 'Semnătură electronică calificată (QES), conformă eIDAS.',
  },
  {
    icon: Wallet,
    title: 'Chirii plătite în platformă',
    description: 'Scadențe automate, istoric complet și comisioane transparente.',
  },
]

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <section className="min-h-screen bg-[var(--bg)] py-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-10 lg:px-12">
        <aside className="relative hidden flex-1 flex-col overflow-hidden rounded-[32px] bg-[var(--brand)] px-10 py-12 text-white shadow-[0_30px_80px_rgba(0,113,227,0.18)] lg:flex">
          <Link href="/" className="font-sans text-xl font-semibold tracking-wide text-white no-underline">
            Clavium<span className="text-white/70">.ro</span>
          </Link>

          <div className="mt-14 space-y-10">
            <div>
              <h1 className="text-[clamp(32px,3.4vw,44px)] font-semibold leading-tight">
                Imobiliare fără
                <br />
                intermediari.
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-white/80">
                Găsește sau listează proprietăți, negociază prin oferte și semnează contractul online — totul dintr-un singur cont.
              </p>
            </div>

            <ul className="space-y-5">
              {highlights.map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <item.icon size={18} />
                  </span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/75">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-auto pt-10 text-[12px] uppercase tracking-[0.18em] text-white/60">
            Semnătură electronică conformă eIDAS · Legea 214/2024
          </p>
        </aside>

        <div className="flex flex-1 flex-col rounded-[32px] bg-[var(--card)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" className="font-sans text-lg font-semibold tracking-wide text-[var(--text)] no-underline lg:hidden">
              Clavium<span className="text-[var(--brand)]">.ro</span>
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]"
              >
                <ArrowLeft size={15} /> Înapoi la site
              </Link>
              <ThemeToggle />
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
