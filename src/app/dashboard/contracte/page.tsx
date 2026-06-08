import StatusBadge from '@/components/dashboard/StatusBadge'
import { dashboardContracts } from '@/types/dashboard'

export default function DashboardContractsPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Contracte</p>
        <h1 className="mt-3 text-3xl font-semibold">Contracte active și semnate</h1>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Verifică statutul semnăturilor</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Fiecare contract este analizat pentru semnătura clientului și a proprietarului.</p>
          </div>
          <StatusBadge label="QES activ" variant="info" />
        </div>

        <div className="mt-6 space-y-4">
          {dashboardContracts.map((contract) => (
            <div key={contract.property} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">{contract.property}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Chiriaș: {contract.tenant}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={contract.status} variant={contract.status === 'Activ' ? 'success' : 'warning'} />
                  <StatusBadge label={contract.qes ? 'QES' : 'Fără QES'} variant={contract.qes ? 'info' : 'warning'} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-[var(--surface)] p-4">
                  <p className="text-sm text-[var(--muted)]">Owner</p>
                  <p className="mt-2 font-semibold">{contract.signedByOwner ? 'Semnat' : 'În așteptare'}</p>
                </div>
                <div className="rounded-3xl bg-[var(--surface)] p-4">
                  <p className="text-sm text-[var(--muted)]">Client</p>
                  <p className="mt-2 font-semibold">{contract.signedByClient ? 'Semnat' : 'În așteptare'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
