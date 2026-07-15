'use client'

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'vatrio_cookie_consent'

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function hasConsent() {
  return Boolean(window.localStorage.getItem(STORAGE_KEY))
}

export default function CookieBanner() {
  // Pe server raportăm consimțământ dat, ca bannerul să nu apară în HTML-ul SSR.
  const consented = useSyncExternalStore(subscribe, hasConsent, () => true)

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    listeners.forEach((listener) => listener())
  }

  if (consented) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Folosim un singur cookie strict necesar pentru autentificare. Fără tracking, fără publicitate.{' '}
          <a href="/confidentialitate" className="font-semibold text-[var(--brand)]">Află mai mult</a>
        </p>
        <button type="button" onClick={accept} className="btn-primary shrink-0 px-6 py-3 text-xs">
          Am înțeles
        </button>
      </div>
    </div>
  )
}
