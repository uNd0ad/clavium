import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getNavUser } from '@/lib/session'
import { LAST_UPDATED, TERMS_SECTIONS } from './content'

export const metadata: Metadata = {
  title: 'Termeni și condiții — Vatrio.ro',
}

// Textul juridic (55 de secțiuni + 3 anexe) stă în ./content.ts — pagina doar îl randează.
// Literele/numerotarea punctelor fac parte din text, deci listele nu au marcatori proprii.
export default async function TermsPage() {
  const navUser = await getNavUser()
  return (
    <>
      <Navbar initialUser={navUser} />
      <main className="mx-auto min-h-screen max-w-4xl px-6 pb-24 pt-36 lg:px-12">
        <p className="section-label">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold">Termeni și condiții de utilizare Vatrio.ro</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Ultima actualizare: {LAST_UPDATED}</p>

        <nav aria-label="Cuprins" className="mt-10 rounded-xl border border-[var(--border)] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.08em]">Cuprins</p>
          <ol className="mt-4 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            {TERMS_SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-[var(--muted)] no-underline transition-colors hover:text-[var(--text)]">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-10">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.blocks.map((block, i) =>
                typeof block === 'string' ? (
                  <p key={i} className="mt-3 text-base leading-7 text-[var(--muted)]">
                    {block}
                  </p>
                ) : (
                  <ul key={i} className="mt-3 space-y-1.5 pl-5 text-base leading-7 text-[var(--muted)]">
                    {block.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
