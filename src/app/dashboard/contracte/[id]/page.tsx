import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { ContractActions } from '@/components/dashboard/actions'
import ContractTermsForm from '@/components/dashboard/ContractTermsForm'
import SaleTermsForm from '@/components/dashboard/SaleTermsForm'
import PrintButton from '@/components/dashboard/PrintButton'
import { getCurrentUser } from '@/lib/session'
import { getContractDetail } from '@/lib/contractDocument'

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { id } = await params
  const detail = await getContractDetail(id, user)
  if (!detail) {
    notFound()
  }

  const { doc, canEdit, canEditSale, canSign, canPay, dueAmount, dueType, terms, saleTerms } = detail
  const isSale = doc.type === 'VANZARE'

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/contracte" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
          <ArrowLeft size={15} /> Toate contractele
        </Link>
        <PrintButton />
      </div>

      <article className="print-document rounded-4xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow)]">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="section-label">{isSale ? 'Antecontract de vânzare-cumpărare' : 'Contract de închiriere'}</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{doc.number}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{doc.statusLabel} · {doc.property.title}, {doc.property.location}</p>
        </header>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[doc.owner, doc.tenant].map((party) => (
            <div key={party.role}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {party.role} · {party.kind === 'COMPANY' ? 'persoană juridică' : 'persoană fizică'}
              </p>
              <p className="mt-1 font-semibold">{party.name}</p>
              {party.lines.map((line) => (
                <p key={line} className="text-sm text-[var(--muted)]">{line}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-5 text-base leading-7 text-[var(--muted)]">
          {isSale ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">1. Obiectul antecontractului</h2>
                <p className="mt-2">
                  Vânzătorul se obligă să vândă, iar cumpărătorul să cumpere imobilul „{doc.property.title}”,
                  situat în {doc.property.location}, prin încheierea contractului de vânzare-cumpărare în formă autentică la notar.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">2. Prețul și avansul</h2>
                <p className="mt-2">
                  Prețul de vânzare este de {doc.price}. La semnarea antecontractului, cumpărătorul achită un avans (arvună)
                  de {doc.deposit}, urmând ca diferența să fie plătită la finalizarea tranzacției.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">1. Obiectul contractului</h2>
                <p className="mt-2">
                  Proprietarul închiriază chiriașului imobilul „{doc.property.title}”, situat în {doc.property.location},
                  pentru o durată de {doc.months} luni, în perioada {doc.startDate} – {doc.endDate}.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">2. Chiria și garanția</h2>
                <p className="mt-2">
                  Chiria lunară este de {doc.rent}, plătibilă până în data de {doc.dueDay} a fiecărei luni.
                  Garanția (depozitul) este de {doc.deposit} și se restituie la încetarea contractului, în condițiile legii.
                </p>
              </div>
            </>
          )}
          {doc.clauses ? (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">3. Clauze speciale</h2>
              <p className="mt-2 whitespace-pre-line">{doc.clauses}</p>
            </div>
          ) : null}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">{doc.clauses ? '4' : '3'}. Semnături electronice (QES)</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <p>{doc.owner.role}: {doc.signedByOwner ? <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"><Check size={14} strokeWidth={3} />Semnat</span> : <span className="font-semibold text-[var(--text)]">În așteptare</span>}</p>
              <p>{doc.tenant.role}: {doc.signedByClient ? <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"><Check size={14} strokeWidth={3} />Semnat</span> : <span className="font-semibold text-[var(--text)]">În așteptare</span>}</p>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
          Document generat de Clavium.ro · semnătură electronică calificată conformă eIDAS / Legea 214/2024.
        </p>
      </article>

      <div className="space-y-4 print:hidden">
        {canEdit ? <ContractTermsForm contractId={doc.id} terms={terms} /> : null}
        {canEditSale ? <SaleTermsForm contractId={doc.id} terms={saleTerms} /> : null}
        <ContractActions contractId={doc.id} canSign={canSign} canPay={canPay} dueAmount={dueAmount} dueType={dueType} />
      </div>
    </section>
  )
}
