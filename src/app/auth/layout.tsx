import type { PropsWithChildren } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <section className="min-h-screen bg-[var(--bg)] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-10 lg:px-12">
        <aside className="relative hidden flex-1 flex-col justify-center overflow-hidden rounded-[32px] bg-[var(--brand)] px-10 py-12 text-white shadow-[0_30px_80px_rgba(0,113,227,0.18)] lg:flex">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/90">
              Clavium.ro Auth v2
            </div>
            <div>
              <h1 className="text-[clamp(34px,3.8vw,48px)] font-semibold leading-tight">
                Autentificare sigură
                <br />
                în doar câteva secunde.
              </h1>
              <p className="mt-5 max-w-lg text-[15px] text-white/80 leading-7">
                Creați cont, conectați-vă cu parolă sau OTP și gestionați totul dintr-un singur loc. Exemplu gata de extins cu Prisma, Jose și Twilio.
              </p>
            </div>
            <div className="space-y-3 rounded-[24px] bg-white/10 p-6">
              <p className="text-[13px] uppercase tracking-[0.22em] text-white/70">Ce oferă acest demo</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Validări Zod</li>
                <li>JWT cu cookie HttpOnly</li>
                <li>OTP simulată</li>
                <li>Protecție simplă middleware</li>
              </ul>
            </div>
          </div>
          <div className="mt-auto pt-6 text-sm text-white/80">
            <p>Ai deja cont? <Link href="/auth/login" className="font-semibold text-white underline">Conectează-te</Link></p>
            <p className="mt-3">Ai nevoie de cont? <Link href="/auth/register" className="font-semibold text-white underline">Înregistrează-te</Link></p>
          </div>
        </aside>

        <div className="flex-1 rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:p-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Clavium.ro</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">Acces cont</h2>
            </div>
            <Link href="/" className="text-[13px] font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]">
              Înapoi la homepage
            </Link>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
