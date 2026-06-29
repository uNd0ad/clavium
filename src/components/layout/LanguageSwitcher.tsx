'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/client'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/i18n/config'
import { setLocaleAction } from '@/app/actions/locale'

// Comutator de limbă RO/EN. Setează cookie-ul prin server action, apoi reîmprospătează ruta ca
// întreaga pagină (server + client) să se re-randeze în limba aleasă.
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const router = useRouter()
  const { locale, dict } = useI18n()
  const [pending, startTransition] = useTransition()

  const switchTo = (next: Locale) => {
    if (next === locale) return
    startTransition(async () => {
      await setLocaleAction(next)
      router.refresh()
    })
  }

  return (
    <div className={`inline-flex items-center rounded-full border border-[var(--border)] p-0.5 ${className}`} role="group" aria-label={dict.language.label}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          disabled={pending}
          aria-pressed={l === locale}
          className={`rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] transition disabled:opacity-60 ${
            l === locale ? 'bg-[var(--brand)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  )
}
