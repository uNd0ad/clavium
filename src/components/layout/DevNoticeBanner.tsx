'use client'

import { useSyncExternalStore } from 'react'
import { Wrench, X } from 'lucide-react'
import { useDict } from '@/lib/i18n/client'

// Avertisment „versiune de dezvoltare" — anunță vizitatorii (inclusiv pe producție) că platforma
// nu e produsul finit. Același model ca CookieBanner: pe server raportăm „închis" (nu apare în
// HTML-ul SSR, deci fără mismatch la hidratare), pe client starea vine din sessionStorage —
// închiderea ține doar sesiunea curentă, ca vizitatorii care revin să vadă din nou anunțul.
// De șters din layout la lansarea produsului final.
const STORAGE_KEY = 'clavium_dev_notice_dismissed'

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function isDismissed() {
  try {
    return Boolean(window.sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

export default function DevNoticeBanner() {
  const dict = useDict()
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true)

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // sessionStorage indisponibil (ex. private mode strict) — bannerul rămâne vizibil
    }
    listeners.forEach((listener) => listener())
  }

  if (dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex max-w-xs items-center gap-3 rounded-3xl border border-amber-300 bg-amber-50 py-2.5 pl-4 pr-2 shadow-[var(--shadow)] dark:border-amber-500/40 dark:bg-amber-950/90">
      <Wrench size={15} className="shrink-0 text-amber-700 dark:text-amber-400" />
      <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">{dict.devNotice.message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={dict.devNotice.dismiss}
        className="shrink-0 rounded-full p-1.5 text-amber-700 transition hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
      >
        <X size={14} />
      </button>
    </div>
  )
}
