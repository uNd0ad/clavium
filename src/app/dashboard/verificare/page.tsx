import { redirect } from 'next/navigation'
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import KycForm from '@/components/dashboard/KycForm'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const dateFmt = new Intl.DateTimeFormat('ro-RO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default async function KycVerificationPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const record = await prisma.kycVerification.findUnique({ where: { userId: user.id } })
  const status = user.kycStatus

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Verificare"
        title="Verificarea"
        accent="identității"
        description="Confirmă cine ești pentru a-ți activa complet contul (KYC)."
      />

      {status === 'VERIFIED' ? (
        <div className="rounded-4xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="flex items-center gap-2 text-lg font-semibold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck size={20} /> Identitate verificată
          </p>
          <p className="mt-2 text-sm text-emerald-700/90 dark:text-emerald-300/80">
            Contul tău a fost verificat
            {record?.verifiedAt ? ` pe ${dateFmt.format(record.verifiedAt)}` : ''}.
            {record ? (
              <>
                {' '}
                Furnizor: <span className="font-medium">{record.provider}</span> · referință{' '}
                <span className="font-mono text-xs">{record.reference}</span>
                {record.matchScore !== null ? <> · scor potrivire {record.matchScore.toFixed(3)}</> : null}
              </>
            ) : null}
          </p>
        </div>
      ) : (
        <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          {status === 'PENDING' ? (
            <p className="mb-4 flex items-center gap-2 rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
              <Clock size={16} /> Documentele tale sunt în curs de verificare.
            </p>
          ) : null}
          {status === 'REJECTED' ? (
            <p className="mb-4 flex items-center gap-2 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <ShieldAlert size={16} />
              {record?.rejectionReason || 'Verificarea anterioară a fost respinsă. Reia procesul cu documente clare.'}
            </p>
          ) : null}

          <h2 className="text-xl font-semibold">Verificare prin cameră</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Fotografiază actul tău de identitate și un selfie. Comparăm fața de pe act cu selfie-ul pentru a confirma că ești
            tu. Pe desktop folosim camera live; pe telefon, camera nativă (funcționează și fără HTTPS).
          </p>

          <div className="mt-6">
            <KycForm />
          </div>
        </div>
      )}
    </section>
  )
}
