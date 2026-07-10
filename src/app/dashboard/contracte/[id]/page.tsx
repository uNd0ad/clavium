import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Check, Download } from 'lucide-react'
import { ContractActions } from '@/components/dashboard/actions'
import ContractTermsForm from '@/components/dashboard/ContractTermsForm'
import SaleTermsForm from '@/components/dashboard/SaleTermsForm'
import PrintButton from '@/components/dashboard/PrintButton'
import { DepositReturnForm, CancelSaleButton, TerminateButton, RenewForm } from '@/components/dashboard/ContractCloseActions'
import AutopayToggle from '@/components/dashboard/AutopayToggle'
import Stars from '@/components/dashboard/Stars'
import ReviewForm from '@/components/dashboard/ReviewForm'
import { getCurrentUser } from '@/lib/session'
import { getContractDetail } from '@/lib/contractDocument'
import { renderContractSections } from '@/lib/contractTemplate'
import { getAuditTrail } from '@/lib/audit'
import { canReview, getContractReviews } from '@/lib/reviews'
import { prisma } from '@/lib/prisma'

const AUDIT_LABEL: Record<string, string> = {
  CONTRACT_SIGNED: 'Contract semnat',
  CONTRACT_ACTIVATED: 'Contract activat',
  CONTRACT_TERMINATED: 'Contract reziliat',
  CONTRACT_RENEWED: 'Contract reînnoit',
  SALE_CANCELLED: 'Antecontract anulat',
  TERMS_CHANGED: 'Termeni modificați',
  PAYMENT_SETTLED: 'Plată confirmată',
  DEPOSIT_RETURNED: 'Garanție restituită',
}

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

  const { doc, canEdit, canEditSale, canSign, documentHash, canPay, dueAmount, dueType, terms, saleTerms, canReturnDeposit, canCancelSale, canTerminate, canRenew, depositAmount, canAutopay, autopayEnabled } = detail
  const isSale = doc.type === 'VANZARE'
  // Clauzele contractului, din șablonul editabil (config/contracts) — aceeași sursă ca PDF-ul.
  const sections = renderContractSections(doc)
  const [auditTrail, reviewEligibility, reviews] = await Promise.all([
    getAuditTrail('CONTRACT', doc.id),
    canReview(doc.id, user.id),
    getContractReviews(doc.id),
  ])
  const auditFmt = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  // Numele părții de evaluat (cealaltă parte) pentru formularul de recenzie.
  let reviewSubjectName = ''
  if (reviewEligibility.ok && reviewEligibility.subjectId) {
    const subject = await prisma.user.findUnique({ where: { id: reviewEligibility.subjectId }, select: { firstName: true, lastName: true } })
    reviewSubjectName = subject ? `${subject.firstName} ${subject.lastName}` : 'cealaltă parte'
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/contracte" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
          <ArrowLeft size={15} /> Toate contractele
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/api/contracte/${doc.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline px-5 py-2.5 text-xs"
          >
            <Download size={15} /> Descarcă PDF
          </a>
          <PrintButton />
        </div>
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
          {/* Clauzele vin din șablonul editabil config/contracts/<tip>.md — aceeași sursă ca PDF-ul. */}
          {sections.map((section, index) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold text-[var(--text)]">{index + 1}. {section.heading}</h2>
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="mt-2">{paragraph}</p>
              ))}
            </div>
          ))}
          {doc.clauses ? (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">{sections.length + 1}. Clauze speciale</h2>
              <p className="mt-2 whitespace-pre-line">{doc.clauses}</p>
            </div>
          ) : null}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">{doc.clauses ? sections.length + 2 : sections.length + 1}. Semnături electronice (QES)</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {([
                { party: doc.owner, signed: doc.signedByOwner, role: 'OWNER' as const },
                { party: doc.tenant, signed: doc.signedByClient, role: 'CLIENT' as const },
              ]).map(({ party, signed, role }) => {
                const sig = doc.signatures.find((s) => s.role === role)
                return (
                  <div key={role}>
                    <p>
                      {party.role}:{' '}
                      {signed ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check size={14} strokeWidth={3} />Semnat
                        </span>
                      ) : (
                        <span className="font-semibold text-[var(--text)]">În așteptare</span>
                      )}
                    </p>
                    {sig ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {sig.signedAt} · ref. <span className="font-mono">{sig.signatureRef}</span>
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
          Document generat de Clavium.ro · semnătură electronică calificată conformă eIDAS / Legea 214/2024.
        </p>
      </article>

      {auditTrail.length > 0 ? (
        <div className="rounded-4xl border border-[var(--border)] bg-[var(--card)] p-6 print:hidden">
          <h2 className="text-lg font-semibold">Istoric (audit)</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Jurnal inviolabil al evenimentelor (semnături, plăți, modificări).</p>
          <ol className="mt-4 space-y-3">
            {auditTrail.map((entry, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
                <div>
                  <p className="font-medium">{AUDIT_LABEL[entry.action] ?? entry.action}</p>
                  <p className="text-xs text-[var(--muted)]">{auditFmt.format(entry.createdAt)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {reviews.length > 0 || reviewEligibility.ok ? (
        <div className="space-y-4 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 print:hidden">
          <h2 className="text-lg font-semibold">Recenzii</h2>
          {reviews.map((r, i) => (
            <div key={i} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{r.authorName}</p>
                <Stars rating={r.rating} />
              </div>
              {r.comment ? <p className="mt-2 text-sm text-[var(--muted)]">{r.comment}</p> : null}
            </div>
          ))}
          {reviewEligibility.ok ? <ReviewForm contractId={doc.id} subjectName={reviewSubjectName} /> : null}
        </div>
      ) : null}

      <div className="space-y-4 print:hidden">
        {canEdit ? <ContractTermsForm contractId={doc.id} terms={terms} /> : null}
        {canEditSale ? <SaleTermsForm contractId={doc.id} terms={saleTerms} /> : null}
        <ContractActions contractId={doc.id} canSign={canSign} documentHash={documentHash} canPay={canPay} dueAmount={dueAmount} dueType={dueType} />
        {canAutopay ? <AutopayToggle contractId={doc.id} enabled={autopayEnabled} /> : null}
        {canTerminate ? <TerminateButton contractId={doc.id} /> : null}
        {canReturnDeposit ? <DepositReturnForm contractId={doc.id} deposit={depositAmount} /> : null}
        {canRenew ? <RenewForm contractId={doc.id} defaultMonths={terms.months} defaultRent={terms.rent} /> : null}
        {canCancelSale ? <CancelSaleButton contractId={doc.id} /> : null}
      </div>
    </section>
  )
}
