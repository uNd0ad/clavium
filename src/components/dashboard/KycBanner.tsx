import Link from 'next/link'
import { ShieldAlert, Clock } from 'lucide-react'

// Banner de onboarding afișat în tot dashboardul cât timp identitatea nu e verificată.
// Verificarea KYC e legată de crearea contului: conturile noi pornesc UNVERIFIED.
const STATES: Record<
  string,
  { icon: typeof ShieldAlert; title: string; text: string; cta: string | null; tone: string } | undefined
> = {
  UNVERIFIED: {
    icon: ShieldAlert,
    title: 'Verifică-ți identitatea',
    text: 'Finalizează verificarea identității (KYC) ca să-ți activezi complet contul.',
    cta: 'Verifică acum',
    tone: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  },
  REJECTED: {
    icon: ShieldAlert,
    title: 'Verificare respinsă',
    text: 'Verificarea identității nu a putut fi confirmată. Reia procesul cu documente clare.',
    cta: 'Reia verificarea',
    tone: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  },
  PENDING: {
    icon: Clock,
    title: 'Verificare în curs',
    text: 'Documentele tale sunt în curs de verificare. Te anunțăm imediat ce e gata.',
    cta: 'Vezi statutul',
    tone: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
  },
}

export default function KycBanner({ status }: { status: string }) {
  // Verificat → niciun banner.
  const state = STATES[status]
  if (!state) return null
  const Icon = state.icon

  return (
    <div className={`mx-auto mt-4 flex max-w-[1400px] flex-wrap items-center gap-3 rounded-3xl border px-5 py-3.5 text-sm font-medium lg:px-8 ${state.tone}`}>
      <Icon size={18} className="shrink-0" />
      <span className="font-semibold">{state.title}</span>
      <span className="opacity-90">{state.text}</span>
      {state.cta ? (
        <Link
          href="/dashboard/verificare"
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--brand)] px-4 py-1.5 text-xs font-semibold text-white"
        >
          {state.cta}
        </Link>
      ) : null}
    </div>
  )
}
